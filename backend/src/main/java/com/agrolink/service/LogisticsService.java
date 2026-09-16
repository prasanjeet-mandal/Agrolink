package com.agrolink.service;

import com.agrolink.dto.logistics.*;

import java.util.List;

public interface LogisticsService {

    LogisticsResponse create(String email, Long orderId);

    LogisticsResponse assign(String email, Long id, AssignDeliveryRequest r);

    LogisticsResponse status(String email, Long id, LogisticsStatusRequest r);

    List<LogisticsResponse> mine(String email);

    LogisticsResponse route(Long id);

    LogisticsResponse location(String email, Long id, UpdateLocationRequest r);

    List<ShipmentResponse> shipments();

    ShipmentResponse shipment(Long id);

    ShipmentResponse shipmentForOrder(Long orderId);

    List<ShipmentResponse.Vehicle> vehicles();
}