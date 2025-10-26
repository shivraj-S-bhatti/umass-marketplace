package edu.umass.marketplace.service;

import edu.umass.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.dto.ListingDto;
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
            String queryParam = hasQuery ? query.trim() : null;
            String categoryParam = hasCategory ? category.trim() : null;
            String statusParam = hasStatus ? status.trim() : null;

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
     * Create a new listing
     */
    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        log.debug("🔍 Creating new listing: {}", request.getTitle());
        
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
        listing.setCondition(Condition.fromDisplayName(request.getCondition()));
        listing.setStatus(Listing.STATUS_ACTIVE); // Explicitly set status
        listing.setSeller(dummySeller);

        Listing savedListing = listingRepository.save(listing);
        log.debug("🔍 Created listing with ID: {}", savedListing.getId());
        
        return ListingResponse.fromEntity(savedListing);
    }

    /**
     * Create multiple listings in bulk
     */
    @Transactional
    public List<ListingResponse> createListingsBulk(List<CreateListingRequest> requests) {
        log.debug("🔍 Creating {} listings in bulk", requests.size());
        
        // For now, create a dummy seller - in real app, get from authenticated user
        User dummySeller = userRepository.findByEmail("dummy@umass.edu")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("dummy@umass.edu");
                    user.setName("Dummy User");
                    return userRepository.save(user);
                });

        List<Listing> listings = requests.stream()
                .map(request -> {
                    Listing listing = new Listing();
                    listing.setTitle(request.getTitle());
                    listing.setDescription(request.getDescription());
                    listing.setPrice(request.getPrice());
                    listing.setCategory(request.getCategory());
                    listing.setCondition(Condition.fromDisplayName(request.getCondition()));
                    listing.setStatus(Listing.STATUS_ACTIVE);
                    listing.setSeller(dummySeller);
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

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setCategory(request.getCategory());
        listing.setCondition(Condition.fromDisplayName(request.getCondition()));

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
}
