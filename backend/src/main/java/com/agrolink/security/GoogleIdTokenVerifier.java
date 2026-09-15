package com.agrolink.security;

public interface GoogleIdTokenVerifier {

    boolean isConfigured();

    IdTokenInfo verify(String idToken);

    record IdTokenInfo(
            String subject,
            String email,
            String name,
            boolean emailVerified
    ) {
    }
}