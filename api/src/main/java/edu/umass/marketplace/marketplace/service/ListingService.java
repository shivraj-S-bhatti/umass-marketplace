package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.marketplace.model.Condition;
import edu.umass.marketplace.marketplace.response.ListingResponse;
import edu.umass.marketplace.marketplace.model.Listing;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.ListingRepository;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;

    @Transactional
    public ListingResponse createListing(CreateListingRequest request, java.security.Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Authentication required to create a listing.");
        }

        String email = principal.getName();
        User seller = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                "User not found in database. Please try logging in again."));

        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setCondition(Condition.fromDisplayName(request.getCondition()));
        
        // Defer image upload until after save so we have the real listing ID for S3 key (listings/{id}/...)
        String imageUrlFromRequest = request.getImageUrl();
        listing.setImageUrl(null);
        
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());
        // Parse mustGoBy from ISO 8601 string if provided
        if (request.getMustGoBy() != null && !request.getMustGoBy().trim().isEmpty()) {
            try {
                listing.setMustGoBy(java.time.OffsetDateTime.parse(request.getMustGoBy()));
            } catch (Exception e) {
                log.warn("Failed to parse mustGoBy date: {}", request.getMustGoBy(), e);
            }
        }
        listing.setStatus(Listing.STATUS_ACTIVE); // Explicitly set status
        listing.setSeller(seller);

        Listing savedListing = listingRepository.save(listing);
        
        // Upload image with actual listing ID so S3 key is listings/{actualId}/...
        if (imageUrlFromRequest != null && !imageUrlFromRequest.trim().isEmpty()) {
            try {
                String processedImageUrl = imageService.compressAndUpload(imageUrlFromRequest.trim(), savedListing.getId());
                savedListing.setImageUrl(processedImageUrl);
                listingRepository.save(savedListing);
                log.debug("🔍 Processed image with listing ID {}, final size: {} characters",
                    savedListing.getId(), processedImageUrl != null ? processedImageUrl.length() : 0);
            } catch (Exception e) {
                log.error("Error processing image: {}", e.getMessage(), e);
                // Leave imageUrl null; listing is already saved
            }
        }
        log.debug("🔍 Created listing with ID: {}", savedListing.getId());
        
        // Ensure seller is loaded (eager fetch to avoid lazy loading issues)
        if (savedListing.getSeller() != null) {
            // Access seller fields to trigger lazy loading within transaction
            savedListing.getSeller().getName();
            savedListing.getSeller().getEmail();
        }

        try {
            ListingResponse response = ListingResponse.fromEntity(savedListing);
            log.debug("🔍 Successfully created ListingResponse");
            return response;
        } catch (Exception e) {
            log.error("❌ Error creating ListingResponse: {}", e.getMessage(), e);
            log.error("❌ Stack trace: ", e);
            throw new RuntimeException("Failed to create listing response: " + e.getMessage(), e);
        }
    }

    /**
     * Get paginated listings with optional filtering and search
     */
    public Page<ListingResponse> getListings(
            String query,
            String category,
            String status,
            String condition,
            Double minPrice,
            Double maxPrice,
            int page,
            int size
    ) {
        log.debug("🔍 Search parameters received:");
        log.debug("  q: '{}'", query);
        log.debug("  category: '{}'", category);
        log.debug("  status: '{}'", status);
        log.debug("  condition: '{}'", condition);
        log.debug("  minPrice: {}", minPrice);
        log.debug("  maxPrice: {}", maxPrice);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Convert Double to BigDecimal for price filtering
        BigDecimal minPriceBD = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal maxPriceBD = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;

        // Parse condition parameter - can be comma-separated for multiple values
        List<Condition> conditionParams = null;
        if (condition != null && !condition.trim().isEmpty()) {
            String[] conditionValues = condition.split(",");
            conditionParams = new ArrayList<>();
            for (String cond : conditionValues) {
                Condition parsedCondition = Condition.fromDisplayName(cond.trim());
                if (parsedCondition != null) {
                    conditionParams.add(parsedCondition);
                }
            }
            if (conditionParams.isEmpty()) {
                conditionParams = null;
            }
        }

        // Check if any filters are active
        boolean hasQuery = query != null && !query.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasCondition = conditionParams != null && !conditionParams.isEmpty();
        boolean hasMinPrice = minPriceBD != null;
        boolean hasMaxPrice = maxPriceBD != null;

        Page<Listing> listings;

        if (hasQuery || hasCategory || hasStatus || hasCondition || hasMinPrice || hasMaxPrice) {
            // Pass null for empty strings to the repository
            String queryParam = hasQuery && query != null ? query.trim() : null;
            String categoryParam = hasCategory && category != null ? category.trim() : null;
            String statusParam = hasStatus && status != null ? status.trim() : null;

            log.debug("🔍 Using filtered query with params:");
            log.debug("  queryParam: '{}'", queryParam);
            log.debug("  categoryParam: '{}'", categoryParam);
            log.debug("  statusParam: '{}'", statusParam);
            log.debug("  conditionParams: '{}'", conditionParams);

            listings = listingRepository.findWithFilters(queryParam, categoryParam, statusParam, conditionParams, minPriceBD, maxPriceBD, pageable);
        } else {
            // Return all listings if no filters
            log.debug("🔍 No filters detected, returning all listings");
            listings = listingRepository.findAll(pageable);
        }

        log.debug("🔍 Query result: {} listings found", listings.getTotalElements());
        return listings.map(ListingResponse::fromEntity);
    }

    /**
     * Get a single listing by ID
     */
    public ListingResponse getListingById(UUID id) {
        log.debug("🔍 Getting listing by ID: {}", id);
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
        return ListingResponse.fromEntity(listing);
    }

    /**
     * Create multiple listings in bulk
     */
    @Transactional
    public List<ListingResponse> createListingsBulk(List<CreateListingRequest> requests, java.security.Principal principal) {
        log.debug("🔍 Creating {} listings in bulk", requests.size());

        if (requests == null || requests.isEmpty()) {
            throw new RuntimeException("Request list cannot be empty");
        }

        if (principal == null || principal.getName() == null || principal.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Authentication required to create listings.");
        }
        String email = principal.getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found in database. Please try logging in again."));

        // Validate each request
        for (int i = 0; i < requests.size(); i++) {
            CreateListingRequest req = requests.get(i);
            if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
                throw new RuntimeException("Row " + (i + 1) + ": Title is required");
            }
            if (req.getPrice() == null) {
                throw new RuntimeException("Row " + (i + 1) + ": Price is required");
            }
            if (req.getPrice().doubleValue() <= 0) {
                throw new RuntimeException("Row " + (i + 1) + ": Price must be greater than 0");
            }
        }

        // Build listings without uploading images so we get real IDs from save
        List<Listing> listings = requests.stream()
                .map(request -> {
                    Listing listing = new Listing();
                    listing.setTitle(request.getTitle());
                    listing.setDescription(request.getDescription());
                    listing.setPrice(request.getPrice());
                    listing.setCategory(request.getCategory());
                    listing.setCondition(Condition.fromDisplayName(request.getCondition()));
                    listing.setImageUrl(null); // set after save so S3 key uses actual listing ID
                    listing.setLatitude(request.getLatitude());
                    listing.setLongitude(request.getLongitude());
                    if (request.getMustGoBy() != null && !request.getMustGoBy().trim().isEmpty()) {
                        try {
                            listing.setMustGoBy(java.time.OffsetDateTime.parse(request.getMustGoBy()));
                        } catch (Exception e) {
                            log.warn("Failed to parse mustGoBy date: {}", request.getMustGoBy(), e);
                        }
                    }
                    listing.setStatus(Listing.STATUS_ACTIVE);
                    listing.setSeller(seller);
                    return listing;
                })
                .collect(Collectors.toList());

        List<Listing> savedListings = listingRepository.saveAll(listings);
        log.debug("🔍 Created {} listings successfully", savedListings.size());

        // Upload images using actual listing IDs (listings/{id}/...)
        for (int i = 0; i < savedListings.size(); i++) {
            String bulkImageUrl = requests.get(i).getImageUrl();
            if (bulkImageUrl != null && !bulkImageUrl.trim().isEmpty()) {
                Listing listing = savedListings.get(i);
                try {
                    String processedImageUrl = imageService.compressAndUpload(bulkImageUrl.trim(), listing.getId());
                    listing.setImageUrl(processedImageUrl);
                    listingRepository.save(listing);
                    log.debug("🔍 Bulk listing image processed for listing ID {}", listing.getId());
                } catch (Exception e) {
                    log.error("Error processing bulk image: {}", e.getMessage(), e);
                    listing.setImageUrl(bulkImageUrl.trim());
                    listingRepository.save(listing);
                }
            }
        }

        return savedListings.stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update a listing
     */
    @Transactional
    public ListingResponse updateListing(UUID id, CreateListingRequest request) {
        log.debug("🔍 Updating listing with ID: {}", id);

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        // Update status if provided
        if (request.getStatus() != null) {
            log.debug("🔍 Updating listing status from {} to {}", listing.getStatus(), request.getStatus());
            listing.setStatus(request.getStatus());
        }

        // Update other fields if provided
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            listing.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription().trim().isEmpty() ? null : request.getDescription());
        }
        if (request.getPrice() != null) {
            listing.setPrice(request.getPrice());
        }
        if (request.getCategory() != null) {
            listing.setCategory(request.getCategory().trim().isEmpty() ? null : request.getCategory());
        }
        if (request.getCondition() != null && !request.getCondition().trim().isEmpty()) {
            Condition condition = Condition.fromDisplayName(request.getCondition());
            listing.setCondition(condition);
        }
        if (request.getImageUrl() != null) {
            // Update imageUrl: empty string clears image (sets to null), non-empty sets new image
            String imageUrl = request.getImageUrl().trim();
            if (imageUrl.isEmpty()) {
                // Delete old image from S3 if it exists
                if (listing.getImageUrl() != null && listing.getImageUrl().startsWith("https://")) {
                    imageService.deleteImage(listing.getImageUrl());
                }
                listing.setImageUrl(null);
            } else {
                // Compress and upload new image
                try {
                    String processedImageUrl = imageService.compressAndUpload(imageUrl, listing.getId());
                    listing.setImageUrl(processedImageUrl);
                } catch (Exception e) {
                    log.error("Error processing image update: {}", e.getMessage(), e);
                    listing.setImageUrl(imageUrl);
                }
            }
        }
        if (request.getLatitude() != null) {
            listing.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            listing.setLongitude(request.getLongitude());
        }
        if (request.getMustGoBy() != null) {
            // Allow empty string to clear mustGoBy, or set new date
            String mustGoByStr = request.getMustGoBy().trim();
            if (mustGoByStr.isEmpty()) {
                listing.setMustGoBy(null);
            } else {
                try {
                    listing.setMustGoBy(java.time.OffsetDateTime.parse(mustGoByStr));
                } catch (Exception e) {
                    log.warn("Failed to parse mustGoBy date: {}", mustGoByStr, e);
                }
            }
        }

        Listing savedListing = listingRepository.save(listing);
        log.debug("🔍 Updated listing with ID: {}", savedListing.getId());

        return ListingResponse.fromEntity(savedListing);
    }

    /**
     * Delete a listing
     */
    @Transactional
    public void deleteListing(UUID id) {
        log.debug("🔍 Deleting listing with ID: {}", id);

        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        // Delete associated image from S3 if it exists
        if (listing.getImageUrl() != null && listing.getImageUrl().startsWith("https://")) {
            try {
                imageService.deleteImage(listing.getImageUrl());
            } catch (Exception e) {
                log.warn("Failed to delete image for listing {}: {}", id, e.getMessage());
            }
        }

        listingRepository.deleteById(id);
        log.debug("🔍 Deleted listing with ID: {}", id);
    }

    /**
     * Get listings by seller ID
     */
    public Page<ListingResponse> getListingsBySeller(UUID sellerId, int page, int size) {
        log.debug("🔍 Getting listings for seller ID: {}", sellerId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listings = listingRepository.findBySellerId(sellerId, pageable);

        log.debug("🔍 Found {} listings for seller ID: {}", listings.getTotalElements(), sellerId);
        return listings.map(ListingResponse::fromEntity);
    }

    /**
     * Get listing statistics (counts by status)
     */
    @Transactional(readOnly = true)
    public edu.umass.marketplace.marketplace.response.StatsResponse getListingStats() {
        log.debug("🔍 Getting listing statistics");

        long activeCount = listingRepository.countByStatus(Listing.STATUS_ACTIVE);
        long soldCount = listingRepository.countByStatus(Listing.STATUS_SOLD);
        long onHoldCount = listingRepository.countByStatus(Listing.STATUS_ON_HOLD);

        log.debug("🔍 Stats - Active: {}, Sold: {}, On Hold: {}", activeCount, soldCount, onHoldCount);

        return new edu.umass.marketplace.marketplace.response.StatsResponse(activeCount, soldCount, onHoldCount);
    }
}
