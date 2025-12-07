package edu.umass.marketplace.response;

// Listing Response - represents listing data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import edu.umass.marketplace.model.Condition;
import edu.umass.marketplace.model.Listing;
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
    private String sellerName;
    private String sellerEmail;
    private String sellerPictureUrl;
    private OffsetDateTime createdAt;
    private Double latitude;
    private Double longitude;

    // Static factory method to convert from entity
    public static ListingResponse fromEntity(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .category(listing.getCategory())
                .condition(listing.getCondition() != null ? listing.getCondition().getDisplayName() : null)
                .imageUrl(listing.getImageUrl())
                .status(listing.getStatus())
                .sellerName(listing.getSeller() != null ? listing.getSeller().getName() : null)
                .sellerEmail(listing.getSeller() != null ? listing.getSeller().getEmail() : null)
                .sellerPictureUrl(listing.getSeller() != null ? listing.getSeller().getPictureUrl() : null)
                .createdAt(listing.getCreatedAt())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .build();
    }
}
