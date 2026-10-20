package com.suman.cloud.auth;

import com.suman.cloud.auth.dto.AuthResponse;
import com.suman.cloud.auth.dto.LoginRequest;
import com.suman.cloud.auth.dto.SignupRequest;
import com.suman.cloud.auth.dto.VerifyRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@RequestBody VerifyRequest request) {
        return ResponseEntity.ok(authService.verify(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
