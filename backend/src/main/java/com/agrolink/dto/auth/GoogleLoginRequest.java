package com.agrolink.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "Google authorization code is required")
        String code,
        String role,
        String vehicleNumber,
        String drivingLicense
) {
}