package com.agrolink.service;

import com.agrolink.config.ImageConfig;

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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ImageService {

    private static final String GOOGLE_CSE_URL =
            "https://www.googleapis.com/customsearch/v1";

    private static final String WIKIMEDIA_API =
            "https://commons.wikimedia.org/w/api.php";

    private static final String DEFAULT_SEED = "agrolink";

    private final ImageConfig config;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, CachedResult> cache = new ConcurrentHashMap<>();

    public ImageService(ImageConfig config) {
        this.config = config;
    }

    public CachedResult resolve(String rawQuery) {

        String query = normalize(rawQuery);

        CachedResult existing = cache.get(query);
        if (existing != null) {
            return new CachedResult(
                    existing.url(),
                    existing.source(),
                    true
            );
        }

        String url = null;
        String source = "fallback";

        if (config.isConfigured()) {
            url = fetchFromGoogleCse(query);
            source = "google";
        }

        if (url == null) {
            url = fetchFromWikimedia(query);
            source = "wikimedia";
        }

        if (url == null) {
            url = deterministicPlaceholder(query);
        }

        CachedResult result = new CachedResult(url, source, false);
        cache.put(query, result);
        return result;
    }

    private String fetchFromGoogleCse(String query) {

        String apiUrl = GOOGLE_CSE_URL
                + "?key=" + encode(config.getCseKey())
                + "&cx=" + encode(config.getCseCx())
                + "&searchType=image"
                + "&num=1"
                + "&q=" + encode(query);

        return firstImageLink(
                getJson(apiUrl, null),
                "items"
        );
    }

    private String fetchFromWikimedia(String query) {

        String apiUrl = WIKIMEDIA_API
                + "?action=query"
                + "&generator=search"
                + "&gsrsearch=" + encode(query + " filetype:bitmap")
                + "&gsrnamespace=6"
                + "&gsrlimit=5"
                + "&prop=imageinfo"
                + "&iiprop=url"
                + "&iiurlwidth=480"
                + "&format=json";

        JsonNode root = getJson(apiUrl, "AgroLink/1.0 (demo)");
        if (root == null) {
            return null;
        }

        JsonNode pages = root.path("query").path("pages");
        for (JsonNode page : pages) {
            String title = page.path("title").asText("").toLowerCase();
            if (title.contains(".pdf") || title.contains(".doc") || title.contains(".svg")
                    || title.contains(".tif")) {
                continue;
            }
            JsonNode imageInfo = page.path("imageinfo");
            if (!imageInfo.isArray() || imageInfo.isEmpty()) {
                continue;
            }
            String thumb = imageInfo.get(0).path("thumburl").asText("");
            if (!thumb.isBlank()) {
                return thumb;
            }
        }
        return null;
    }

    private String firstImageLink(JsonNode root, String itemsField) {

        if (root == null) {
            return null;
        }

        JsonNode items = root.path(itemsField);
        if (!items.isArray() || items.isEmpty()) {
            return null;
        }

        for (JsonNode item : items) {
            String link = item.path("link").asText("");
            if (!link.isBlank()) {
                return link;
            }
        }
        return null;
    }

    private JsonNode getJson(String apiUrl, String userAgent) {

        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(12))
                .GET();

        if (userAgent != null && !userAgent.isBlank()) {
            builder.header("User-Agent", userAgent);
        }

        HttpResponse<String> response;

        try {
            response = http.send(
                    builder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );
        } catch (IOException | InterruptedException ex) {
            if (Thread.currentThread().isInterrupted()) {
                Thread.currentThread().interrupt();
            }
            return null;
        }

        if (response.statusCode() != 200) {
            return null;
        }

        try {
            return objectMapper.readTree(response.body());
        } catch (IOException ex) {
            return null;
        }
    }

    private String deterministicPlaceholder(String query) {

        return "https://picsum.photos/seed/"
                + sha1(query)
                + "/480/360";
    }

    private String sha1(String value) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 8);
        } catch (NoSuchAlgorithmException ex) {
            return "agrolink";
        }
    }

    private String normalize(String rawQuery) {

        if (rawQuery == null || rawQuery.isBlank()) {
            return DEFAULT_SEED;
        }

        String lower = rawQuery.toLowerCase().trim().replaceAll("\\s+", " ");
        if (lower.isBlank()) {
            return DEFAULT_SEED;
        }
        return lower;
    }

    private String encode(String value) {

        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public record CachedResult(String url, String source, boolean cached) {
    }
}