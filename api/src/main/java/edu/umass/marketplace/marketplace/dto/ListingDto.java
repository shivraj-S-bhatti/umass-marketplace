package edu.umass.marketplace.marketplace.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingDto {
    private UUID id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
    private BigDecimal price;

    private String category;
    private String condition;
    private String imageUrl;

    @NotBlank(message = "Status is required")
    @Builder.Default
    private String status = "ACTIVE";
    
    private UserDto seller;
    private UUID sellerId;
    private Double latitude;
    private Double longitude;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_ON_HOLD = "ON_HOLD";
    public static final String STATUS_SOLD = "SOLD";
}
