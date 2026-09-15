package com.agrolink.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record GoogleSignupRequest(
        @NotBlank(message = "Google sign-up session is required")
        String signupTicket,
        @NotBlank(message = "Role is required")
        String role,
        String vehicleNumber,
        String drivingLicense
) {
}