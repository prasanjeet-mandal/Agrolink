package com.agrolink.service;


import com.agrolink.dto.farmer.FarmerRequest;
import com.agrolink.dto.farmer.FarmerResponse;

public interface FarmerService {

    FarmerResponse createProfile(
            String email,
            FarmerRequest request
    );

    FarmerResponse getProfile(String email);

    FarmerResponse updateProfile(
            String email,
            FarmerRequest request
    );
}
