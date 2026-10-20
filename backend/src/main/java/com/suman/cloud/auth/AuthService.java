package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.user.User;
import com.suman.cloud.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        if (request == null ||
                request.username() == null || request.username().isBlank() ||
                request.email() == null || request.email().isBlank() ||
                request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Required fields missing");
        }

        String username = request.username().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(username, email, hashedPassword);
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            logger.error("Data integrity violation during signup for username '{}', email '{}': {}", username, email, ex.getMessage(), ex);
            String details = (ex.getMessage() != null ? ex.getMessage() : "") + " "
                    + (ex.getRootCause() != null && ex.getRootCause().getMessage() != null ? ex.getRootCause().getMessage() : "");
            String lower = details.toLowerCase();
            boolean isUnique = lower.contains("unique") || lower.contains("duplicate") || lower.contains("already exists");
            if (isUnique && (lower.contains("username") || lower.contains("users_username"))) {
                throw new IllegalArgumentException("Username already exists");
            } else if (isUnique && (lower.contains("users_email") || (lower.contains("email") && !lower.contains("email_verified")))) {
                throw new IllegalArgumentException("Email already exists");
            }
            throw new IllegalStateException("Unable to create account. Please try again.");
        } catch (Exception ex) {
            logger.error("Unexpected error saving user '{}', email '{}': {}", username, email, ex.getMessage(), ex);
            throw new IllegalStateException("Unable to create account. Please try again.");
        }

        return AuthResponse.message("User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null ||
                request.getEffectiveIdentifier() == null || request.getEffectiveIdentifier().isBlank() ||
                request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Required fields missing");
        }

        String cleanIdentifier = request.getEffectiveIdentifier().trim();
        User user = userRepository.findByUsernameIgnoreCase(cleanIdentifier)
                .or(() -> userRepository.findByEmail(cleanIdentifier.toLowerCase()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username/email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        String displayName = user.getUsername() != null && !user.getUsername().isBlank()
                ? user.getUsername()
                : user.getName();

        return AuthResponse.success(token, displayName, user.getEmail());
    }
}
