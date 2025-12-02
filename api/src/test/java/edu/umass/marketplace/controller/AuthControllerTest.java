package edu.umass.marketplace.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.umass.marketplace.dto.LoginRequest;
import edu.umass.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.response.AuthResponse;
import edu.umass.marketplace.response.UserResponse;
import edu.umass.marketplace.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = AuthController.class,
    excludeAutoConfiguration = {
        OAuth2ClientAutoConfiguration.class,
        OAuth2ResourceServerAutoConfiguration.class,
        SecurityAutoConfiguration.class
    }
)
@AutoConfigureMockMvc(addFilters = false) // Disables Security Filters (403/401 checks)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private edu.umass.marketplace.security.JwtUtil jwtUtil;

    @MockBean
    private edu.umass.marketplace.repository.UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRegisterUser() throws Exception {
        // 1. Create Request
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@umass.edu");
        request.setPassword("password123");
        request.setName("John Doe");

        // 2. Mock Service Response
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("test@umass.edu")
                .build();
        AuthResponse response = new AuthResponse("fake-jwt-token", userResponse);
        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        // 3. Perform Request & Verify
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"));
    }

    @Test
    void shouldLoginUser() throws Exception {
        // 1. Create Request
        LoginRequest request = new LoginRequest();
        request.setEmail("test@umass.edu");
        request.setPassword("password123");

        // 2. Mock Service Response
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("test@umass.edu")
                .build();
        AuthResponse response = new AuthResponse("fake-jwt-token", userResponse);
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        // 3. Perform Request & Verify
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"));
    }
}
