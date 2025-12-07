package edu.umass.marketplace.dto;

// User DTO - internal data transfer object for user operations
// Used for internal service operations and database interactions
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
public class UserDTO {

    private UUID id;
    private String name;
    private String email;
    private String pictureUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
