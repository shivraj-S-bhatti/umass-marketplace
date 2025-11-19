package edu.umass.marketplace.dto;

// Create Listing Request DTO - validates incoming listing creation requests
// Uses Jakarta validation annotations to ensure data integrity
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Request payload for creating a new marketplace listing")
public class CreateListingRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Schema(description = "Title of the item being sold", example = "MacBook Pro 13-inch")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    @Schema(description = "Detailed description of the item", example = "Excellent condition MacBook Pro, barely used")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Price must not exceed 999,999.99")
    @Schema(description = "Price of the item in USD", example = "1299.99")
    private BigDecimal price;
    
    @Size(max = 100, message = "Category must not exceed 100 characters")
    @Schema(description = "Category of the item", example = "Electronics")
    private String category;
    
    @Size(max = 50, message = "Condition must not exceed 50 characters")
    @Schema(description = "Condition of the item", example = "Like New")
    private String condition;
    
    @Size(max = 1000000, message = "Image data is too large")
    @Schema(description = "Base64 encoded image data or image URL")
    private String imageUrl;

    private Double latitude;
    private Double longitude;
}
