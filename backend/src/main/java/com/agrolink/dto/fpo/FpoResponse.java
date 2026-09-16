package com.agrolink.dto.fpo;


public record FpoResponse(

        Long id,
        Long userId,
        String organizationName,
        String registrationNumber,
        String phone,
        String village,
        String district,
        String state,
        String pincode,
        String description
) {
}