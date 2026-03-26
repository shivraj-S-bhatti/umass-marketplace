package edu.umass.marketplace.marketplace.dto;

// Create Listing Request DTO - validates incoming listing creation requests
// Uses Jakarta validation annotations to ensure data integrity
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

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
    
    @Size(max = 5000000, message = "Image data is too large (max 5MB)")
    @Schema(description = "Base64 encoded image data or image URL")
    private String imageUrl;

    @Size(max = 8, message = "A maximum of 8 images is supported")
    @Schema(description = "Base64 encoded gallery images or image URLs")
    private List<
            @Size(max = 5000000, message = "Image data is too large (max 5MB)")
            String> imageUrls;

    @Size(max = 20, message = "Status must not exceed 20 characters")
    @Schema(description = "Status of the listing (ACTIVE, SOLD, ON_HOLD)", example = "ACTIVE")
    private String status;

    @Size(max = 24, message = "Kind must not exceed 24 characters")
    @Schema(description = "Listing kind", example = "MARKETPLACE")
    private String kind;

    @Size(max = 32, message = "Lease arrangement must not exceed 32 characters")
    private String leaseArrangement;

    @Size(max = 32, message = "Transfer scope must not exceed 32 characters")
    private String transferScope;

    @Size(max = 32, message = "Space type must not exceed 32 characters")
    private String spaceType;

    @Size(max = 255, message = "Property name must not exceed 255 characters")
    private String propertyName;

    @Size(max = 255, message = "Area label must not exceed 255 characters")
    private String areaLabel;

    private String availableFrom;
    private String leaseEnd;
    private Integer bedrooms;
    private BigDecimal bathrooms;

    @Size(max = 255, message = "Nearest bus stop name must not exceed 255 characters")
    private String nearestBusStopName;

    private Integer nearestBusStopWalkMinutes;
    private List<@Size(max = 32, message = "Bus route labels must not exceed 32 characters") String> busRoutes;
    private List<@Size(max = 64, message = "Utility labels must not exceed 64 characters") String> includedUtilities;
    private BigDecimal estimatedUtilitiesMonthlyTotal;
    private BigDecimal electricityEstimate;
    private BigDecimal gasEstimate;
    private BigDecimal waterEstimate;
    private BigDecimal internetEstimate;

    @Size(max = 32, message = "Laundry type must not exceed 32 characters")
    private String laundryType;

    private List<@Size(max = 64, message = "Amenity labels must not exceed 64 characters") String> amenities;

    @Size(max = 2000, message = "Cleaning notes must not exceed 2000 characters")
    private String cleaningNotes;

    @Size(max = 12, message = "A maximum of 12 external links is supported")
    private List<@Valid ListingExternalLinkRequest> externalLinks;

    private Double latitude;
    private Double longitude;

    @Schema(description = "Must go by date (ISO 8601 format)", example = "2024-12-31T23:59:59Z")
    private String mustGoBy;
}
