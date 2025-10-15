package edu.umass.marketplace.dto;

// Listing Response DTO - represents listing data in API responses
// Provides a clean interface for frontend consumption with all necessary fields
import edu.umass.marketplace.entities.Listing;
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
public class ListingResponse {
    
    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String condition;
    private String status;
    private UUID sellerId;
    private String sellerName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Static factory method to convert from entity
    public static ListingResponse fromEntity(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .category(listing.getCategory())
                .condition(listing.getCondition())
                .status(listing.getStatus())
                .sellerId(listing.getSeller().getId())
                .sellerName(listing.getSeller().getName())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
