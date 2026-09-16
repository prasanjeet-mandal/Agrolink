package com.agrolink.security;

import com.agrolink.config.GoogleConfig;
import com.agrolink.exception.BadRequestException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Service
public class GoogleTokenExchangerImpl implements GoogleTokenExchanger {

    private static final URI TOKEN_URI =
            URI.create("https://oauth2.googleapis.com/token");

    private static final String POSTMESSAGE_REDIRECT = "postmessage";

    private final GoogleConfig config;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleTokenExchangerImpl(GoogleConfig config) {
        this.config = config;
    }

    @Override
    public String exchangeForIdToken(String authorizationCode) {

        if (!config.isConfigured()) {
            throw new BadRequestException(
                    "Google sign-in is not configured on this server"
            );
        }

        if (authorizationCode == null || authorizationCode.isBlank()) {
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        List<String> form = List.of(
                "grant_type=authorization_code",
                "code=" + encode(authorizationCode),
                "client_id=" + encode(config.getClientId()),
                "client_secret=" + encode(config.getClientSecret()),
                "redirect_uri=" + POSTMESSAGE_REDIRECT
        );

        HttpRequest request = HttpRequest.newBuilder(TOKEN_URI)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(String.join("&", form)))
                .build();

        HttpResponse<String> response;

        try {
            response = http.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException ex) {
            if (Thread.currentThread().isInterrupted()) {
                Thread.currentThread().interrupt();
            }
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        JsonNode body;

        try {
            body = objectMapper.readTree(response.body());
        } catch (IOException ex) {
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        if (response.statusCode() != 200) {
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        JsonNode idToken = body.get("id_token");

        if (idToken == null || idToken.asText("").isBlank()) {
            throw new BadRequestException(
                    "Google authentication failed. Please try again"
            );
        }

        return idToken.asText();
    }

    private String encode(String value) {

        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}