package com.agrolink.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OtpSendRequest(
        @NotBlank @Email(message = "Invalid email format") String email,
        @NotBlank String phone
) {
}