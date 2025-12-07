package edu.umass.marketplace.response;

// Seller Review Stats Response - represents aggregated review statistics for a seller
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Seller review statistics")
public class SellerReviewStatsResponse {

    @Schema(description = "Seller ID")
    private UUID sellerId;

    @Schema(description = "Average rating (1-5)")
    private Double averageRating;

    @Schema(description = "Total number of reviews")
    private Long totalReviews;
}

