package edu.umass.marketplace.marketplace.controller;

// Listing Controller - handles all listing-related API endpoints
// Provides CRUD operations for marketplace listings with pagination and filtering
import edu.umass.marketplace.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.marketplace.dto.BulkListingRequest;
import edu.umass.marketplace.marketplace.response.ListingResponse;
import edu.umass.marketplace.marketplace.response.StatsResponse;
import edu.umass.marketplace.marketplace.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Listings", description = "Marketplace listing management")
public class ListingController {

    private final ListingService listingService;

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
            @Parameter(description = "Condition filter (comma-separated for multiple)") @RequestParam(required = false) String condition
    ) {
        return listingService.getListings(q, category, status, condition, minPrice, maxPrice, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID", description = "Retrieve a specific listing by its ID")
    public ListingResponse getListingById(@PathVariable UUID id) {
        return listingService.getListingById(id);
    }

    @PostMapping
    @Operation(summary = "Create listing", description = "Create a new marketplace listing")
    public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody CreateListingRequest request, java.security.Principal principal) {
        ListingResponse listing = listingService.createListing(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(listing);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple listings", description = "Create multiple marketplace listings in bulk")
    public ResponseEntity<List<ListingResponse>> createListingsBulk(
            @RequestBody BulkListingRequest bulkRequest, 
            java.security.Principal principal) {
        List<ListingResponse> listings = listingService.createListingsBulk(bulkRequest.getListings(), principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(listings);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update listing", description = "Update an existing marketplace listing")
    public ListingResponse updateListing(@PathVariable UUID id, @Valid @RequestBody CreateListingRequest request,
                                         java.security.Principal principal) {
        return listingService.updateListing(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete listing", description = "Delete a marketplace listing")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID id, java.security.Principal principal) {
        listingService.deleteListing(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seller/{sellerId}")
    @Operation(summary = "Get listings by seller", description = "Retrieve all listings for a specific seller")
    public Page<ListingResponse> getListingsBySeller(
            @PathVariable UUID sellerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size
    ) {
        return listingService.getListingsBySeller(sellerId, page, size);
    }

    @GetMapping("/seller/{sellerId}/stats")
    @Operation(summary = "Get listing statistics by seller", description = "Retrieve counts of listings by status for a specific seller")
    public StatsResponse getListingStatsBySeller(@PathVariable UUID sellerId) {
        return listingService.getListingStatsBySeller(sellerId);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get listing statistics", description = "Retrieve counts of listings by status")
    public StatsResponse getListingStats() {
        return listingService.getListingStats();
    }
}
