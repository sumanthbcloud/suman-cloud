package com.suman.cloud.health.dto;

/**
 * Health response DTO.
 *
 * @param status the health status of the application (e.g. "UP")
 */
public record HealthResponse(String status) {
}
