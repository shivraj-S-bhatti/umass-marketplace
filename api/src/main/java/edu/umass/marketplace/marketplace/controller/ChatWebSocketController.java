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
            @Payload String content,
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

        MessageDTO message = chatService.sendMessage(chatId, userPrincipal.getId(), content);

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
}
