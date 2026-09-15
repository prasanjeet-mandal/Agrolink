package com.agrolink.controller;

import com.agrolink.dto.logistics.*;
import com.agrolink.service.LogisticsService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics")
public class LogisticsController {

    private final LogisticsService s;

    public LogisticsController(LogisticsService s) {
        this.s = s;
    }

    @PostMapping("/orders/{orderId}")
    public LogisticsResponse create(Authentication a, @PathVariable Long orderId) {
        return s.create(a.getName(), orderId);
    }

    @GetMapping("/mine")
    public List<LogisticsResponse> mine(Authentication a) {
        return s.mine(a.getName());
    }

    @GetMapping("/shipments")
    public List<ShipmentResponse> shipments() {
        return s.shipments();
    }

    @GetMapping("/shipments/{id}")
    public ShipmentResponse shipment(@PathVariable Long id) {
        return s.shipment(id);
    }

    @GetMapping("/shipments/order/{orderId}")
    public ShipmentResponse shipmentForOrder(@PathVariable Long orderId) {
        return s.shipmentForOrder(orderId);
    }

    @GetMapping("/vehicles")
    public List<ShipmentResponse.Vehicle> vehicles() {
        return s.vehicles();
    }

    @PostMapping("/{id}/route")
    public LogisticsResponse route(@PathVariable Long id) {
        return s.route(id);
    }

    @PutMapping("/{id}/assign")
    public LogisticsResponse assign(Authentication a, @PathVariable Long id, @Valid @RequestBody AssignDeliveryRequest r) {
        return s.assign(a.getName(), id, r);
    }

    @PutMapping("/{id}/status")
    public LogisticsResponse status(Authentication a, @PathVariable Long id, @Valid @RequestBody LogisticsStatusRequest r) {
        return s.status(a.getName(), id, r);
    }

    @PutMapping("/{id}/location")
    public LogisticsResponse location(Authentication a, @PathVariable Long id, @Valid @RequestBody UpdateLocationRequest r) {
        return s.location(a.getName(), id, r);
    }
}