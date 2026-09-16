package com.agrolink.dto.delivery;

public record DeliveryStatusResponse(
        Long orderId,
        String orderNumber,
        String status
) {
}