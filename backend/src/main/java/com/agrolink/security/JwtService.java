package com.agrolink.security;


import com.agrolink.config.JwtConfig;
import com.agrolink.exception.BadRequestException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String PURPOSE_CLAIM = "purpose";

    private static final String PURPOSE_REGISTER = "REGISTER";

    private static final String PHONE_CLAIM = "phone";

    private final JwtConfig jwtConfig;

    public JwtService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                jwtConfig.getSecret()
                        .getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(SecurityUser user) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + jwtConfig.getExpiration()
        );

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {

        return extractAllClaims(token).getSubject();
    }

    public String generateRegistrationToken(String email, String phone) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + jwtConfig.getRegistrationExpiration()
        );

        return Jwts.builder()
                .subject(email)
                .claim(PURPOSE_CLAIM, PURPOSE_REGISTER)
                .claim(PHONE_CLAIM, phone == null ? "" : phone)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public RegistrationClaims verifyRegistrationToken(String token) {

        if (token == null || token.isBlank()) {
            throw new BadRequestException(
                    "Email verification is missing. Please complete OTP verification first"
            );
        }

        Claims claims = extractAllClaims(token);

        if (!PURPOSE_REGISTER.equals(claims.get(PURPOSE_CLAIM, String.class))) {
            throw new BadRequestException(
                    "Invalid email verification token"
            );
        }

        return new RegistrationClaims(
                claims.getSubject(),
                claims.get(PHONE_CLAIM, String.class)
        );
    }

    public record RegistrationClaims(String email, String phone) {
    }

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {

        String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}