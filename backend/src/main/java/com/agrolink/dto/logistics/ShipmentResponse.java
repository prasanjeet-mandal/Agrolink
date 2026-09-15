package com.agrolink.dto.logistics;

import java.time.LocalDateTime;
import java.util.List;

public record ShipmentResponse(
        Long id,
        String shipmentNumber,
        Long orderId,
        String status,
        String pickupLocation,
        String deliveryLocation,
        List<RoutePoint> route,
        Vehicle vehicle,
        Double distanceKm,
        Integer etaMinutes,
        Double charge,
        LocalDateTime eta,
        LocalDateTime etd,
        RoutePoint currentLocation
) {

    public record RoutePoint(String name, double lat, double lng) {
    }

    public record Vehicle(Long id, String type, String plate, String driverName, String driverPhone, String status) {
    }
}