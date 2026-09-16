package com.agrolink.controller;


import com.agrolink.dto.farm.FarmRequest;
import com.agrolink.dto.farm.FarmResponse;
import com.agrolink.service.FarmService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/farms")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmResponse createFarm(
            Authentication authentication,
            @Valid @RequestBody FarmRequest request
    ) {

        return farmService.createFarm(
                authentication.getName(),
                request
        );
    }

    @GetMapping
    public List<FarmResponse> getMyFarms(
            Authentication authentication
    ) {

        return farmService.getMyFarms(
                authentication.getName()
        );
    }

    @PutMapping("/{farmId}")
    public FarmResponse updateFarm(
            Authentication authentication,
            @PathVariable Long farmId,
            @Valid @RequestBody FarmRequest request
    ) {

        return farmService.updateFarm(
                authentication.getName(),
                farmId,
                request
        );
    }

    @DeleteMapping("/{farmId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFarm(
            Authentication authentication,
            @PathVariable Long farmId
    ) {

        farmService.deleteFarm(
                authentication.getName(),
                farmId
        );
    }
}