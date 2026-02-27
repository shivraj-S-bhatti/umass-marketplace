package edu.umass.marketplace.marketplace.service;

import edu.umass.marketplace.marketplace.dto.ChatDTO;
import edu.umass.marketplace.marketplace.dto.ListingDto;
import edu.umass.marketplace.marketplace.dto.MessageDTO;
import edu.umass.marketplace.marketplace.dto.UserDto;
import edu.umass.marketplace.marketplace.model.Chat;
import edu.umass.marketplace.marketplace.model.Listing;
import edu.umass.marketplace.marketplace.model.Message;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.ChatRepository;
import edu.umass.marketplace.marketplace.repository.ListingRepository;
import edu.umass.marketplace.marketplace.repository.MessageRepository;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public ChatDTO startChat(UUID listingId, UUID buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (buyer.getId().equals(listing.getSeller().getId())) {
            throw new IllegalArgumentException("Cannot start a chat with yourself");
        }

        // Keep a single 1:1 conversation per participant pair.
        List<Chat> existingChats = chatRepository.findByParticipantPair(buyer.getId(), listing.getSeller().getId());
        if (!existingChats.isEmpty()) {
            Chat chat = existingChats.get(0);
            // Keep latest listing context so the UI can show what item is being discussed now.
            chat.setListing(listing);
            return convertToDTO(chatRepository.save(chat));
        }

        Chat chat = new Chat();
        chat.setListing(listing);
        chat.setBuyer(buyer);
        chat.setSeller(listing.getSeller());

        return convertToDTO(chatRepository.save(chat));
    }

    @Transactional(readOnly = true)
    public List<ChatDTO> getUserChats(UUID userId) {
        return chatRepository.findAllChatsForUser(userId).stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(this::activityTime).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO sendMessage(UUID chatId, UUID senderId, String content) {
        return sendMessage(chatId, senderId, content, null);
    }

    @Transactional
    public MessageDTO sendMessage(UUID chatId, UUID senderId, String content, UUID sharedListingId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        assertUserIsParticipant(chat, sender.getId());

        String normalizedContent = content != null ? content.trim() : "";
        if (normalizedContent.isEmpty() && sharedListingId == null) {
            throw new IllegalArgumentException("Message content cannot be empty unless a listing is shared");
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(normalizedContent.isEmpty() ? "Shared a listing" : normalizedContent);

        if (sharedListingId != null) {
            Listing sharedListing = listingRepository.findById(sharedListingId)
                    .orElseThrow(() -> new IllegalArgumentException("Shared listing not found"));
            message.setSharedListing(sharedListing);
            // Update chat context to the latest referenced listing.
            chat.setListing(sharedListing);
            chatRepository.save(chat);
        }

        return convertToMessageDTO(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public Page<MessageDTO> getChatMessages(UUID chatId, UUID userId, Pageable pageable) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        assertUserIsParticipant(chat, userId);

        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable)
                .map(this::convertToMessageDTO);
    }

    private ChatDTO convertToDTO(Chat chat) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        if (chat.getListing() != null) {
            dto.setListingId(chat.getListing().getId());
            dto.setListing(convertToListingDTO(chat.getListing()));
        }
        dto.setBuyer(convertToUserDTO(chat.getBuyer()));
        dto.setSeller(convertToUserDTO(chat.getSeller()));
        dto.setCreatedAt(chat.getCreatedAt());

        messageRepository.findTopByChatIdOrderByCreatedAtDesc(chat.getId())
                .ifPresent(message -> dto.setLastMessage(convertToMessageDTO(message)));

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setChatId(message.getChat().getId());
        dto.setSender(convertToUserDTO(message.getSender()));
        dto.setContent(message.getContent());
        if (message.getSharedListing() != null) {
            dto.setSharedListingId(message.getSharedListing().getId());
            dto.setSharedListing(convertToListingDTO(message.getSharedListing()));
        }
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }

    private void assertUserIsParticipant(Chat chat, UUID userId) {
        if (!userId.equals(chat.getBuyer().getId()) &&
            !userId.equals(chat.getSeller().getId())) {
            throw new AccessDeniedException("User is not part of this chat");
        }
    }

    private OffsetDateTime activityTime(ChatDTO chatDTO) {
        return chatDTO.getLastMessage() != null ? chatDTO.getLastMessage().getCreatedAt() : chatDTO.getCreatedAt();
    }

    private UserDto convertToUserDTO(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPictureUrl(user.getPictureUrl());
        return dto;
    }

    private ListingDto convertToListingDTO(Listing listing) {
        ListingDto dto = new ListingDto();
        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setImageUrl(listing.getImageUrl());
        dto.setCondition(listing.getCondition() != null ? listing.getCondition().getDisplayName() : null);
        dto.setStatus(listing.getStatus());
        dto.setSeller(convertToUserDTO(listing.getSeller()));
        dto.setCreatedAt(listing.getCreatedAt());
        return dto;
    }
}
