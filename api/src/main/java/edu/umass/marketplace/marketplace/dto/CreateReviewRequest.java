package edu.umass.marketplace.marketplace.dto;

// Create Review Request - DTO for creating a new review
// Validates input data for review creation
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a review for a seller")
public class CreateReviewRequest {

    @NotNull(message = "Seller ID is required")
    @Schema(description = "ID of the seller being reviewed", required = true)
    private UUID sellerId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Schema(description = "Rating from 1 to 5 stars", required = true, minimum = "1", maximum = "5")
    private Integer rating;

    @Schema(description = "Optional comment or review text")
    private String comment;
}


