package com.agrolink.dto.order;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderPaymentRequest(@NotBlank String status) {
}