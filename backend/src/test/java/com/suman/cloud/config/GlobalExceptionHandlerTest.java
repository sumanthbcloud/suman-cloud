package com.suman.cloud.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("handleBadRequest should return 400 with exception message")
    void shouldHandleBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleBadRequest(new IllegalArgumentException("Username already exists"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Username already exists");
    }

    @Test
    @DisplayName("handleConflict should return 400 with exception message")
    void shouldHandleConflict() {
        ResponseEntity<Map<String, String>> response =
                handler.handleConflict(new IllegalStateException("Unable to create account. Please try again."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Unable to create account. Please try again.");
    }

    @Test
    @DisplayName("handleDataIntegrity should sanitize username unique violation")
    void shouldSanitizeUsernameDataIntegrityViolation() {
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("duplicate key value violates unique constraint users_username_key");

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Username already exists");
    }

    @Test
    @DisplayName("handleDataIntegrity should sanitize email unique violation")
    void shouldSanitizeEmailDataIntegrityViolation() {
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("duplicate key value violates unique constraint users_email_key");

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Email already exists");
    }

    @Test
    @DisplayName("handleDataIntegrity should sanitize legacy column not-null violation")
    void shouldSanitizeLegacyColumnViolation() {
        DataIntegrityViolationException ex =
                new DataIntegrityViolationException("null value in column \"email_verified\" of relation \"users\" violates not-null constraint");

        ResponseEntity<Map<String, String>> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("message", "Unable to create account. Please try again.");
    }

    @Test
    @DisplayName("handleGeneral should never leak raw internal exception details")
    void shouldNeverLeakRawExceptionDetails() {
        Exception rawDbException =
                new RuntimeException("org.postgresql.util.PSQLException: ERROR: relation \"users\" does not exist at character 15");

        ResponseEntity<Map<String, String>> response = handler.handleGeneral(rawDbException);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("message", "Something went wrong. Please try again.");
        assertThat(response.getBody().get("message")).doesNotContain("PostgreSQL");
        assertThat(response.getBody().get("message")).doesNotContain("relation");
    }
}
