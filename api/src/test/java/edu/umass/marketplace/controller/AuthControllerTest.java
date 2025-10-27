package edu.umass.marketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umass.marketplace.dto.LoginRequest;
import edu.umass.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.response.AuthResponse;
import edu.umass.marketplace.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class,
            excludeAutoConfiguration = {org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@umass.edu");
        registerRequest.setName("Test User");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@umass.edu");
        loginRequest.setPassword("password123");

        authResponse = AuthResponse.builder()
                .token("mock-jwt-token")
                .build();
    }

    @Test
    void shouldRegisterUser() throws Exception {
        // Given
        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));

        verify(authService, times(1)).register(any(RegisterRequest.class));
    }

    @Test
    void shouldRejectInvalidRegistration() throws Exception {
        // Given - Create invalid request
        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setEmail(""); // Invalid: empty email

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLoginUser() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));

        verify(authService, times(1)).login(any(LoginRequest.class));
    }

    @Test
    void shouldRejectInvalidLogin() throws Exception {
        // Given - Create invalid request
        LoginRequest invalidRequest = new LoginRequest();
        invalidRequest.setEmail(""); // Invalid: empty email

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}

