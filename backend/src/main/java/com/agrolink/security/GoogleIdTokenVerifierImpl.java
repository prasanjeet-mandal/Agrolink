package com.agrolink.security;

import com.agrolink.config.GoogleConfig;
import com.agrolink.exception.BadRequestException;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class GoogleIdTokenVerifierImpl implements GoogleIdTokenVerifier {

    private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";

    private static final Set<String> ALLOWED_ISSUERS = Set.of(
            "accounts.google.com",
            "https://accounts.google.com"
    );

    private final GoogleConfig config;

    private volatile JwtDecoder decoder;

    private final boolean configured;

    public GoogleIdTokenVerifierImpl(GoogleConfig config) {
        this.config = config;
        this.configured = !config.getClientId().isBlank();
    }

    @Override
    public boolean isConfigured() {
        return configured;
    }

    @Override
    public IdTokenInfo verify(String idToken) {

        if (idToken == null || idToken.isBlank()) {
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        Jwt jwt;

        try {
            jwt = decoder().decode(idToken);
        } catch (RuntimeException ex) {
            throw new BadRequestException(
                    "Invalid Google token"
            );
        }

        String issuer = jwt.getClaimAsString("iss");

        if (issuer == null || !ALLOWED_ISSUERS.contains(issuer)) {
            throw new BadRequestException(
                    "Invalid Google token"
            );
        }

        if (config.getClientId().isBlank()
                || jwt.getAudience().stream()
                        .noneMatch(config.getClientId()::equals)) {
            throw new BadRequestException(
                    "Invalid Google token"
            );
        }

        String email = jwt.getClaimAsString("email");

        if (email == null || email.isBlank()) {
            throw new BadRequestException(
                    "Your Google account has no email address"
            );
        }

        return new IdTokenInfo(
                jwt.getSubject(),
                email.toLowerCase(),
                jwt.getClaimAsString("name"),
                claimBoolean(jwt, "email_verified")
        );
    }

    private JwtDecoder decoder() {

        JwtDecoder current = decoder;

        if (current == null) {
            synchronized (this) {
                current = decoder;

                if (current == null) {
                    current = NimbusJwtDecoder
                            .withJwkSetUri(JWKS_URI)
                            .build();
                    decoder = current;
                }
            }
        }

        return current;
    }

    private boolean claimBoolean(Jwt jwt, String name) {

        Object value = jwt.getClaims().get(name);

        if (value instanceof Boolean bool) {
            return bool;
        }

        if (value instanceof String str) {
            return Boolean.parseBoolean(str);
        }

        return false;
    }
}