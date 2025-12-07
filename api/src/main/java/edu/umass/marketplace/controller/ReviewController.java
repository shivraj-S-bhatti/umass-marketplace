package edu.umass.marketplace.controller;

// Review Controller - handles all review-related API endpoints
// Provides operations for creating and retrieving seller reviews
import edu.umass.marketplace.dto.CreateReviewRequest;
import edu.umass.marketplace.response.ReviewResponse;
import edu.umass.marketplace.response.SellerReviewStatsResponse;
import edu.umass.marketplace.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reviews", description = "Seller review management")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create review", description = "Create a new review for a seller")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            java.security.Principal principal
    ) {
        ReviewResponse review = reviewService.createReview(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/seller/{sellerId}")
    @Operation(summary = "Get reviews by seller", description = "Retrieve paginated reviews for a specific seller")
    public Page<ReviewResponse> getReviewsBySeller(
            @PathVariable UUID sellerId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size
    ) {
        return reviewService.getReviewsBySeller(sellerId, page, size);
    }

    @GetMapping("/seller/{sellerId}/stats")
    @Operation(summary = "Get seller review statistics", description = "Get aggregated review statistics for a seller")
    public SellerReviewStatsResponse getSellerReviewStats(@PathVariable UUID sellerId) {
        return reviewService.getSellerReviewStats(sellerId);
    }

    @GetMapping("/seller/{sellerId}/has-reviewed")
    @Operation(summary = "Check if user has reviewed seller", description = "Check if the current user has already reviewed a seller")
    public ResponseEntity<Boolean> hasUserReviewedSeller(
            @PathVariable UUID sellerId,
            java.security.Principal principal
    ) {
        boolean hasReviewed = reviewService.hasUserReviewedSeller(sellerId, principal);
        return ResponseEntity.ok(hasReviewed);
    }
}


