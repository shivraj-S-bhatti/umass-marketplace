package edu.umass.marketplace.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = edu.umass.marketplace.marketplace.controller.HealthController.class)
@org.springframework.context.annotation.Import(edu.umass.marketplace.common.security.SecurityConfig.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private edu.umass.marketplace.common.security.JwtUtil jwtUtil;

    @org.springframework.boot.test.mock.mockito.MockBean
    private edu.umass.marketplace.marketplace.repository.UserRepository userRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private edu.umass.marketplace.common.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @org.springframework.boot.test.mock.mockito.MockBean
    private edu.umass.marketplace.common.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws Exception {
        org.mockito.Mockito.doAnswer(invocation -> {
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void shouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }
}

