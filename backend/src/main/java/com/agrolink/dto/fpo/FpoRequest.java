package com.agrolink.dto.fpo;


import jakarta.validation.constraints.NotBlank;

public record FpoRequest(

        @NotBlank
        String organizationName,

        @NotBlank
        String registrationNumber,

        @NotBlank
        String phone,

        String village,

        String district,

        String state,

        String pincode,

        String description
) {
}