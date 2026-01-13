package edu.umass.marketplace.marketplace.controller;

// Health Controller - provides basic health check endpoint
// Simple endpoint to verify API is running and accessible
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns API status")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
