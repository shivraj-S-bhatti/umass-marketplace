package edu.umass.marketplace.marketplace.repository;

import edu.umass.marketplace.marketplace.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {
    
    @Query("SELECT c FROM Chat c WHERE c.buyer.id = ?1 OR c.seller.id = ?1 ORDER BY c.createdAt DESC")
    List<Chat> findAllChatsForUser(UUID userId);

    @Query("""
        SELECT c FROM Chat c
        WHERE (c.buyer.id = :firstUserId AND c.seller.id = :secondUserId)
           OR (c.buyer.id = :secondUserId AND c.seller.id = :firstUserId)
        ORDER BY c.createdAt ASC
        """)
    List<Chat> findByParticipantPair(@Param("firstUserId") UUID firstUserId,
                                     @Param("secondUserId") UUID secondUserId);

    @Query("""
        SELECT COUNT(c) > 0 FROM Chat c
        WHERE c.id = :chatId
          AND (c.buyer.id = :userId OR c.seller.id = :userId)
        """)
    boolean existsByIdAndParticipant(@Param("chatId") UUID chatId, @Param("userId") UUID userId);

    @Transactional
    @Modifying
    @Query("UPDATE Chat c SET c.listing = null WHERE c.listing.id = :listingId")
    int clearListingContextByListingId(@Param("listingId") UUID listingId);

    // Delete chats that have no associated messages (orphan chats)
    @Transactional
    @Modifying
    @Query("DELETE FROM Chat c WHERE c.id NOT IN (SELECT m.chat.id FROM Message m)")
    int deleteOrphanChats();
}
