package edu.umass.marketplace.controller;

// Listing Controller - handles all listing-related API endpoints
// Provides CRUD operations for marketplace listings with pagination and filtering
import edu.umass.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.dto.ListingResponse;
import edu.umass.marketplace.model.Listing;
import edu.umass.marketplace.model.User;
import edu.umass.marketplace.repository.ListingRepository;
import edu.umass.marketplace.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Tag(name = "Listings", description = "Marketplace listing management")
public class ListingController {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get listings", description = "Retrieve paginated listings with optional filtering and search")
    public Page<ListingResponse> getListings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Minimum price") @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) Double maxPrice,
            @Parameter(description = "Condition filter") @RequestParam(required = false) String condition
    ) {
        // Debug logging
        System.out.println("🔍 Search parameters received:");
        System.out.println("  q: '" + q + "'");
        System.out.println("  category: '" + category + "'");
        System.out.println("  status: '" + status + "'");
        System.out.println("  condition: '" + condition + "'");
        System.out.println("  minPrice: " + minPrice);
        System.out.println("  maxPrice: " + maxPrice);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Convert Double to BigDecimal for price filtering
        java.math.BigDecimal minPriceBD = minPrice != null ? java.math.BigDecimal.valueOf(minPrice) : null;
        java.math.BigDecimal maxPriceBD = maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null;

        Page<Listing> listings;

        // Use advanced filtering if any filters are provided
        // Check for non-null and non-empty values
        boolean hasQuery = q != null && !q.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasCondition = condition != null && !condition.trim().isEmpty();
        boolean hasMinPrice = minPrice != null;
        boolean hasMaxPrice = maxPrice != null;

        if (hasQuery || hasCategory || hasStatus || hasCondition || hasMinPrice || hasMaxPrice) {
            // Pass null for empty strings to the repository
            String queryParam = hasQuery ? q.trim() : null;
            String categoryParam = hasCategory ? category.trim() : null;
            String statusParam = hasStatus ? status.trim() : null;
            String conditionParam = hasCondition ? condition.trim() : null;

            System.out.println("🔍 Using filtered query with params:");
            System.out.println("  queryParam: '" + queryParam + "'");
            System.out.println("  categoryParam: '" + categoryParam + "'");
            System.out.println("  statusParam: '" + statusParam + "'");
            System.out.println("  conditionParam: '" + conditionParam + "'");

            listings = listingRepository.findWithFilters(queryParam, categoryParam, statusParam, conditionParam, minPriceBD, maxPriceBD, pageable);
        } else {
            // Return all listings if no filters
            System.out.println("🔍 No filters detected, returning all listings");
            listings = listingRepository.findAll(pageable);
        }

        System.out.println("🔍 Query result: " + listings.getTotalElements() + " listings found");
        return listings.map(ListingResponse::fromEntity);
    }

    @PostMapping
    @Operation(summary = "Create listing", description = "Create a new marketplace listing")
    public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody CreateListingRequest request) {
        // For now, create a dummy seller - in real app, get from authenticated user
        User dummySeller = userRepository.findByEmail("dummy@umass.edu")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("dummy@umass.edu");
                    user.setName("Dummy User");
                    return userRepository.save(user);
                });

        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setCondition(request.getCondition());
        listing.setStatus(Listing.STATUS_ACTIVE); // Explicitly set status
        listing.setSeller(dummySeller);

        Listing savedListing = listingRepository.save(listing);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ListingResponse.fromEntity(savedListing));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple listings", description = "Create multiple marketplace listings in bulk")
    public ResponseEntity<List<ListingResponse>> createBulkListings(@Valid @RequestBody List<CreateListingRequest> requests) {
        // Get dummy seller (same as single creation)
        User dummySeller = userRepository.findByEmail("dummy@umass.edu")
            .orElseGet(() -> {
                User user = new User();
                user.setEmail("dummy@umass.edu");
                user.setName("Dummy User");
                return userRepository.save(user);
            });

        // Map requests to entities
        List<Listing> listings = requests.stream()
            .map(request -> {
                Listing listing = new Listing();
                listing.setTitle(request.getTitle());
                listing.setDescription(request.getDescription());
                listing.setPrice(request.getPrice());
                listing.setCategory(request.getCategory());
                listing.setCondition(request.getCondition());
                listing.setStatus(Listing.STATUS_ACTIVE);
                listing.setSeller(dummySeller);
                return listing;
            })
            .collect(Collectors.toList());

        // Save all (uses saveAll for batch insert efficiency)
        List<Listing> savedListings = listingRepository.saveAll(listings);

        // Map to responses
        List<ListingResponse> responses = savedListings.stream()
            .map(ListingResponse::fromEntity)
            .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }
    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID", description = "Retrieve a specific listing by its ID")
    public ResponseEntity<ListingResponse> getListing(@PathVariable UUID id) {
        return listingRepository.findById(id)
                .map(ListingResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
