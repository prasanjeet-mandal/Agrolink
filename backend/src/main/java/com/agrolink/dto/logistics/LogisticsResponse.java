package com.agrolink.dto.logistics;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record LogisticsResponse(
        Long id,
        Long orderId,
        String orderNumber,
        Long deliveryPartnerId,
        String status,
        String pickupLocation,
        String deliveryLocation,
        Double distanceKm,
        Integer etaMinutes,
        String routeSummary,
        String buyerName,
        List<Item> items,
        BigDecimal totalAmount,
        DeliveryAddress deliveryAddress,
        LocalDateTime createdAt,
        Double pickupLatitude,
        Double pickupLongitude,
        Double deliveryLatitude,
        Double deliveryLongitude,
        Double currentLatitude,
        Double currentLongitude
) {

    public record Item(
            Long productId,
            String productName,
            Double quantity,
            String unit,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {
    }

    public record DeliveryAddress(
            String line1,
            String city,
            String state,
            String pincode
    ) {
    }
}