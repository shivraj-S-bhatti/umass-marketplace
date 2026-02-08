package edu.umass.marketplace.common.config;

import edu.umass.marketplace.common.security.JwtUtil;
import edu.umass.marketplace.common.security.UserPrincipal;
import edu.umass.marketplace.marketplace.model.User;
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

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
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
                    }
                } catch (Exception ex) {
                    log.debug("Failed to authenticate WebSocket connection from JWT", ex);
                }
            }
        }

        return message;
    }
}
