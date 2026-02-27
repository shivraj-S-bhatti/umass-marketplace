package edu.umass.marketplace.marketplace.controller;

import edu.umass.marketplace.marketplace.dto.ChatDTO;
import edu.umass.marketplace.marketplace.dto.MessageDTO;
import edu.umass.marketplace.common.security.UserPrincipal;
import edu.umass.marketplace.marketplace.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/listing/{listingId}")
    public ResponseEntity<ChatDTO> startChat(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.startChat(listingId, userPrincipal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ChatDTO>> getUserChats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.getUserChats(userPrincipal.getId()));
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable UUID chatId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        String content = body != null ? body.get("content") : null;
        UUID sharedListingId = null;
        String sharedListingIdText = null;
        if (body != null) {
            sharedListingIdText = body.get("sharedListingId");
            if ((sharedListingIdText == null || sharedListingIdText.isBlank()) && body.get("listingId") != null) {
                sharedListingIdText = body.get("listingId");
            }
        }
        if (sharedListingIdText != null && !sharedListingIdText.isBlank()) {
            try {
                sharedListingId = UUID.fromString(sharedListingIdText);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        MessageDTO message = chatService.sendMessage(chatId, userPrincipal.getId(), content, sharedListingId);
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<Page<MessageDTO>> getChatMessages(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.getChatMessages(chatId, userPrincipal.getId(), pageable));
    }
}
