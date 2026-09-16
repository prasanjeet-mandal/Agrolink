package com.agrolink.dto.farmer;


import jakarta.validation.constraints.NotBlank;

public record FarmerRequest(

        @NotBlank
        String phone,

        String village,

        String district,

        String state,

        String pincode,

        String experience
) {
}