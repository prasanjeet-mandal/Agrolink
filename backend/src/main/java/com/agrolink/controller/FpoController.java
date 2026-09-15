package com.agrolink.controller;


import com.agrolink.dto.fpo.FpoRequest;
import com.agrolink.dto.fpo.FpoResponse;
import com.agrolink.service.FpoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fpo")
public class FpoController {

    private final FpoService fpoService;

    public FpoController(FpoService fpoService) {
        this.fpoService = fpoService;
    }

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public FpoResponse createProfile(
            Authentication authentication,
            @Valid @RequestBody FpoRequest request
    ) {

        return fpoService.createProfile(
                authentication.getName(),
                request
        );
    }

    @GetMapping("/profile")
    public FpoResponse getProfile(
            Authentication authentication
    ) {

        return fpoService.getProfile(
                authentication.getName()
        );
    }

    @PutMapping("/profile")
    public FpoResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody FpoRequest request
    ) {

        return fpoService.updateProfile(
                authentication.getName(),
                request
        );
    }
}
