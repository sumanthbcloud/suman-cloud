package com.suman.cloud.auth.dto;

public record AuthResponse(String token, String name, String email, String message) {
    public static AuthResponse message(String message) {
        return new AuthResponse(null, null, null, message);
    }

    public static AuthResponse success(String token, String name, String email) {
        return new AuthResponse(token, name, email, "Authentication successful");
    }
}
