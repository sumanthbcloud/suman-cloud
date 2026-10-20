package com.suman.cloud.health.controller;

import com.suman.cloud.health.dto.HealthResponse;
import com.suman.cloud.health.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing application health check endpoints.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /**
     * Health check endpoint.
     *
     * @return 200 OK with {"status": "UP"}
     */
    @GetMapping
    public ResponseEntity<HealthResponse> checkHealth() {
        return ResponseEntity.ok(healthService.getHealthStatus());
    }
}
