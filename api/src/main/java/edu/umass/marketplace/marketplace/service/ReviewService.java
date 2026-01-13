package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.dto.CreateReviewRequest;
import edu.umass.marketplace.marketplace.model.Review;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.ReviewRepository;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import edu.umass.marketplace.marketplace.response.ReviewResponse;
import edu.umass.marketplace.marketplace.response.SellerReviewStatsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    /**
     * Create a new review for a seller
     */
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request, java.security.Principal principal) {
        if (principal == null) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                "Authentication required to create a review");
        }

        String email = principal.getName();
        if (email == null || email.trim().isEmpty()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                "User email not found in authentication token");
        }

        User buyer = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                "User not found in database. Please try logging in again."));

        User seller = userRepository.findById(request.getSellerId())
            .orElseThrow(() -> new IllegalArgumentException(
                "Seller not found with id: " + request.getSellerId()));

        // Prevent users from reviewing themselves
        if (buyer.getId().equals(seller.getId())) {
            throw new IllegalArgumentException("You cannot review yourself");
        }

        // Check if buyer has already reviewed this seller
        if (reviewRepository.existsByBuyerIdAndSellerId(buyer.getId(), seller.getId())) {
            throw new IllegalArgumentException("You have already reviewed this seller");
        }

        Review review = new Review();
        review.setBuyer(buyer);
        review.setSeller(seller);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);
        log.debug("Created review with ID: {} for seller: {}", savedReview.getId(), seller.getId());

        return ReviewResponse.fromEntity(savedReview);
    }

    /**
     * Get all reviews for a seller with pagination
     */
    public Page<ReviewResponse> getReviewsBySeller(UUID sellerId, int page, int size) {
        log.debug("Getting reviews for seller ID: {}", sellerId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);

        log.debug("Found {} reviews for seller ID: {}", reviews.getTotalElements(), sellerId);
        return reviews.map(ReviewResponse::fromEntity);
    }

    /**
     * Get review statistics for a seller
     */
    public SellerReviewStatsResponse getSellerReviewStats(UUID sellerId) {
        log.debug("Getting review stats for seller ID: {}", sellerId);

        Double averageRating = reviewRepository.calculateAverageRating(sellerId);
        Long totalReviews = reviewRepository.countBySellerId(sellerId);

        // If no reviews, return 0.0 for average
        if (averageRating == null) {
            averageRating = 0.0;
        }

        log.debug("Seller {} - Average rating: {}, Total reviews: {}", sellerId, averageRating, totalReviews);

        return new SellerReviewStatsResponse(sellerId, averageRating, totalReviews);
    }

    /**
     * Check if the current user has already reviewed a seller
     */
    public boolean hasUserReviewedSeller(UUID sellerId, java.security.Principal principal) {
        if (principal == null) {
            return false;
        }

        String email = principal.getName();
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        User buyer = userRepository.findByEmail(email).orElse(null);
        if (buyer == null) {
            return false;
        }

        return reviewRepository.existsByBuyerIdAndSellerId(buyer.getId(), sellerId);
    }
}

