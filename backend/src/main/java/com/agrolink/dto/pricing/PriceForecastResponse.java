package com.agrolink.dto.pricing;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PriceForecastResponse(
        Long productId,
        String productName,
        String unit,
        BigDecimal basePrice,
        List<Point> history,
        List<Point> forecast,
        Double confidence
) {

    public record Point(LocalDateTime at, Double value) {
    }
}