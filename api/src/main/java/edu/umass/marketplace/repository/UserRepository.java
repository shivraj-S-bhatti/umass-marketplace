package edu.umass.marketplace.repository;

// User Repository - provides data access methods for User entities
// Extends JpaRepository to get basic CRUD operations and custom query methods
import edu.umass.marketplace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find user by email address
    Optional<User> findByEmail(String email);

    // Check if user exists by email
    boolean existsByEmail(String email);
}
