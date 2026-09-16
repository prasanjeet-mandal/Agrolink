package com.agrolink.controller;


import com.agrolink.dto.farmer.FarmerRequest;
import com.agrolink.dto.farmer.FarmerResponse;
import com.agrolink.service.FarmerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public FarmerResponse createProfile(
            Authentication authentication,
            @Valid @RequestBody FarmerRequest request
    ) {

        return farmerService.createProfile(
                authentication.getName(),
                request
        );
    }

    @GetMapping("/profile")
    public FarmerResponse getProfile(
            Authentication authentication
    ) {

        return farmerService.getProfile(
                authentication.getName()
        );
    }

    @PutMapping("/profile")
    public FarmerResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody FarmerRequest request
    ) {

        return farmerService.updateProfile(
                authentication.getName(),
                request
        );
    }
}
