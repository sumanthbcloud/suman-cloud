package com.suman.cloud.auth.dto;

public record LoginRequest(String identifier, String email, String password) {

    public LoginRequest(String identifier, String password) {
        this(identifier, null, password);
    }

    public String getEffectiveIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        if (email != null && !email.isBlank()) {
            return email.trim();
        }
        return null;
    }
}
