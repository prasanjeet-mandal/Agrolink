package com.agrolink.dto.order;
import jakarta.validation.constraints.NotNull;
public record CheckoutRequest(@NotNull Long shippingAddressId){}