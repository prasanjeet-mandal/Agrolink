package com.agrolink.dto.pricing;

import java.math.BigDecimal;

public record PriceCalculateResponse(
        BigDecimal suggested,
        BigDecimal min,
        BigDecimal max,
        Factors factors
) {

    public record Factors(
            Double grading,
            Double logistics,
            String qualityNote
    ) {
    }
}