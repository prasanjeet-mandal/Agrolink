package com.agrolink.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record OtpVerifyRequest(
        @NotBlank String requestId,
        @NotBlank String phone,
        @NotBlank String code,
        String email
) {
}