package edu.umass.marketplace.common.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Single source of truth for superuser (admin) check.
 * Configured via app.superuser-email (SUPERUSER_EMAIL env). Used by SecurityConfig,
 * UserController, AuthService, ListingService.
 */
@Component
public class SuperuserConfig {

    private static final Logger log = LoggerFactory.getLogger(SuperuserConfig.class);
    private static final String LOG_PREFIX = "[Superuser]";

    @Value("${app.superuser-email:}")
    private String configuredEmail;

    @PostConstruct
    public void logConfig() {
        boolean blank = configuredEmail == null || configuredEmail.isBlank();
        log.info("{} configured email = '{}' (blank={})", LOG_PREFIX, configuredEmail, blank);
    }

    /**
     * Returns true only if the given email matches the configured superuser email (case-insensitive, trimmed).
     */
    public boolean isSuperuser(String email) {
        boolean result = configuredEmail != null && !configuredEmail.isBlank()
                && email != null
                && configuredEmail.trim().equalsIgnoreCase(email.trim());
        log.debug("{} isSuperuser(email={}, configured={}, result={})",
                LOG_PREFIX, email, configuredEmail, result);
        return result;
    }
}
