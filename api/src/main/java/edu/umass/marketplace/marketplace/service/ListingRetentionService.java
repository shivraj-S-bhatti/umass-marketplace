package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.model.Listing;
import edu.umass.marketplace.marketplace.repository.ChatRepository;
import edu.umass.marketplace.marketplace.repository.ListingRepository;
import edu.umass.marketplace.marketplace.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Scheduled task to auto-delete listings older than configured retention period.
 * Runs daily to clean up old listings and free up storage.
 */
@Component
@RequiredArgsConstructor
public class ListingRetentionService {

    private static final Logger log = LoggerFactory.getLogger(ListingRetentionService.class);

    private final ListingRepository listingRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ImageService imageService;

    // Retention period in days (default 14 days)
    @Value("${listing.retentionDays:14}")
    private long retentionDays;

    /**
     * Run daily at 2:00 AM to delete old listings.
     * Uses cron expression: second, minute, hour, day, month, weekday
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void deleteOldListings() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(retentionDays);
        log.info("Running listing retention cleanup. Deleting listings created before {} ({} days old)", 
            cutoff, retentionDays);

        // Find only old listings server-side to avoid loading all listings into memory
        List<Listing> oldListings = listingRepository.findByCreatedAtBefore(cutoff);

        if (oldListings.isEmpty()) {
            log.info("No old listings to delete");
            return;
        }

        log.info("Found {} listings to delete", oldListings.size());

        // Delete associated images from S3 if applicable
        for (Listing listing : oldListings) {
            if (listing.getImageUrl() != null && listing.getImageUrl().startsWith("https://")) {
                try {
                    imageService.deleteImage(listing.getImageUrl());
                } catch (Exception e) {
                    log.warn("Failed to delete image for listing {}: {}", listing.getId(), e.getMessage());
                }
            }
        }

        // Delete listings from database
        int deletedCount = 0;
        for (Listing listing : oldListings) {
            try {
                // 1:1 conversation model: preserve chat history and only clear listing references.
                messageRepository.clearSharedListingByListingId(listing.getId());
                chatRepository.clearListingContextByListingId(listing.getId());
                listingRepository.delete(listing);
                deletedCount++;
            } catch (Exception e) {
                log.error("Failed to delete listing {}: {}", listing.getId(), e.getMessage());
            }
        }

        log.info("Deleted {} old listings (older than {} days)", deletedCount, retentionDays);
    }

    /**
     * Manual trigger for testing purposes.
     * Can be called via admin endpoint if needed.
     */
    @Transactional
    public int deleteOldListingsManually() {
        deleteOldListings();
        return (int) listingRepository.count();
    }
}
