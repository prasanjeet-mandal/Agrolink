package com.agrolink.dto.demand;

import java.time.LocalDateTime;
import java.util.List;

public record DemandForecastResponse(
        String id,
        Long productId,
        String name,
        String district,
        String demandLevel,
        List<Point> history,
        List<Point> forecast,
        Double confidence
) {

    public record Point(LocalDateTime at, Double value) {
    }
}