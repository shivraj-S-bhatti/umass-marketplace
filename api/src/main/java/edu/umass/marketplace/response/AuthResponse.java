package edu.umass.marketplace.response;

// Auth Response - represents authentication data in API responses
// Provides a clean interface for frontend consumption with only necessary fields
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response data")
public class AuthResponse {

    private String token;
    private UserResponse user;

    // Static factory method to create response
    public static AuthResponse create(String token, UserResponse user) {
        return AuthResponse.builder()
                .token(token)
                .user(user)
                .build();
    }
}
