package com.agrolink.dto.auth;

public record GoogleAuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String role,
        boolean needsRole,
        String signupTicket
) {
}