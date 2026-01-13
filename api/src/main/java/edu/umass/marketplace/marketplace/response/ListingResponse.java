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
import java.time.OffsetDateTime;
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
    private String imageUrl;
    private String status;
    private UUID sellerId;
    private String sellerName;
    private String sellerEmail;
    private String sellerPictureUrl;
    private OffsetDateTime createdAt;
    private Double latitude;
    private Double longitude;
    private OffsetDateTime mustGoBy;

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
                    .imageUrl(listing.getImageUrl()) // This might be large - handle carefully
                    .status(listing.getStatus())
                    .sellerId(sellerId)
                    .sellerName(sellerName)
                    .sellerEmail(sellerEmail)
                    .sellerPictureUrl(sellerPictureUrl)
                    .createdAt(listing.getCreatedAt())
                    .latitude(listing.getLatitude())
                    .longitude(listing.getLongitude())
                    .mustGoBy(listing.getMustGoBy())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error creating ListingResponse: " + e.getMessage(), e);
        }
    }
}
