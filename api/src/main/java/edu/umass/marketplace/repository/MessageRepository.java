package edu.umass.marketplace.repository;

import edu.umass.marketplace.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByChatIdOrderByCreatedAtDesc(UUID chatId, Pageable pageable);
}