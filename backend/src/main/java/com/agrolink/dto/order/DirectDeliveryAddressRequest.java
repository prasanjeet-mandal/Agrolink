package com.agrolink.dto.order;

import jakarta.validation.constraints.NotBlank;

public record DirectDeliveryAddressRequest(

        @NotBlank(message = "Address line is required")
        String line1,

        String village,

        String city,

        String district,

        String state,

        String pincode,

        String addressType,

        Double latitude,

        Double longitude
) {
}