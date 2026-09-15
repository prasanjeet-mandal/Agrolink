package com.agrolink.controller;


import com.agrolink.dto.address.AddressRequest;
import com.agrolink.dto.address.AddressResponse;
import com.agrolink.service.AddressService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(
            AddressService addressService
    ) {
        this.addressService = addressService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse create(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {

        return addressService.create(
                authentication.getName(),
                request
        );
    }

    @GetMapping
    public List<AddressResponse> getAll(
            Authentication authentication
    ) {

        return addressService.getAll(
                authentication.getName()
        );
    }

    @PutMapping("/{addressId}")
    public AddressResponse update(
            Authentication authentication,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request
    ) {

        return addressService.update(
                authentication.getName(),
                addressId,
                request
        );
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable Long addressId
    ) {

        addressService.delete(
                authentication.getName(),
                addressId
        );
    }
}