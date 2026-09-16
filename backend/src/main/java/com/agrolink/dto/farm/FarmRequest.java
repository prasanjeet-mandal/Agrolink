package com.agrolink.dto.farm;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FarmRequest(

        @NotBlank
        String farmName,

        @NotNull
        @Positive
        Double landArea,

        String landUnit,

        String village,

        String district,

        String state,

        String pincode,

        String soilType
) {
}
