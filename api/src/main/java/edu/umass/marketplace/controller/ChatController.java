package edu.umass.marketplace.controller;

import edu.umass.marketplace.dto.ChatDTO;
import edu.umass.marketplace.dto.MessageDTO;
import edu.umass.marketplace.security.UserPrincipal;
import edu.umass.marketplace.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/listing/{listingId}")
    public ResponseEntity<ChatDTO> startChat(
            @PathVariable UUID listingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.startChat(listingId, userPrincipal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<ChatDTO>> getUserChats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.getUserChats(userPrincipal.getId()));
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable UUID chatId,
            @RequestBody String content,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(chatService.sendMessage(chatId, userPrincipal.getId(), content));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<Page<MessageDTO>> getChatMessages(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(chatService.getChatMessages(chatId, userPrincipal.getId(), pageable));
    }
}