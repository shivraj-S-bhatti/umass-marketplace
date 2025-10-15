package edu.umass.marketplace.repositories;

// Listing Repository - provides data access methods for Listing entities
// Includes custom query methods for filtering and searching listings
import edu.umass.marketplace.entities.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    
    // Find listings by seller ID with pagination
    Page<Listing> findBySellerId(UUID sellerId, Pageable pageable);
    
    // Find listings by status with pagination
    Page<Listing> findByStatus(String status, Pageable pageable);
    
    // Find listings by category with pagination
    Page<Listing> findByCategory(String category, Pageable pageable);
    
    // Search listings by title using LIKE (case-insensitive) - temporarily disabled
    // @Query("SELECT l FROM Listing l WHERE l.title LIKE CONCAT('%', :query, '%') ORDER BY l.title ASC")
    // Page<Listing> findByTitleContaining(@Param("query") String query, Pageable pageable);
    
    // Find listings with multiple filters - temporarily disabled
    // @Query("SELECT l FROM Listing l WHERE " +
    //        "(:query IS NULL OR l.title LIKE CONCAT('%', :query, '%')) AND " +
    //        "(:category IS NULL OR l.category = :category) AND " +
    //        "(:status IS NULL OR l.status = :status) AND " +
    //        "(:minPrice IS NULL OR l.price >= :minPrice) AND " +
    //        "(:maxPrice IS NULL OR l.price <= :maxPrice)")
    // Page<Listing> findWithFilters(
    //         @Param("query") String query,
    //         @Param("category") String category,
    //         @Param("status") Listing.ListingStatus status,
    //         @Param("minPrice") Double minPrice,
    //         @Param("maxPrice") Double maxPrice,
    //         Pageable pageable
    // );
}
