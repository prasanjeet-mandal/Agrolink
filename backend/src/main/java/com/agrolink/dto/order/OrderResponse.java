package com.agrolink.dto.order;

import com.agrolink.dto.address.AddressResponse;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        BigDecimal totalAmount,
        BigDecimal deliveryFee,
        Long shippingAddressId,
        String buyerName,
        String buyerEmail,
        String paymentStatus,
        String paymentMethod,
        String createdAt,
        AddressResponse deliveryAddress,
        List<OrderItemResponse> items
) {
}