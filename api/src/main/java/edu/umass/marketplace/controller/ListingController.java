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

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Tag(name = "Listings", description = "Marketplace listing management")
public class ListingController {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get listings", description = "Retrieve paginated listings with optional filtering")
    public Page<ListingResponse> getListings(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Minimum price") @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) Double maxPrice
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // For now, just return all listings - filtering will be added later
        Page<Listing> listings = listingRepository.findAll(pageable);

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

    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID", description = "Retrieve a specific listing by its ID")
    public ResponseEntity<ListingResponse> getListing(@PathVariable UUID id) {
        return listingRepository.findById(id)
                .map(ListingResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
