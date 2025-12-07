package edu.umass.marketplace.repository;

// Review Repository - provides data access methods for Review entities
// Extends JpaRepository to get basic CRUD operations and custom query methods
import edu.umass.marketplace.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    // Find all reviews for a specific seller
    Page<Review> findBySellerIdOrderByCreatedAtDesc(UUID sellerId, Pageable pageable);

    // Find a specific review by buyer and seller
    Optional<Review> findByBuyerIdAndSellerId(UUID buyerId, UUID sellerId);

    // Check if a review exists for a buyer-seller pair
    boolean existsByBuyerIdAndSellerId(UUID buyerId, UUID sellerId);

    // Calculate average rating for a seller
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.seller.id = :sellerId")
    Double calculateAverageRating(@Param("sellerId") UUID sellerId);

    // Count total reviews for a seller
    long countBySellerId(UUID sellerId);
}

