package edu.umass.marketplace.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {
    private UUID id;
    private UUID listingId;
    private ListingDto listing;
    private UserDto buyer;
    private UserDto seller;
    private MessageDTO lastMessage;
    private OffsetDateTime createdAt;
}