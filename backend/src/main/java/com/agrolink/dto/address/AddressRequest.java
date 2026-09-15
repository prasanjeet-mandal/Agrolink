package com.agrolink.dto.address;


import jakarta.validation.constraints.NotBlank;

public record AddressRequest(

        @NotBlank
        String addressLine,

        String village,

        String city,

        String district,

        @NotBlank
        String state,

        @NotBlank
        String pincode,

        String addressType
) {
}