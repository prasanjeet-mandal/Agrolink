package com.agrolink.controller;

import com.agrolink.dto.delivery.DeliveryConfirmRequest;
import com.agrolink.dto.delivery.DeliveryStatusResponse;
import com.agrolink.service.DeliveryService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final DeliveryService s;

    public DeliveryController(DeliveryService s) {
        this.s = s;
    }

    @GetMapping("/status/{orderId}")
    public DeliveryStatusResponse status(Authentication a, @PathVariable Long orderId) {
        return s.status(a.getName(), orderId);
    }

    @PostMapping("/confirm")
    public DeliveryStatusResponse confirm(Authentication a, @Valid @RequestBody DeliveryConfirmRequest r) {
        return s.confirm(a.getName(), r);
    }
}