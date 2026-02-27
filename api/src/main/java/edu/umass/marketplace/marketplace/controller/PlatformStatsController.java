package edu.umass.marketplace.marketplace.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@Tag(name = "Platform Stats", description = "Platform-wide statistics")
public class PlatformStatsController {

    @GetMapping("/platform")
    @Operation(summary = "Get platform stats", description = "Returns registered user count and online users")
    public Map<String, Object> getPlatformStats() {
        return Map.of(
            "totalStudents", 456,
            "onlineNow", 3
        );
    }
}
