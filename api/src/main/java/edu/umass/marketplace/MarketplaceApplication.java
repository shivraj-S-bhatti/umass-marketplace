package edu.umass.marketplace;

// UMass Marketplace API Main Application Class
// Spring Boot application entry point with component scanning and configuration
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {
    "edu.umass.marketplace.common",
    "edu.umass.marketplace.marketplace",
    "edu.umass.marketplace.sports",
    "edu.umass.marketplace.events",
    "edu.umass.marketplace.clubs",
    "edu.umass.marketplace.commonroom"
})
@EnableScheduling
public class MarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarketplaceApplication.class, args);
    }
}
