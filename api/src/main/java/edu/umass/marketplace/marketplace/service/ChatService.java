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

        // Check if chat already exists
        List<Chat> existingChats = chatRepository.findByListingAndUser(listingId, buyerId);
        if (!existingChats.isEmpty()) {
            return convertToDTO(existingChats.get(0));
        }

        // Create new chat
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
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO sendMessage(UUID chatId, UUID senderId, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        // Verify sender is part of the chat
        if (!sender.getId().equals(chat.getBuyer().getId()) &&
            !sender.getId().equals(chat.getSeller().getId())) {
            throw new AccessDeniedException("User is not part of this chat");
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);

        return convertToMessageDTO(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public Page<MessageDTO> getChatMessages(UUID chatId, UUID userId, Pageable pageable) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        // Verify user is part of the chat
        if (!userId.equals(chat.getBuyer().getId()) &&
            !userId.equals(chat.getSeller().getId())) {
            throw new AccessDeniedException("User is not part of this chat");
        }

        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable)
                .map(this::convertToMessageDTO);
    }

    private ChatDTO convertToDTO(Chat chat) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setListingId(chat.getListing().getId());
        dto.setListing(convertToListingDTO(chat.getListing()));
        dto.setBuyer(convertToUserDTO(chat.getBuyer()));
        dto.setSeller(convertToUserDTO(chat.getSeller()));
        dto.setCreatedAt(chat.getCreatedAt());

        // Set last message if available
        if (!chat.getMessages().isEmpty()) {
            dto.setLastMessage(convertToMessageDTO(chat.getMessages().get(chat.getMessages().size() - 1)));
        }

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setChatId(message.getChat().getId());
        dto.setSender(convertToUserDTO(message.getSender()));
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
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
