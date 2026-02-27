package edu.umass.marketplace.common.config;

import edu.umass.marketplace.common.security.JwtUtil;
import edu.umass.marketplace.common.security.UserPrincipal;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.repository.ChatRepository;
import edu.umass.marketplace.marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final SuperuserConfig superuserConfig;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            return authenticateConnect(message, accessor);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            return authorizeChatDestination(message, accessor);
        }

        return message;
    }

    private Message<?> authenticateConnect(Message<?> message, StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        boolean authenticated = false;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                UUID userId = jwtUtil.getUserIdFromToken(token);
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    UserPrincipal principal = new UserPrincipal(
                            user.getId(), user.getEmail(), user.getName(), user.getPictureUrl());
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    accessor.setUser(auth);
                    authenticated = true;
                }
            } catch (Exception ex) {
                log.debug("Failed to authenticate WebSocket connection from JWT", ex);
            }
        }
        if (!authenticated) {
            log.warn("Rejecting WebSocket CONNECT: missing or invalid Authorization Bearer token");
            return null;
        }
        return message;
    }

    private Message<?> authorizeChatDestination(Message<?> message, StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || destination.isBlank()) {
            return message;
        }

        UUID chatId = extractChatId(destination);
        if (chatId == null) {
            return message;
        }

        UserPrincipal principal = extractUserPrincipal(accessor);
        if (principal == null) {
            log.warn("Rejecting WebSocket {}: unauthenticated principal for destination {}",
                    accessor.getCommand(), destination);
            return null;
        }

        if (superuserConfig.isSuperuser(principal.getEmail())) {
            return message;
        }

        boolean allowed = chatRepository.existsByIdAndParticipant(chatId, principal.getId());
        if (!allowed) {
            log.warn("Rejecting WebSocket {} to {} for user {} (not a chat participant)",
                    accessor.getCommand(), destination, principal.getEmail());
            return null;
        }
        return message;
    }

    private UUID extractChatId(String destination) {
        String chatPrefixTopic = "/topic/chat/";
        String chatPrefixApp = "/app/chat/";
        String chatIdText = null;

        if (destination.startsWith(chatPrefixTopic)) {
            chatIdText = destination.substring(chatPrefixTopic.length());
        } else if (destination.startsWith(chatPrefixApp)) {
            chatIdText = destination.substring(chatPrefixApp.length());
        }
        if (chatIdText == null || chatIdText.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(chatIdText);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private UserPrincipal extractUserPrincipal(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            Object principal = auth.getPrincipal();
            if (principal instanceof UserPrincipal userPrincipal) {
                return userPrincipal;
            }
        }
        return null;
    }
}
