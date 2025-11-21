package edu.umass.marketplace.repository;

import edu.umass.marketplace.model.Chat;
import edu.umass.marketplace.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {
    
    @Query("SELECT c FROM Chat c WHERE c.buyer.id = ?1 OR c.seller.id = ?1")
    List<Chat> findAllChatsForUser(UUID userId);
    
    @Query("SELECT c FROM Chat c WHERE c.listing.id = ?1 AND (c.buyer.id = ?2 OR c.seller.id = ?2)")
    List<Chat> findByListingAndUser(UUID listingId, UUID userId);

    // Delete chats that have no associated messages (orphan chats)
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Chat c WHERE c.id NOT IN (SELECT m.chat.id FROM Message m)")
    int deleteOrphanChats();
}