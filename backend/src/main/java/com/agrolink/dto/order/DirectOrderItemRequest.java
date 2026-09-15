package com.agrolink.dto.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record DirectOrderItemRequest(

        @NotNull(message = "productId is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be positive")
        Double quantity
) {
}