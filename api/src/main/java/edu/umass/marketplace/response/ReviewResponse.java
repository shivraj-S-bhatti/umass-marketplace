package edu.umass.marketplace.response;

// Review Response - represents review data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import edu.umass.marketplace.model.Review;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Review response data")
public class ReviewResponse {

    private UUID id;
    private UUID buyerId;
    private String buyerName;
    private String buyerPictureUrl;
    private UUID sellerId;
    private Integer rating;
    private String comment;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Static factory method to convert from entity
    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .buyerId(review.getBuyer().getId())
                .buyerName(review.getBuyer().getName())
                .buyerPictureUrl(review.getBuyer().getPictureUrl())
                .sellerId(review.getSeller().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}

