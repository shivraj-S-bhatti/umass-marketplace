package edu.umass.marketplace.marketplace.controller;

import edu.umass.marketplace.common.security.UserPrincipal;
import edu.umass.marketplace.marketplace.dto.MessageDTO;
import edu.umass.marketplace.marketplace.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{chatId}")
    public void sendMessage(
            @DestinationVariable UUID chatId,
            @Payload Object payload,
            Principal principal) {

        if (principal == null) {
            log.warn("Unauthenticated WebSocket message attempt for chat {}", chatId);
            return;
        }

        UserPrincipal userPrincipal = extractUserPrincipal(principal);
        if (userPrincipal == null) {
            log.warn("Could not extract UserPrincipal from WebSocket principal");
            return;
        }

        ParsedMessage parsed = parsePayload(payload);
        MessageDTO message = chatService.sendMessage(chatId, userPrincipal.getId(), parsed.content(), parsed.sharedListingId());

        // Broadcast to all subscribers of this chat topic
        messagingTemplate.convertAndSend("/topic/chat/" + chatId, message);
    }

    private UserPrincipal extractUserPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Object p = auth.getPrincipal();
            if (p instanceof UserPrincipal up) {
                return up;
            }
        }
        return null;
    }

    private ParsedMessage parsePayload(Object payload) {
        if (payload instanceof String content) {
            return new ParsedMessage(content, null);
        }
        if (payload instanceof Map<?, ?> map) {
            Object contentObj = map.get("content");
            Object sharedListingIdObj = map.get("sharedListingId");
            if (sharedListingIdObj == null) {
                sharedListingIdObj = map.get("listingId");
            }
            String content = contentObj != null ? contentObj.toString() : null;
            UUID sharedListingId = null;
            if (sharedListingIdObj != null && !sharedListingIdObj.toString().isBlank()) {
                sharedListingId = UUID.fromString(sharedListingIdObj.toString());
            }
            return new ParsedMessage(content, sharedListingId);
        }
        throw new IllegalArgumentException("Unsupported WebSocket message payload");
    }

    private record ParsedMessage(String content, UUID sharedListingId) {}
}
