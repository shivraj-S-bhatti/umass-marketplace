package edu.umass.marketplace.service;

import edu.umass.marketplace.repository.ChatRepository;
import edu.umass.marketplace.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

/**
 * Scheduled task to purge old chat messages and orphan chats based on retention policy.
 */
@Component
@RequiredArgsConstructor
public class ChatRetentionService {

    private static final Logger log = LoggerFactory.getLogger(ChatRetentionService.class);

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    // retention in days (default 90)
    @Value("${chat.retentionDays:90}")
    private long retentionDays;

    // Run once daily at 03:00 AM
    @Scheduled(cron = "0 0 3 * * ?")
    public void purgeOldChatsAndMessages() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(retentionDays);
        log.info("Running chat retention cleanup. Deleting messages before {} ({} days)", cutoff, retentionDays);

        long deletedMessages = messageRepository.deleteByCreatedAtBefore(cutoff);
        log.info("Deleted {} old messages", deletedMessages);

        int deletedChats = chatRepository.deleteOrphanChats();
        log.info("Deleted {} orphan chats (no messages)", deletedChats);
    }
}
