package edu.umass.marketplace.marketplace.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private UUID id;
    private UUID chatId;
    private UserDto sender;
    private String content;
    private UUID sharedListingId;
    private ListingDto sharedListing;
    private OffsetDateTime createdAt;
}
