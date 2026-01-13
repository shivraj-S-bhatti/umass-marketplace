package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.dto.LoginRequest;
import edu.umass.marketplace.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.marketplace.response.AuthResponse;
import edu.umass.marketplace.marketplace.response.UserResponse;
import edu.umass.marketplace.marketplace.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthService {

    private final UserService userService;
    private final edu.umass.marketplace.common.security.JwtUtil jwtUtil;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.debug("🔍 Registering new user: {}", request.getEmail());

        // Check if user already exists
        if (userService.userExistsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }

        // Create new user
        User user = userService.createUser(request);

        // Generate JWT token for the created user
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getName());
        AuthResponse response = AuthResponse.create(token, UserResponse.fromEntity(user));

        log.debug("🔍 User registered successfully with ID: {}", user.getId());
        return response;
    }

    /**
     * Login user
     */
    public AuthResponse login(LoginRequest request) {
        log.debug("🔍 User login attempt: {}", request.getEmail());

        // Find user by email
        User user = userService.getUserByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // For now, simple password check - in real app, use proper password hashing
        if (!request.getPassword().equals("password")) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getName());
        AuthResponse response = AuthResponse.create(token, UserResponse.fromEntity(user));

        log.debug("🔍 User logged in successfully with ID: {}", user.getId());
        return response;
    }
}
