package edu.umass.marketplace.dto;

// Listing DTO - internal data transfer object for listing operations
// Used for internal service operations and database interactions
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
public class ListingDto {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String condition;
    private String imageUrl;
    private String status;
    private UUID sellerId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
