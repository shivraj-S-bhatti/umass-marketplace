package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.common.config.SuperuserConfig;
import edu.umass.marketplace.marketplace.dto.CreateListingRequest;
import edu.umass.marketplace.marketplace.dto.ListingExternalLinkRequest;
import edu.umass.marketplace.marketplace.model.Condition;
import edu.umass.marketplace.marketplace.model.Listing;
import edu.umass.marketplace.marketplace.model.ListingExternalLink;
import edu.umass.marketplace.marketplace.model.ListingImage;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.ChatRepository;
import edu.umass.marketplace.marketplace.repository.ListingRepository;
import edu.umass.marketplace.marketplace.repository.MessageRepository;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import edu.umass.marketplace.marketplace.response.ListingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingService {

    private static final int MAX_GALLERY_IMAGES = 8;
    private static final int MAX_EXTERNAL_LINKS = 12;

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ImageService imageService;
    private final SuperuserConfig superuserConfig;

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
        applyRequestToListing(listing, request, true);
        listing.setSeller(seller);

        Listing savedListing = listingRepository.save(listing);

        syncImages(savedListing, request, false);
        syncExternalLinks(savedListing, request);
        savedListing = listingRepository.save(savedListing);
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
            String kind,
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
        log.debug("  kind: '{}'", kind);
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
        boolean hasKind = kind != null && !kind.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasCondition = conditionParams != null && !conditionParams.isEmpty();
        boolean hasMinPrice = minPriceBD != null;
        boolean hasMaxPrice = maxPriceBD != null;

        Page<Listing> listings;

        if (hasQuery || hasKind || hasCategory || hasStatus || hasCondition || hasMinPrice || hasMaxPrice) {
            // Pass null for empty strings to the repository
            String queryParam = hasQuery && query != null ? query.trim() : null;
            String kindParam = hasKind && kind != null ? normalizeUpper(kind) : null;
            String categoryParam = hasCategory && category != null ? category.trim() : null;
            String statusParam = hasStatus && status != null ? status.trim() : null;

            log.debug("🔍 Using filtered query with params:");
            log.debug("  queryParam: '{}'", queryParam);
            log.debug("  kindParam: '{}'", kindParam);
            log.debug("  categoryParam: '{}'", categoryParam);
            log.debug("  statusParam: '{}'", statusParam);
            log.debug("  conditionParams: '{}'", conditionParams);

            listings = listingRepository.findWithFilters(queryParam, kindParam, categoryParam, statusParam, conditionParams, minPriceBD, maxPriceBD, pageable);
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
                    applyRequestToListing(listing, request, true);
                    listing.setSeller(seller);
                    return listing;
                })
                .collect(Collectors.toList());

        List<Listing> savedListings = listingRepository.saveAll(listings);
        log.debug("🔍 Created {} listings successfully", savedListings.size());

        for (int i = 0; i < savedListings.size(); i++) {
            Listing listing = savedListings.get(i);
            CreateListingRequest request = requests.get(i);
            syncImages(listing, request, false);
            syncExternalLinks(listing, request);
            listingRepository.save(listing);
        }

        return savedListings.stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update a listing
     */
    @Transactional
    public ListingResponse updateListing(UUID id, CreateListingRequest request, java.security.Principal principal) {
        log.debug("🔍 Updating listing with ID: {}", id);

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        String callerEmail = principal != null ? principal.getName() : null;
        boolean isSuperuser = superuserConfig.isSuperuser(callerEmail);
        boolean isOwner = listing.getSeller() != null && listing.getSeller().getEmail() != null
                && listing.getSeller().getEmail().equals(callerEmail);
        if (!isOwner && !isSuperuser) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to update this listing");
        }

        applyRequestToListing(listing, request, false);
        syncImages(listing, request, true);
        syncExternalLinks(listing, request);

        Listing savedListing = listingRepository.save(listing);
        log.debug("🔍 Updated listing with ID: {}", savedListing.getId());

        return ListingResponse.fromEntity(savedListing);
    }

    /**
     * Delete a listing. Caller must be the listing owner or a superuser (app.superuser-email from env).
     */
    @Transactional
    public void deleteListing(UUID id, java.security.Principal principal) {
        log.debug("🔍 Deleting listing with ID: {}", id);

        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));

        String callerEmail = principal != null ? principal.getName() : null;
        boolean isSuperuser = superuserConfig.isSuperuser(callerEmail);
        boolean isOwner = listing.getSeller() != null && listing.getSeller().getEmail() != null
            && listing.getSeller().getEmail().equals(callerEmail);
        if (!isOwner && !isSuperuser) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to delete this listing");
        }

        deleteListingImagesFromStorage(listing);

        // 1:1 conversation model: preserve chat history and only clear listing references.
        messageRepository.clearSharedListingByListingId(id);
        chatRepository.clearListingContextByListingId(id);
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

    /**
     * Get listing statistics for a specific seller (counts by status)
     */
    @Transactional(readOnly = true)
    public edu.umass.marketplace.marketplace.response.StatsResponse getListingStatsBySeller(UUID sellerId) {
        log.debug("🔍 Getting listing statistics for seller ID: {}", sellerId);

        long activeCount = listingRepository.countBySellerIdAndStatus(sellerId, Listing.STATUS_ACTIVE);
        long soldCount = listingRepository.countBySellerIdAndStatus(sellerId, Listing.STATUS_SOLD);
        long onHoldCount = listingRepository.countBySellerIdAndStatus(sellerId, Listing.STATUS_ON_HOLD);

        log.debug("🔍 Seller {} stats - Active: {}, Sold: {}, On Hold: {}", sellerId, activeCount, soldCount, onHoldCount);

        return new edu.umass.marketplace.marketplace.response.StatsResponse(activeCount, soldCount, onHoldCount);
    }

    private void applyRequestToListing(Listing listing, CreateListingRequest request, boolean creating) {
        String normalizedKind = normalizeListingKind(request.getKind());
        if (creating) {
            listing.setStatus(normalizeStatus(request.getStatus(), Listing.STATUS_ACTIVE));
            listing.setKind(normalizedKind);
        } else {
            if (request.getStatus() != null) {
                listing.setStatus(normalizeStatus(request.getStatus(), listing.getStatus()));
            }
            if (request.getKind() != null) {
                listing.setKind(normalizedKind);
            }
        }

        if (creating || hasText(request.getTitle())) {
            listing.setTitle(request.getTitle());
        }
        if (creating || request.getDescription() != null) {
            listing.setDescription(normalizeNullable(request.getDescription()));
        }
        if (creating || request.getPrice() != null) {
            listing.setPrice(request.getPrice());
        }
        if (creating || request.getCategory() != null) {
            listing.setCategory(normalizeNullable(request.getCategory()));
        }
        if (creating || request.getCondition() != null) {
            listing.setCondition(hasText(request.getCondition()) ? Condition.fromDisplayName(request.getCondition()) : null);
        }
        if (creating || request.getLatitude() != null) {
            listing.setLatitude(request.getLatitude());
        }
        if (creating || request.getLongitude() != null) {
            listing.setLongitude(request.getLongitude());
        }
        if (creating || request.getMustGoBy() != null) {
            listing.setMustGoBy(parseOffsetDateTime(request.getMustGoBy()));
        }

        if (Listing.KIND_LEASING.equals(listing.getKind())) {
            applyLeasingFields(listing, request, creating);
        } else {
            clearLeasingFields(listing);
        }
    }

    private void applyLeasingFields(Listing listing, CreateListingRequest request, boolean creating) {
        if (creating) {
            validateLeasingRequest(request);
        }

        if (creating || request.getLeaseArrangement() != null) {
            listing.setLeaseArrangement(normalizeUpper(request.getLeaseArrangement()));
        }
        if (creating || request.getSpaceType() != null) {
            listing.setSpaceType(normalizeUpper(request.getSpaceType()));
        }
        if (creating || request.getTransferScope() != null) {
            String transferScope = normalizeUpper(request.getTransferScope());
            if (!"LEASE_TRANSFER".equals(listing.getLeaseArrangement())) {
                transferScope = null;
            }
            listing.setTransferScope(transferScope);
        }
        if (creating || request.getPropertyName() != null) {
            listing.setPropertyName(normalizeNullable(request.getPropertyName()));
        }
        if (creating || request.getAreaLabel() != null) {
            listing.setAreaLabel(normalizeNullable(request.getAreaLabel()));
        }
        if (creating || request.getAvailableFrom() != null) {
            listing.setAvailableFrom(parseLocalDate(request.getAvailableFrom()));
        }
        if (creating || request.getLeaseEnd() != null) {
            listing.setLeaseEnd(parseLocalDate(request.getLeaseEnd()));
        }
        if (creating || request.getBedrooms() != null) {
            listing.setBedrooms(request.getBedrooms());
        }
        if (creating || request.getBathrooms() != null) {
            listing.setBathrooms(request.getBathrooms());
        }
        if (creating || request.getNearestBusStopName() != null) {
            listing.setNearestBusStopName(normalizeNullable(request.getNearestBusStopName()));
        }
        if (creating || request.getNearestBusStopWalkMinutes() != null) {
            listing.setNearestBusStopWalkMinutes(request.getNearestBusStopWalkMinutes());
        }
        if (creating || request.getBusRoutes() != null) {
            listing.setBusRoutes(normalizeList(request.getBusRoutes()));
        }
        if (creating || request.getIncludedUtilities() != null) {
            listing.setIncludedUtilities(normalizeList(request.getIncludedUtilities()));
        }
        if (creating || request.getEstimatedUtilitiesMonthlyTotal() != null) {
            listing.setEstimatedUtilitiesMonthlyTotal(request.getEstimatedUtilitiesMonthlyTotal());
        }
        if (creating || request.getElectricityEstimate() != null) {
            listing.setElectricityEstimate(request.getElectricityEstimate());
        }
        if (creating || request.getGasEstimate() != null) {
            listing.setGasEstimate(request.getGasEstimate());
        }
        if (creating || request.getWaterEstimate() != null) {
            listing.setWaterEstimate(request.getWaterEstimate());
        }
        if (creating || request.getInternetEstimate() != null) {
            listing.setInternetEstimate(request.getInternetEstimate());
        }
        if (creating || request.getLaundryType() != null) {
            listing.setLaundryType(normalizeUpper(request.getLaundryType()));
        }
        if (creating || request.getAmenities() != null) {
            listing.setAmenities(normalizeList(request.getAmenities()));
        }
        if (creating || request.getCleaningNotes() != null) {
            listing.setCleaningNotes(normalizeNullable(request.getCleaningNotes()));
        }
    }

    private void clearLeasingFields(Listing listing) {
        listing.setLeaseArrangement(null);
        listing.setTransferScope(null);
        listing.setSpaceType(null);
        listing.setPropertyName(null);
        listing.setAreaLabel(null);
        listing.setAvailableFrom(null);
        listing.setLeaseEnd(null);
        listing.setBedrooms(null);
        listing.setBathrooms(null);
        listing.setNearestBusStopName(null);
        listing.setNearestBusStopWalkMinutes(null);
        listing.setBusRoutes(new ArrayList<>());
        listing.setIncludedUtilities(new ArrayList<>());
        listing.setEstimatedUtilitiesMonthlyTotal(null);
        listing.setElectricityEstimate(null);
        listing.setGasEstimate(null);
        listing.setWaterEstimate(null);
        listing.setInternetEstimate(null);
        listing.setLaundryType(null);
        listing.setAmenities(new ArrayList<>());
        listing.setCleaningNotes(null);
    }

    private void validateLeasingRequest(CreateListingRequest request) {
        if (!hasText(request.getLeaseArrangement())) {
            throw new IllegalArgumentException("Lease arrangement is required for leasing listings.");
        }
        if ("LEASE_TRANSFER".equals(normalizeUpper(request.getLeaseArrangement())) && !hasText(request.getTransferScope())) {
            throw new IllegalArgumentException("Transfer scope is required for lease transfer listings.");
        }
        if (!hasText(request.getSpaceType())) {
            throw new IllegalArgumentException("Space type is required for leasing listings.");
        }
        if (!hasText(request.getPropertyName())) {
            throw new IllegalArgumentException("Property name is required for leasing listings.");
        }
        if (!hasText(request.getAreaLabel())) {
            throw new IllegalArgumentException("Area label is required for leasing listings.");
        }
        if (!hasText(request.getAvailableFrom())) {
            throw new IllegalArgumentException("Available from date is required for leasing listings.");
        }
        if (!hasText(request.getLeaseEnd())) {
            throw new IllegalArgumentException("Lease end date is required for leasing listings.");
        }
        List<String> requestedImages = extractRequestedImages(request);
        if (requestedImages == null || requestedImages.isEmpty()) {
            throw new IllegalArgumentException("At least one room or unit photo is required for leasing listings.");
        }
    }

    private void syncImages(Listing listing, CreateListingRequest request, boolean deleteExistingAssets) {
        List<String> requestedImages = extractRequestedImages(request);
        if (requestedImages == null) {
            return;
        }

        if (requestedImages.size() > MAX_GALLERY_IMAGES) {
            throw new IllegalArgumentException("A maximum of 8 images is supported.");
        }

        if (sameImagesAsExisting(listing, requestedImages)) {
            return;
        }

        if (deleteExistingAssets) {
            deleteListingImagesFromStorage(listing);
        }

        listing.getImages().clear();

        if (requestedImages.isEmpty()) {
            listing.setImageUrl(null);
            return;
        }

        List<String> processedImages = new ArrayList<>();
        for (String rawImage : requestedImages) {
            try {
                processedImages.add(imageService.compressAndUpload(rawImage, listing.getId()));
            } catch (Exception e) {
                log.error("Error processing image for listing {}: {}", listing.getId(), e.getMessage(), e);
                processedImages.add(rawImage);
            }
        }

        for (int i = 0; i < processedImages.size(); i++) {
            ListingImage listingImage = new ListingImage();
            listingImage.setListing(listing);
            listingImage.setImageUrl(processedImages.get(i));
            listingImage.setSortOrder(i);
            listing.getImages().add(listingImage);
        }

        listing.setImageUrl(processedImages.get(0));
    }

    private void syncExternalLinks(Listing listing, CreateListingRequest request) {
        if (request.getExternalLinks() == null) {
            return;
        }

        if (request.getExternalLinks().size() > MAX_EXTERNAL_LINKS) {
            throw new IllegalArgumentException("A maximum of 12 external links is supported.");
        }

        listing.getExternalLinks().clear();
        for (int i = 0; i < request.getExternalLinks().size(); i++) {
            ListingExternalLinkRequest linkRequest = request.getExternalLinks().get(i);
            ListingExternalLink link = new ListingExternalLink();
            link.setListing(listing);
            link.setLabel(linkRequest.getLabel().trim());
            link.setUrl(linkRequest.getUrl().trim());
            link.setType(normalizeUpper(linkRequest.getType(), "OTHER"));
            link.setSortOrder(i);
            listing.getExternalLinks().add(link);
        }
    }

    private boolean sameImagesAsExisting(Listing listing, List<String> requestedImages) {
        List<String> existingImages = currentImageUrls(listing);
        return existingImages.equals(requestedImages);
    }

    private List<String> currentImageUrls(Listing listing) {
        if (listing.getImages() != null && !listing.getImages().isEmpty()) {
            return listing.getImages().stream()
                    .map(ListingImage::getImageUrl)
                    .filter(Objects::nonNull)
                    .toList();
        }
        if (listing.getImageUrl() != null) {
            return List.of(listing.getImageUrl());
        }
        return List.of();
    }

    private void deleteListingImagesFromStorage(Listing listing) {
        Set<String> imageUrls = new LinkedHashSet<>();
        if (listing.getImageUrl() != null && listing.getImageUrl().startsWith("https://")) {
            imageUrls.add(listing.getImageUrl());
        }
        if (listing.getImages() != null) {
            listing.getImages().stream()
                    .map(ListingImage::getImageUrl)
                    .filter(Objects::nonNull)
                    .filter(url -> url.startsWith("https://"))
                    .forEach(imageUrls::add);
        }

        for (String imageUrl : imageUrls) {
            try {
                imageService.deleteImage(imageUrl);
            } catch (Exception e) {
                log.warn("Failed to delete image {} for listing {}: {}", imageUrl, listing.getId(), e.getMessage());
            }
        }
    }

    private List<String> extractRequestedImages(CreateListingRequest request) {
        if (request.getImageUrls() != null) {
            return normalizeList(request.getImageUrls());
        }
        if (request.getImageUrl() != null) {
            String singleImage = normalizeNullable(request.getImageUrl());
            if (singleImage == null) {
                return new ArrayList<>();
            }
            return new ArrayList<>(List.of(singleImage));
        }
        return null;
    }

    private String normalizeListingKind(String kind) {
        return normalizeUpper(kind, Listing.KIND_MARKETPLACE);
    }

    private String normalizeStatus(String status, String fallback) {
        return normalizeUpper(status, fallback == null ? Listing.STATUS_ACTIVE : fallback);
    }

    private String normalizeUpper(String value) {
        return normalizeUpper(value, null);
    }

    private String normalizeUpper(String value, String fallback) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return fallback;
        }
        return normalized.toUpperCase(Locale.US).replace(' ', '_');
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) {
            return new ArrayList<>();
        }
        return values.stream()
                .map(this::normalizeNullable)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private boolean hasText(String value) {
        return normalizeNullable(value) != null;
    }

    private OffsetDateTime parseOffsetDateTime(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }
        try {
            return OffsetDateTime.parse(normalized);
        } catch (Exception e) {
            log.warn("Failed to parse OffsetDateTime: {}", value, e);
            return null;
        }
    }

    private LocalDate parseLocalDate(String value) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            return null;
        }
        try {
            return LocalDate.parse(normalized);
        } catch (Exception e) {
            log.warn("Failed to parse LocalDate: {}", value, e);
            return null;
        }
    }
}
