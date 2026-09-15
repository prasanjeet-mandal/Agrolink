package com.agrolink.dto.auth;

public record OtpVerifyResponse(
        boolean verified,
        String requestId,
        String registrationToken,
        long expiresInSeconds
) {
}