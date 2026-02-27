package edu.umass.marketplace.common.config;

import edu.umass.marketplace.common.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    @Value("${app.jwt-secret}")
    private String secretKey;

    @Bean
    public JwtUtil jwtUtil() {
        // 7 days in milliseconds
        long expiry = 1000L * 60 * 60 * 24 * 7;
        return new JwtUtil(secretKey, expiry);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}