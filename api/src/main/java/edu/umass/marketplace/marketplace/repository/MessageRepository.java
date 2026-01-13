package edu.umass.marketplace.marketplace.repository;

import edu.umass.marketplace.marketplace.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByChatIdOrderByCreatedAtDesc(UUID chatId, Pageable pageable);
    // Delete messages older than the provided cutoff time and return number of deleted rows
    long deleteByCreatedAtBefore(java.time.OffsetDateTime cutoff);
}