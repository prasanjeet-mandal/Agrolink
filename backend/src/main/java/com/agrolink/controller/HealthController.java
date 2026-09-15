package com.agrolink.controller;

import com.agrolink.dto.common.ApiResponse;
import com.agrolink.service.HealthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<ApiResponse<String>> healthCheck() {

        String status = healthService.checkHealth();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "FarmConnect backend is running",
                        status
                )
        );
    }
}
