package edu.umass.marketplace.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    // Frontend redirect URL - can be configured via environment
    private final String frontendRedirect = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            String email = (String) oidcUser.getAttributes().get("email");
            String name = (String) oidcUser.getAttributes().get("name");
            UUIDHolderHolder idHolder = UUIDHolderHolder.fromPrincipal(authentication.getPrincipal());

            // Restrict to @umass.edu domain
            if (email == null || !email.endsWith("@umass.edu")) {
                // Redirect to frontend with error message
                String errorRedirect = frontendRedirect + "/auth/success?error=Only+UMass+email+addresses+are+allowed";
                response.sendRedirect(errorRedirect);
                return;
            }

            String token = jwtUtil.generateToken(idHolder.getId(), email, name);
            String redirect = String.format(
                "%s/auth/success?token=%s&id=%s&email=%s&name=%s",
                frontendRedirect,
                java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(idHolder.getId().toString(), java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(name == null ? "" : name, java.nio.charset.StandardCharsets.UTF_8)
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
        if (principal instanceof edu.umass.marketplace.security.UserPrincipal up) {
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
