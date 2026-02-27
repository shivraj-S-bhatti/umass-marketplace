package edu.umass.marketplace.security;

import edu.umass.marketplace.common.security.JwtUtil;
import edu.umass.marketplace.common.security.OAuth2LoginSuccessHandler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OAuth2LoginSuccessHandlerTest {

    private JwtUtil jwtUtil;
    private OAuth2LoginSuccessHandler handler;

    @BeforeEach
    void setUp() {
        jwtUtil = mock(JwtUtil.class);
        handler = new OAuth2LoginSuccessHandler(jwtUtil);
    }

    @Test
    void onAuthenticationSuccess_allowsUmassEmail_andRedirectsWithToken() throws Exception {
        Authentication auth = mock(Authentication.class);
        OidcUser oidcUser = mock(OidcUser.class);
        when(oidcUser.getAttributes()).thenReturn(Map.of("email", "alice@umass.edu", "name", "Alice"));
        when(auth.getPrincipal()).thenReturn(oidcUser);

        when(jwtUtil.generateToken(any(java.util.UUID.class), eq("alice@umass.edu"), eq("Alice"))).thenReturn("fixed-token");

        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse resp = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(req, resp, auth);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(resp, times(1)).sendRedirect(captor.capture());
        String redirect = captor.getValue();

        assertTrue(redirect.contains("/auth/success"));
        assertTrue(redirect.contains("token="));
        assertTrue(redirect.contains("alice%40umass.edu") || redirect.contains("alice@umass.edu"));
        assertTrue(redirect.contains("fixed-token") || redirect.contains("fixed-token"));
    }

    @Test
    void onAuthenticationSuccess_rejectsNonUmassEmail_andRedirectsWithError() throws Exception {
        Authentication auth = mock(Authentication.class);
        OidcUser oidcUser = mock(OidcUser.class);
        when(oidcUser.getAttributes()).thenReturn(Map.of("email", "bob@gmail.com", "name", "Bob"));
        when(auth.getPrincipal()).thenReturn(oidcUser);

        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse resp = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(req, resp, auth);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(resp, times(1)).sendRedirect(captor.capture());
        String redirect = captor.getValue();

        assertTrue(redirect.contains("/auth/success"));
        assertTrue(redirect.contains("error=Only+UMass+email+addresses+are+allowed") || redirect.contains("Only UMass email addresses are allowed"));
    }

    @Test
    void onAuthenticationSuccess_includesSuperuserTrue_whenPrincipalHasRoleAdmin() throws Exception {
        Authentication auth = mock(Authentication.class);
        OidcUser oidcUser = mock(OidcUser.class);
        when(oidcUser.getAttributes()).thenReturn(Map.of(
                "email", "test-superuser@umass.edu",
                "name", "Test Superuser"));
        when(auth.getPrincipal()).thenReturn(oidcUser);
        List<SimpleGrantedAuthority> authoritiesWithAdmin = new ArrayList<>();
        authoritiesWithAdmin.add(new SimpleGrantedAuthority("ROLE_USER"));
        authoritiesWithAdmin.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        doReturn(authoritiesWithAdmin).when(auth).getAuthorities();

        when(jwtUtil.generateToken(any(java.util.UUID.class), eq("test-superuser@umass.edu"), eq("Test Superuser"))).thenReturn("fixed-token");

        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse resp = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(req, resp, auth);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(resp, times(1)).sendRedirect(captor.capture());
        String redirect = captor.getValue();

        assertTrue(redirect.contains("/auth/success"));
        assertTrue(redirect.contains("superuser=true"), "Redirect should contain superuser=true when user has ROLE_ADMIN");
    }

    @Test
    void onAuthenticationSuccess_includesSuperuserFalse_whenPrincipalHasOnlyRoleUser() throws Exception {
        Authentication auth = mock(Authentication.class);
        OidcUser oidcUser = mock(OidcUser.class);
        when(oidcUser.getAttributes()).thenReturn(Map.of(
                "email", "test-superuser@umass.edu",
                "name", "Test Superuser"));
        when(auth.getPrincipal()).thenReturn(oidcUser);
        List<SimpleGrantedAuthority> userOnly = new ArrayList<>();
        userOnly.add(new SimpleGrantedAuthority("ROLE_USER"));
        doReturn(userOnly).when(auth).getAuthorities();

        when(jwtUtil.generateToken(any(java.util.UUID.class), eq("test-superuser@umass.edu"), eq("Test Superuser"))).thenReturn("fixed-token");

        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse resp = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(req, resp, auth);

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(resp, times(1)).sendRedirect(captor.capture());
        String redirect = captor.getValue();

        assertTrue(redirect.contains("/auth/success"));
        assertTrue(redirect.contains("superuser=false"), "Redirect should contain superuser=false when user has only ROLE_USER");
    }
}
