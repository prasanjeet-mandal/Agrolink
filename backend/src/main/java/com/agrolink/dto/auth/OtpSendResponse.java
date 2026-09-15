package com.agrolink.dto.auth;

public record OtpSendResponse(
        String requestId,
        String otp,
        String maskedEmail,
        String maskedPhone,
        long ttlSeconds
) {
}