package com.suman.cloud.health.service;

import com.suman.cloud.health.dto.HealthResponse;
import org.springframework.stereotype.Service;

/**
 * Service providing health status inspection.
 */
@Service
public class HealthService {

    /**
     * Retrieves the current system health status.
     *
     * @return HealthResponse with status "UP"
     */
    public HealthResponse getHealthStatus() {
        return new HealthResponse("UP");
    }
}
