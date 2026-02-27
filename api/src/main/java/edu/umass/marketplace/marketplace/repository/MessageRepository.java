package edu.umass.marketplace.marketplace.repository;

import edu.umass.marketplace.marketplace.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByChatIdOrderByCreatedAtDesc(UUID chatId, Pageable pageable);
    Optional<Message> findTopByChatIdOrderByCreatedAtDesc(UUID chatId);

    @Transactional
    @Modifying
    @Query("UPDATE Message m SET m.sharedListing = null WHERE m.sharedListing.id = :listingId")
    int clearSharedListingByListingId(@Param("listingId") UUID listingId);

    // Delete messages older than the provided cutoff time and return number of deleted rows
    long deleteByCreatedAtBefore(java.time.OffsetDateTime cutoff);
}
