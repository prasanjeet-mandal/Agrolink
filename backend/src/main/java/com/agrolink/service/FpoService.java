package com.agrolink.service;

import com.agrolink.dto.fpo.FpoRequest;
import com.agrolink.dto.fpo.FpoResponse;

public interface FpoService {

    FpoResponse createProfile(
            String email,
            FpoRequest request
    );

    FpoResponse getProfile(String email);

    FpoResponse updateProfile(
            String email,
            FpoRequest request
    );
}