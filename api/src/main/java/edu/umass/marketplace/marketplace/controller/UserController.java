package edu.umass.marketplace.marketplace.controller;

// User Controller - handles user-related API endpoints
// Provides operations for retrieving user information
import edu.umass.marketplace.common.config.SuperuserConfig;
import edu.umass.marketplace.marketplace.response.UserResponse;
import edu.umass.marketplace.marketplace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User information management")
public class UserController {

    private final UserService userService;
    private final SuperuserConfig superuserConfig;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve user information by user ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(user -> {
                    boolean superuser = superuserConfig.isSuperuser(user.getEmail());
                    return ResponseEntity.ok(UserResponse.fromEntity(user, superuser));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

