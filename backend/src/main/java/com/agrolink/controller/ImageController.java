package com.agrolink.controller;

import com.agrolink.dto.common.ApiResponse;
import com.agrolink.service.ImageService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> resolve(
            @RequestParam("q") String query) {

        ImageService.CachedResult result = imageService.resolve(query);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("url", result.url());
        data.put("source", result.source());
        data.put("cached", result.cached());

        return ResponseEntity.ok(
                ApiResponse.success("Image resolved", data)
        );
    }
}