package com.agrolink.dto.delivery;

import jakarta.validation.constraints.NotNull;

public record DeliveryConfirmRequest(
        @NotNull Long orderId
) {
}