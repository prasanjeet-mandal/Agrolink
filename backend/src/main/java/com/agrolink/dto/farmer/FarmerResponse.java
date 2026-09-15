package com.agrolink.dto.farmer;


public record FarmerResponse(

        Long id,
        Long userId,
        String fullName,
        String email,
        String phone,
        String village,
        String district,
        String state,
        String pincode,
        String experience
) {
}
