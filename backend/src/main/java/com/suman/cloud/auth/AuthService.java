package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.auth.dto.VerifyRequest;
import com.suman.cloud.email.EmailService;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.user.User;
import com.suman.cloud.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse signup(SignupRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.name().trim(), email, hashedPassword);

        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        user.setEmailVerified(false);

        userRepository.save(user);
        emailService.sendOtp(email, otp);

        return AuthResponse.message("Signup successful. Please verify the 6-digit code sent to your email.");
    }

    public AuthResponse verify(VerifyRequest request) {
        if (request.email() == null || request.otp() == null) {
            throw new IllegalArgumentException("Email and verification code are required");
        }

        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            return AuthResponse.message("Email is already verified. Please sign in.");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.otp().trim())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return AuthResponse.message("Email verified successfully! You can now sign in.");
    }

    public AuthResponse login(LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email is not verified. Please verify your OTP code.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return AuthResponse.success(token, user.getName(), user.getEmail());
    }
}
