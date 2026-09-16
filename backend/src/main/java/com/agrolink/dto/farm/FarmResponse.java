package com.agrolink.dto.farm;


public record FarmResponse(

        Long id,
        Long farmerId,
        String farmName,
        Double landArea,
        String landUnit,
        String village,
        String district,
        String state,
        String pincode,
        String soilType
) {
}
