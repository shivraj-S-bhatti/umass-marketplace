package edu.umass.marketplace.config;

import edu.umass.marketplace.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}