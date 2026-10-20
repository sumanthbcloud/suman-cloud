package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.security.JwtService;
import com.suman.cloud.user.User;
import com.suman.cloud.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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
    private JwtService jwtService;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("Signup should successfully create a user with hashed password without OTP/SES")
    void shouldSignupSuccessfully() {
        SignupRequest request = new SignupRequest("sumankumar", "user@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        AuthResponse response = authService.signup(request);

        assertThat(response.message()).contains("registered successfully");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("sumankumar");
        assertThat(savedUser.getEmail()).isEqualTo("user@example.com");
        assertThat(passwordEncoder.matches("pass123", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Signup should reject duplicate username")
    void shouldRejectDuplicateUsernameOnSignup() {
        SignupRequest request = new SignupRequest("sumankumar", "unique@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Signup should reject duplicate email")
    void shouldRejectDuplicateEmailOnSignup() {
        SignupRequest request = new SignupRequest("uniqueuser", "existing@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("uniqueuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Signup should reject missing required fields")
    void shouldRejectMissingRequiredFieldsOnSignup() {
        SignupRequest missingUsername = new SignupRequest("", "user@example.com", "pass123");
        assertThatThrownBy(() -> authService.signup(missingUsername))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Required fields missing");

        SignupRequest missingEmail = new SignupRequest("suman", "  ", "pass123");
        assertThatThrownBy(() -> authService.signup(missingEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Required fields missing");

        SignupRequest missingPassword = new SignupRequest("suman", "user@example.com", null);
        assertThatThrownBy(() -> authService.signup(missingPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Required fields missing");
    }

    @Test
    @DisplayName("Login using username should succeed and return JWT token")
    void shouldLoginSuccessfullyUsingUsername() {
        User user = new User("sumankumar", "user@example.com", passwordEncoder.encode("pass123"));
        user.setId(10L);

        when(userRepository.findByUsernameIgnoreCase("sumankumar")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(10L, "user@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(new LoginRequest("sumankumar", "pass123"));

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        assertThat(response.name()).isEqualTo("sumankumar");
        assertThat(response.email()).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("Login using email should succeed and return JWT token")
    void shouldLoginSuccessfullyUsingEmail() {
        User user = new User("sumankumar", "user@example.com", passwordEncoder.encode("pass123"));
        user.setId(10L);

        when(userRepository.findByUsernameIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(10L, "user@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(new LoginRequest("user@example.com", "pass123"));

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        assertThat(response.email()).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("Login should reject incorrect password")
    void shouldRejectIncorrectPasswordOnLogin() {
        User user = new User("sumankumar", "user@example.com", passwordEncoder.encode("correctPassword"));

        when(userRepository.findByUsernameIgnoreCase("sumankumar")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("sumankumar", "wrongPassword")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid username/email or password");
    }

    @Test
    @DisplayName("Existing email-only user without username can still log in using email")
    void shouldAllowExistingEmailOnlyUserToLogin() {
        User legacyUser = new User();
        legacyUser.setId(42L);
        legacyUser.setName("Legacy Suman");
        legacyUser.setEmail("legacy@example.com");
        legacyUser.setPassword(passwordEncoder.encode("legacySecret"));
        legacyUser.setUsername(null); // existing user has no username

        when(userRepository.findByUsernameIgnoreCase("legacy@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("legacy@example.com")).thenReturn(Optional.of(legacyUser));
        when(jwtService.generateToken(42L, "legacy@example.com")).thenReturn("legacy-jwt-token");

        AuthResponse response = authService.login(new LoginRequest("legacy@example.com", "legacySecret"));

        assertThat(response.token()).isEqualTo("legacy-jwt-token");
        assertThat(response.name()).isEqualTo("Legacy Suman");
        assertThat(response.email()).isEqualTo("legacy@example.com");
    }

    @Test
    @DisplayName("Login should reject missing required fields")
    void shouldRejectMissingRequiredFieldsOnLogin() {
        LoginRequest missingIdentifier = new LoginRequest(" ", "pass123");
        assertThatThrownBy(() -> authService.login(missingIdentifier))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Required fields missing");

        LoginRequest missingPassword = new LoginRequest("suman", null);
        assertThatThrownBy(() -> authService.login(missingPassword))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Required fields missing");
    }

    @Test
    @DisplayName("Signup should translate DB unique username constraint violation to clean error")
    void shouldTranslateDataIntegrityViolationOnUsernameToCleanError() {
        SignupRequest request = new SignupRequest("sumankumar", "user@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint users_username_key"));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username already exists");
    }

    @Test
    @DisplayName("Signup should translate DB unique email constraint violation to clean error")
    void shouldTranslateDataIntegrityViolationOnEmailToCleanError() {
        SignupRequest request = new SignupRequest("sumankumar", "user@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key value violates unique constraint users_email_key"));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already exists");
    }

    @Test
    @DisplayName("Signup should translate legacy column or not-null constraint violation to user-safe message")
    void shouldTranslateDataIntegrityViolationOnLegacyColumnToCleanError() {
        SignupRequest request = new SignupRequest("sumankumar", "user@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("null value in column \"email_verified\" of relation \"users\" violates not-null constraint"));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Unable to create account. Please try again.");
    }

    @Test
    @DisplayName("Signup should translate unexpected database exceptions to user-safe message")
    void shouldTranslateUnexpectedDatabaseExceptionToCleanError() {
        SignupRequest request = new SignupRequest("sumankumar", "user@example.com", "pass123");
        when(userRepository.existsByUsernameIgnoreCase("sumankumar")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenThrow(new RuntimeException("Database connection timeout"));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Unable to create account. Please try again.");
    }
}
