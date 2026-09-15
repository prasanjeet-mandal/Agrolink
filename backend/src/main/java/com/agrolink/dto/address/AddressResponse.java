package com.agrolink.dto.address;


public record AddressResponse(

        Long id,
        String addressLine,
        String village,
        String city,
        String district,
        String state,
        String pincode,
        String addressType
) {
}