package com.agrolink.controller;

import com.agrolink.dto.demand.DemandForecastResponse;
import com.agrolink.dto.demand.DemandListResponse;
import com.agrolink.service.DemandService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demand")
public class DemandController {

    private final DemandService s;

    public DemandController(DemandService s) {
        this.s = s;
    }

    @GetMapping("/forecast")
    public DemandListResponse forecasts() {
        return s.forecasts();
    }

    @GetMapping("/forecast/{productId}")
    public DemandForecastResponse forecastFor(@PathVariable Long productId) {
        return s.forecastFor(productId);
    }
}