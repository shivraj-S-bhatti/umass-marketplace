package edu.umass.marketplace.security;

// Security Configuration - configures Spring Security for the marketplace API
// Allows anonymous access to health and Swagger endpoints, prepares for OAuth2 integration
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Allow anonymous access to health check and Swagger endpoints
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            // Disable CSRF for API endpoints (handled by OAuth2)
            .csrf(csrf -> csrf.disable())
            // Configure OAuth2 login (placeholder for now)
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/oauth2/authorization/google")
                .defaultSuccessUrl("/", true)
            );
        
        return http.build();
    }
}
