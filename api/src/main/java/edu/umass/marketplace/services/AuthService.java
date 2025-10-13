package edu.umass.marketplace.services;

import edu.umass.marketplace.dto.AuthResponse;
import edu.umass.marketplace.dto.LoginRequest;
import edu.umass.marketplace.dto.RegisterRequest;
import edu.umass.marketplace.entities.User;
import edu.umass.marketplace.entities.VerificationToken;
import edu.umass.marketplace.repositories.UserRepository;
import edu.umass.marketplace.repositories.VerificationTokenRepository;
import edu.umass.marketplace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender emailSender;
    private final JwtService jwtService;
    
    @Transactional
    public void register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        user = userRepository.save(user);
        
        // Create verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(OffsetDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);
        
        // Send verification email
        sendVerificationEmail(user.getEmail(), token);
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }
        
        String token = jwtService.generateToken(user);
        
        return AuthResponse.builder()
            .token(token)
            .email(user.getEmail())
            .name(user.getName())
            .build();
    }
    
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }
        
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        
        tokenRepository.delete(verificationToken);
    }
    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        // Delete existing tokens
        tokenRepository.findAll().stream()
            .filter(t -> t.getUser().equals(user))
            .forEach(tokenRepository::delete);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(OffsetDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);
        
        // Send new verification email
        sendVerificationEmail(email, token);
    }
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;
    
    @Value("${application.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    
    private void sendVerificationEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("UMass Marketplace <noreply@marketplace.umass.edu>");
        message.setSubject("Verify your UMass Marketplace account");
        
        String verificationUrl = String.format("%s/verify-email?token=%s", frontendUrl, token);
        String emailText = String.format("""
            Welcome to UMass Marketplace!
            
            Please verify your email address by clicking the link below:
            
            %s
            
            This link will expire in 24 hours.
            
            If you didn't create this account, please ignore this email.
            
            Best regards,
            UMass Marketplace Team
            """, verificationUrl);
        
        message.setText(emailText);
        
        try {
            emailSender.send(message);
        } catch (MailException e) {
            // Log the error but don't expose email service failures to users
            log.error("Failed to send verification email to {}: {}", email, e.getMessage());
            if (!"prod".equals(activeProfile)) {
                // In non-prod environments, provide the verification link in logs
                log.info("Development verification link: {}", verificationUrl);
            }
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }
}