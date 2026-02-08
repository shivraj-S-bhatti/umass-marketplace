package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(UUID id) {
        log.debug("🔍 Getting user by ID: {}", id);
        return userRepository.findById(id);
    }

    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        log.debug("🔍 Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Create a new user
     */
    @Transactional
    public User createUser(RegisterRequest request) {
        log.debug("🔍 Creating new user: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.debug("🔍 Created user with ID: {}", savedUser.getId());

        return savedUser;
    }

    /**
     * Update user information
     */
    @Transactional
    public User updateUser(UUID id, RegisterRequest request) {
        log.debug("🔍 Updating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setName(request.getName());
//        user.setPictureUrl(request.getPictureUrl());

        User savedUser = userRepository.save(user);
        log.debug("🔍 Updated user with ID: {}", savedUser.getId());

        return savedUser;
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(UUID id) {
        log.debug("🔍 Deleting user with ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
        log.debug("🔍 Deleted user with ID: {}", id);
    }

    /**
     * Check if user exists by email
     */
    public boolean userExistsByEmail(String email) {
        log.debug("🔍 Checking if user exists with email: {}", email);
        return userRepository.findByEmail(email).isPresent();
    }
}
