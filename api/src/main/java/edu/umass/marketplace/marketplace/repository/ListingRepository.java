package edu.umass.marketplace.marketplace.repository;

// Listing Repository - provides data access methods for Listing entities
// Includes custom query methods for filtering and searching listings
import edu.umass.marketplace.marketplace.model.Condition;
import edu.umass.marketplace.marketplace.model.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

    // Count listings by status
    long countByStatus(String status);

    // Find listings created before the given cutoff (for retention cleanup)
    List<Listing> findByCreatedAtBefore(OffsetDateTime cutoff);

    // Find listings with multiple filters
    @Query("SELECT l FROM Listing l WHERE " +
           "((:query IS NULL) OR :query = '' OR (LOWER(l.title) LIKE LOWER(CONCAT('%', COALESCE(:query, ''), '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', COALESCE(:query, ''), '%')))) AND " +
           "((:category IS NULL) OR :category = '' OR (l.category = :category)) AND " +
           "((:status IS NULL) OR :status = '' OR (l.status = :status)) AND " +
           "((:conditions IS NULL) OR (l.condition IN :conditions)) AND " +
           "((:minPrice IS NULL) OR (l.price >= :minPrice)) AND " +
           "((:maxPrice IS NULL) OR (l.price <= :maxPrice)) " +
           "ORDER BY l.createdAt DESC")
    Page<Listing> findWithFilters(
            @Param("query") String query,
            @Param("category") String category,
            @Param("status") String status,
            @Param("conditions") List<Condition> conditions,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
}
