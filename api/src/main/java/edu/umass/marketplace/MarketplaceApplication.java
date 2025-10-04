package edu.umass.marketplace;

// UMass Marketplace API Main Application Class
// Spring Boot application entry point with component scanning and configuration
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarketplaceApplication.class, args);
    }
}
