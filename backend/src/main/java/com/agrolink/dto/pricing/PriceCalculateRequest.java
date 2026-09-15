package com.agrolink.dto.pricing;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record PriceCalculateRequest(
        @NotNull @Positive BigDecimal basePrice,
        List<String> grades,
        String mode
) {
}