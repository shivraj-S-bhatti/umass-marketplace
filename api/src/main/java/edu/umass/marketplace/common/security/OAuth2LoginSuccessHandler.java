package edu.umass.marketplace.common.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    private static final String LOG_PREFIX = "[Superuser]";

    private final JwtUtil jwtUtil;

    // Frontend redirect URL - can be configured via environment
    private final String frontendRedirect = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            String email = (String) oidcUser.getAttributes().get("email");
            String name = (String) oidcUser.getAttributes().get("name");
            String pictureUrl = (String) oidcUser.getAttributes().get("picture");
            UUIDHolderHolder idHolder = UUIDHolderHolder.fromPrincipal(authentication.getPrincipal());

            // Restrict to @umass.edu domain
            if (email == null || !email.endsWith("@umass.edu")) {
                // Redirect to frontend with error message
                String errorRedirect = frontendRedirect + "/auth/success?error=Only+UMass+email+addresses+are+allowed";
                response.sendRedirect(errorRedirect);
                return;
            }

            boolean isSuperuser = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            log.info("{} redirect email={} authorities={} superuser={}", LOG_PREFIX, email, authentication.getAuthorities(), isSuperuser);

            String token = jwtUtil.generateToken(idHolder.getId(), email, name);
            String redirect = String.format(
                "%s/auth/success?token=%s&id=%s&email=%s&name=%s&pictureUrl=%s&superuser=%s",
                frontendRedirect,
                java.net.URLEncoder.encode(token, StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(idHolder.getId().toString(), StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(email, StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(name == null ? "" : name, StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(pictureUrl == null ? "" : pictureUrl, StandardCharsets.UTF_8),
                isSuperuser
            );
            response.sendRedirect(redirect);
            return;
        }
        response.sendRedirect(frontendRedirect);
    }
}

// Helper class to extract UUID from principal if it is UserPrincipal or CustomOidcUser
class UUIDHolderHolder {
    private final java.util.UUID id;

    private UUIDHolderHolder(java.util.UUID id) { this.id = id; }

    public java.util.UUID getId() { return id; }

    public static UUIDHolderHolder fromPrincipal(Object principal) {
        if (principal instanceof edu.umass.marketplace.common.security.UserPrincipal up) {
            return new UUIDHolderHolder(up.getId());
        }
        // if delegate, try to access getId via casting
        try {
            java.lang.reflect.Method m = principal.getClass().getMethod("getId");
            Object val = m.invoke(principal);
            if (val instanceof java.util.UUID uuid) return new UUIDHolderHolder(uuid);
        } catch (Exception ignored) {}
        return new UUIDHolderHolder(java.util.UUID.randomUUID());
    }
}
