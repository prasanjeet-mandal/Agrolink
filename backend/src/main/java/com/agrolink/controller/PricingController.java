package com.agrolink.controller;

import com.agrolink.dto.pricing.*;
import com.agrolink.service.PricingService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private final PricingService s;

    public PricingController(PricingService s) {
        this.s = s;
    }

    @GetMapping("/forecast/{productId}")
    public PriceForecastResponse forecast(@PathVariable Long productId) {
        return s.forecast(productId);
    }

    @PostMapping("/calculate")
    public PriceCalculateResponse calculate(@Valid @RequestBody PriceCalculateRequest r) {
        return s.calculate(r);
    }

    @GetMapping("/trend")
    public PriceTrendResponse trend() {
        return s.trend();
    }
}