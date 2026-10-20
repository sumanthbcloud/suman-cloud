package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.user.User;
import com.suman.cloud.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

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
        userRepository.save(user);

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
