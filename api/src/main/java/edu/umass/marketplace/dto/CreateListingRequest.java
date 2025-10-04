package edu.umass.marketplace.dto;

// Create Listing Request DTO - validates incoming listing creation requests
// Uses Jakarta validation annotations to ensure data integrity
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateListingRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Price must not exceed 999,999.99")
    private BigDecimal price;
    
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @Size(max = 50, message = "Condition must not exceed 50 characters")
    private String condition;
}
