package com.suman.cloud.health;

import com.suman.cloud.health.dto.HealthResponse;
import com.suman.cloud.health.service.HealthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HealthServiceTest {

    @Test
    @DisplayName("HealthService should return status UP")
    void shouldReturnHealthStatusUp() {
        HealthService healthService = new HealthService();
        HealthResponse response = healthService.getHealthStatus();

        assertNotNull(response);
        assertEquals("UP", response.status());
    }
}
