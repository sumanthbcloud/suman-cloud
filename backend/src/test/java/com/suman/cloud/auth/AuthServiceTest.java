package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.auth.dto.VerifyRequest;
import com.suman.cloud.email.EmailService;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.user.User;
import com.suman.cloud.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private JwtService jwtService;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, jwtService, emailService);
    }

    @Test
    @DisplayName("Signup should create user with unverified email, OTP, and send email")
    void shouldSignupSuccessfully() {
        SignupRequest request = new SignupRequest("Suman", "user@example.com", "pass123");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        AuthResponse response = authService.signup(request);

        assertThat(response.message()).contains("verify the 6-digit code");
        verify(userRepository).save(any(User.class));
        verify(emailService).sendOtp(eq("user@example.com"), anyString());
    }

    @Test
    @DisplayName("Signup should fail when SES fails to deliver OTP")
    void shouldFailSignupWhenSesFails() {
        SignupRequest request = new SignupRequest("Suman", "user@example.com", "pass123");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        doThrow(new IllegalStateException("Failed to send verification email. Check Amazon SES configuration."))
                .when(emailService).sendOtp(eq("user@example.com"), anyString());

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Check Amazon SES configuration");
    }

    @Test
    @DisplayName("Verify OTP should activate user and clear OTP fields")
    void shouldVerifyOtpSuccessfully() {
        User user = new User("Suman", "user@example.com", passwordEncoder.encode("pass123"));
        user.setOtpCode("123456");
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.verify(new VerifyRequest("user@example.com", "123456"));

        assertThat(response.message()).contains("Email verified successfully");
        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getOtpCode()).isNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Login should return JWT when credentials are valid and email is verified")
    void shouldLoginSuccessfully() {
        User user = new User("Suman", "user@example.com", passwordEncoder.encode("pass123"));
        user.setId(10L);
        user.setEmailVerified(true);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(10L, "user@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(new LoginRequest("user@example.com", "pass123"));

        assertThat(response.token()).isEqualTo("mock-jwt-token");
    }

    @Test
    @DisplayName("Login should reject unverified users")
    void shouldRejectUnverifiedUserOnLogin() {
        User user = new User("Suman", "user@example.com", passwordEncoder.encode("pass123"));
        user.setEmailVerified(false);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("user@example.com", "pass123")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not verified");
    }
}
