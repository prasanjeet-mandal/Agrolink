package com.agrolink.controller;


import com.agrolink.dto.auth.AuthResponse;
import com.agrolink.dto.auth.GoogleAuthResponse;
import com.agrolink.dto.auth.GoogleLoginRequest;
import com.agrolink.dto.auth.GoogleSignupRequest;
import com.agrolink.dto.auth.LoginRequest;
import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;
import com.agrolink.dto.auth.RegisterRequest;
import com.agrolink.dto.user.UserResponse;
import com.agrolink.service.AuthService;
import com.agrolink.service.GoogleAuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    public AuthController(
            AuthService authService,
            GoogleAuthService googleAuthService
    ) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/google")
    public ResponseEntity<GoogleAuthResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {

        return ResponseEntity.ok(
                googleAuthService.googleLogin(request)
        );
    }

    @PostMapping("/google/complete")
    public ResponseEntity<GoogleAuthResponse> googleSignupComplete(
            @Valid @RequestBody GoogleSignupRequest request
    ) {

        return ResponseEntity.ok(
                googleAuthService.completeSignup(request)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                authService.me(authentication.getName())
        );
    }

    @PostMapping("/otp/send")
    public ResponseEntity<OtpSendResponse> sendOtp(
            @Valid @RequestBody OtpSendRequest request
    ) {

        return ResponseEntity.ok(
                authService.sendOtp(request)
        );
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<OtpVerifyResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {

        return ResponseEntity.ok(
                authService.verifyOtp(request)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody(required = false) Map<String, String> body
    ) {

        String email = body == null
                ? null
                : body.get("email");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        authService.forgotPassword(email)
                )
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody(required = false) Map<String, String> body
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        authService.resetPassword(
                                body == null ? null : body.get("token"),
                                body == null ? null : body.get("password")
                        )
                )
        );
    }
}