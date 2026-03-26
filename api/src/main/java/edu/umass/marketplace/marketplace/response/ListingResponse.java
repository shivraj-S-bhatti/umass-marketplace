package edu.umass.marketplace.marketplace.response;

// Listing Response - represents listing data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import edu.umass.marketplace.marketplace.model.Condition;
import edu.umass.marketplace.marketplace.model.Listing;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Marketplace listing response data")
public class ListingResponse {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String condition; // Store as String for API compatibility
    private String kind;
    private String imageUrl;
    private List<String> imageUrls;
    private String status;
    private UUID sellerId;
    private String sellerName;
    private String sellerEmail;
    private String sellerPictureUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Double latitude;
    private Double longitude;
    private OffsetDateTime mustGoBy;
    private String leaseArrangement;
    private String transferScope;
    private String spaceType;
    private String propertyName;
    private String areaLabel;
    private LocalDate availableFrom;
    private LocalDate leaseEnd;
    private Integer bedrooms;
    private BigDecimal bathrooms;
    private String nearestBusStopName;
    private Integer nearestBusStopWalkMinutes;
    private List<String> busRoutes;
    private List<String> includedUtilities;
    private BigDecimal estimatedUtilitiesMonthlyTotal;
    private BigDecimal electricityEstimate;
    private BigDecimal gasEstimate;
    private BigDecimal waterEstimate;
    private BigDecimal internetEstimate;
    private String laundryType;
    private List<String> amenities;
    private String cleaningNotes;
    private List<ListingExternalLinkResponse> externalLinks;

    // Static factory method to convert from entity
    public static ListingResponse fromEntity(Listing listing) {
        try {
            // Safely get seller info to avoid lazy loading issues
            UUID sellerId = null;
            String sellerName = null;
            String sellerEmail = null;
            String sellerPictureUrl = null;
            
            if (listing.getSeller() != null) {
                try {
                    sellerId = listing.getSeller().getId();
                    sellerName = listing.getSeller().getName();
                    sellerEmail = listing.getSeller().getEmail();
                    sellerPictureUrl = listing.getSeller().getPictureUrl();
                } catch (Exception e) {
                    // If seller is lazy-loaded and session is closed, sellerId might still work
                    sellerId = listing.getSeller().getId();
                }
            }
            
            return ListingResponse.builder()
                    .id(listing.getId())
                    .title(listing.getTitle())
                    .description(listing.getDescription())
                    .price(listing.getPrice())
                    .category(listing.getCategory())
                    .condition(listing.getCondition() != null ? listing.getCondition().getDisplayName() : null)
                    .kind(listing.getKind())
                    .imageUrl(listing.getImageUrl()) // This might be large - handle carefully
                    .imageUrls(listing.getImages() == null
                            ? Collections.emptyList()
                            : listing.getImages().stream().map(image -> image.getImageUrl()).toList())
                    .status(listing.getStatus())
                    .sellerId(sellerId)
                    .sellerName(sellerName)
                    .sellerEmail(sellerEmail)
                    .sellerPictureUrl(sellerPictureUrl)
                    .createdAt(listing.getCreatedAt())
                    .updatedAt(listing.getUpdatedAt())
                    .latitude(listing.getLatitude())
                    .longitude(listing.getLongitude())
                    .mustGoBy(listing.getMustGoBy())
                    .leaseArrangement(listing.getLeaseArrangement())
                    .transferScope(listing.getTransferScope())
                    .spaceType(listing.getSpaceType())
                    .propertyName(listing.getPropertyName())
                    .areaLabel(listing.getAreaLabel())
                    .availableFrom(listing.getAvailableFrom())
                    .leaseEnd(listing.getLeaseEnd())
                    .bedrooms(listing.getBedrooms())
                    .bathrooms(listing.getBathrooms())
                    .nearestBusStopName(listing.getNearestBusStopName())
                    .nearestBusStopWalkMinutes(listing.getNearestBusStopWalkMinutes())
                    .busRoutes(listing.getBusRoutes() == null ? Collections.emptyList() : listing.getBusRoutes())
                    .includedUtilities(listing.getIncludedUtilities() == null ? Collections.emptyList() : listing.getIncludedUtilities())
                    .estimatedUtilitiesMonthlyTotal(listing.getEstimatedUtilitiesMonthlyTotal())
                    .electricityEstimate(listing.getElectricityEstimate())
                    .gasEstimate(listing.getGasEstimate())
                    .waterEstimate(listing.getWaterEstimate())
                    .internetEstimate(listing.getInternetEstimate())
                    .laundryType(listing.getLaundryType())
                    .amenities(listing.getAmenities() == null ? Collections.emptyList() : listing.getAmenities())
                    .cleaningNotes(listing.getCleaningNotes())
                    .externalLinks(listing.getExternalLinks() == null
                            ? Collections.emptyList()
                            : listing.getExternalLinks().stream().map(ListingExternalLinkResponse::fromEntity).toList())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error creating ListingResponse: " + e.getMessage(), e);
        }
    }
}
