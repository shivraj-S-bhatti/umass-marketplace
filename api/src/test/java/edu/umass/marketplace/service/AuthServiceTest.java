package edu.umass.marketplace.service;

import edu.umass.marketplace.marketplace.dto.LoginRequest;
import edu.umass.marketplace.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.marketplace.model.User;
import edu.umass.marketplace.marketplace.response.AuthResponse;
import edu.umass.marketplace.common.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private edu.umass.marketplace.marketplace.service.UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private edu.umass.marketplace.marketplace.service.AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@umass.edu");
        registerRequest.setName("Test User");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@umass.edu");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@umass.edu");
        testUser.setName("Test User");
        testUser.setPasswordHash("$2a$10$hashedpassword");
    }

    @Test
    void shouldRegisterUser() {
        // Given
        when(userService.userExistsByEmail("test@umass.edu")).thenReturn(false);
        when(userService.createUser(any(RegisterRequest.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(any(), anyString(), anyString())).thenReturn("mock-token");

        // When
        AuthResponse result = authService.register(registerRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isNotBlank();
        verify(userService, times(1)).createUser(any(RegisterRequest.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisteringExistingUser() {
        // Given
        when(userService.userExistsByEmail("test@umass.edu")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(userService, never()).createUser(any(RegisterRequest.class));
    }

    @Test
    void shouldLoginUser() {
        // Given
        when(userService.getUserByEmail("test@umass.edu"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$hashedpassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), anyString(), anyString())).thenReturn("mock-token");

        // When
        AuthResponse result = authService.login(loginRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getToken()).isNotBlank();
    }

    @Test
    void shouldThrowExceptionWhenLoginWithInvalidEmail() {
        // Given
        when(userService.getUserByEmail("wrong@umass.edu"))
                .thenReturn(Optional.empty());

        // When & Then
        loginRequest.setEmail("wrong@umass.edu");
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void shouldThrowExceptionWhenLoginWithInvalidPassword() {
        // Given
        when(userService.getUserByEmail("test@umass.edu"))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$10$hashedpassword")).thenReturn(false);

        // When & Then
        loginRequest.setPassword("wrongpassword");
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
