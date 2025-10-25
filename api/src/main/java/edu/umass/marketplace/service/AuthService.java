package edu.umass.marketplace.service;

import edu.umass.marketplace.dto.AuthResponse;
import edu.umass.marketplace.dto.LoginRequest;
import edu.umass.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.model.User;
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

        // For now, return a simple response - in real app, generate JWT token
        AuthResponse response = new AuthResponse();
        response.setToken("dummy-jwt-token-" + user.getId());
//        response.setUser(user);

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

        // For now, return a simple response - in real app, generate JWT token
        AuthResponse response = new AuthResponse();
        response.setToken("dummy-jwt-token-" + user.getId());
//        response.setUser(user);

        log.debug("🔍 User logged in successfully with ID: {}", user.getId());
        return response;
    }
}
