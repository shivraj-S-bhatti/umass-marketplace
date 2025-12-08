package edu.umass.marketplace.response;

// User Response - represents user data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import edu.umass.marketplace.model.User;
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
@Schema(description = "User response data")
public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private String pictureUrl;
    private OffsetDateTime createdAt;

    // Static factory method to convert from entity
    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .pictureUrl(user.getPictureUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
