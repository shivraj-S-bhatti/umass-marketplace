package edu.umass.marketplace.service;

import edu.umass.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.model.Condition;
import edu.umass.marketplace.response.ListingResponse;
import edu.umass.marketplace.model.Listing;
import edu.umass.marketplace.model.User;
import edu.umass.marketplace.repository.ListingRepository;
import edu.umass.marketplace.repository.UserRepository;
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

    /**
     * Helper to get the current authenticated user from the security context
     */
    private User getCurrentAuthenticatedUser() {
        // Uses Spring Security to get the current principal
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email = null;
        String name = null;
        String pictureUrl = null;

        if (principal instanceof edu.umass.marketplace.security.UserPrincipal userPrincipal) {
            email = userPrincipal.getEmail();
            name = userPrincipal.getName();
            pictureUrl = userPrincipal.getPictureUrl();
        } else if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
            email = springUser.getUsername();
        } else if (principal instanceof String principalStr) {
            email = principalStr;
        }

        if (email == null) return null;

        // Try to find existing user; if not found, create one from principal info
        var opt = userRepository.findByEmail(email);
        if (opt.isPresent()) return opt.get();

        User u = new User();
        u.setEmail(email);
        u.setName(name != null ? name : "Unknown User");
        u.setPictureUrl(pictureUrl);
        return userRepository.save(u);
    }

    @Transactional
    public ListingResponse createListing(CreateListingRequest request, java.security.Principal principal) {
        // Get seller from authenticated principal
        if (principal == null) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                "Authentication required to create a listing");
        }

        String email = principal.getName();
        if (email == null || email.trim().isEmpty()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                "User email not found in authentication token");
        }

        User seller = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                "User not found in database. Please try logging in again."));

        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setCondition(Condition.fromDisplayName(request.getCondition()));
        listing.setImageUrl(request.getImageUrl());
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());
        listing.setStatus(Listing.STATUS_ACTIVE); // Explicitly set status
        listing.setSeller(seller);

        Listing savedListing = listingRepository.save(listing);
        log.debug("🔍 Created listing with ID: {}", savedListing.getId());

        return ListingResponse.fromEntity(savedListing);
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
    public List<ListingResponse> createListingsBulk(List<CreateListingRequest> requests) {
        log.debug("🔍 Creating {} listings in bulk", requests.size());

        // Get seller from authenticated user context (OAuth2)
        User seller = getCurrentAuthenticatedUser();
        if (seller == null) {
            throw new RuntimeException("Authenticated user not found. Cannot create listings in bulk.");
        }

        List<Listing> listings = requests.stream()
                .map(request -> {
                    Listing listing = new Listing();
                    listing.setTitle(request.getTitle());
                    listing.setDescription(request.getDescription());
                    listing.setPrice(request.getPrice());
                    listing.setCategory(request.getCategory());
                    listing.setCondition(Condition.fromDisplayName(request.getCondition()));
                    listing.setImageUrl(request.getImageUrl());
                    listing.setLatitude(request.getLatitude());
                    listing.setLongitude(request.getLongitude());
                    listing.setStatus(Listing.STATUS_ACTIVE);
                    listing.setSeller(seller);
                    return listing;
                })
                .collect(Collectors.toList());

        List<Listing> savedListings = listingRepository.saveAll(listings);
        log.debug("🔍 Created {} listings successfully", savedListings.size());

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
            // Allow empty string to clear image, or set new image
            String imageUrl = request.getImageUrl().trim();
            listing.setImageUrl(imageUrl.isEmpty() ? null : imageUrl);
        }
        if (request.getLatitude() != null) {
            listing.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            listing.setLongitude(request.getLongitude());
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

        if (!listingRepository.existsById(id)) {
            throw new RuntimeException("Listing not found with id: " + id);
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
    public edu.umass.marketplace.response.StatsResponse getListingStats() {
        log.debug("🔍 Getting listing statistics");

        long activeCount = listingRepository.countByStatus(Listing.STATUS_ACTIVE);
        long soldCount = listingRepository.countByStatus(Listing.STATUS_SOLD);
        long onHoldCount = listingRepository.countByStatus(Listing.STATUS_ON_HOLD);

        log.debug("🔍 Stats - Active: {}, Sold: {}, On Hold: {}", activeCount, soldCount, onHoldCount);

        return new edu.umass.marketplace.response.StatsResponse(activeCount, soldCount, onHoldCount);
    }
}
