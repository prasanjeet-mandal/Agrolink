package com.agrolink.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record DirectOrderRequest(

        @Valid @NotEmpty(message = "At least one item is required")
        List<DirectOrderItemRequest> items,

        @Valid @NotNull(message = "Delivery address is required")
        DirectDeliveryAddressRequest deliveryAddress,

        String paymentMethod,

        BigDecimal deliveryFee,

        BigDecimal totalAmount
) {
}