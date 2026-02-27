package edu.umass.marketplace.marketplace.response;

// User Response - represents user data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import edu.umass.marketplace.marketplace.model.User;
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
    /** Derived from app.superuser-email at response time, not stored in DB. */
    private boolean superuser;

    /** Build from entity with superuser flag (e.g. from Controller/Service that has superuser config). */
    public static UserResponse fromEntity(User user, boolean superuser) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .pictureUrl(user.getPictureUrl())
                .createdAt(user.getCreatedAt())
                .superuser(superuser)
                .build();
    }

    /** Static factory when superuser is not available (defaults to false). */
    public static UserResponse fromEntity(User user) {
        return fromEntity(user, false);
    }
}
