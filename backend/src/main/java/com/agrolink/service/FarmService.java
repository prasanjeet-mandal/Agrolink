package com.agrolink.service;

import com.agrolink.dto.farm.FarmRequest;
import com.agrolink.dto.farm.FarmResponse;

import java.util.List;

public interface FarmService {

    FarmResponse createFarm(
            String email,
            FarmRequest request
    );

    List<FarmResponse> getMyFarms(String email);

    FarmResponse updateFarm(
            String email,
            Long farmId,
            FarmRequest request
    );

    void deleteFarm(
            String email,
            Long farmId
    );
}