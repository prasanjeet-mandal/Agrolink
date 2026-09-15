package com.agrolink.service.impl;


import com.agrolink.dto.farmer.FarmerRequest;
import com.agrolink.dto.farmer.FarmerResponse;
import com.agrolink.entity.Farmer;
import com.agrolink.entity.User;
import com.agrolink.enums.Role;
import com.agrolink.repository.FarmerRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.service.FarmerService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FarmerServiceImpl implements FarmerService {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;

    public FarmerServiceImpl(
            FarmerRepository farmerRepository,
            UserRepository userRepository
    ) {
        this.farmerRepository = farmerRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public FarmerResponse createProfile(
            String email,
            FarmerRequest request
    ) {

        User user = getFarmerUser(email);

        if (farmerRepository.existsByUserEmail(email)) {
            throw new IllegalStateException(
                    "Farmer profile already exists"
            );
        }

        Farmer farmer = new Farmer();

        farmer.setUser(user);
        farmer.setPhone(request.phone());
        farmer.setVillage(request.village());
        farmer.setDistrict(request.district());
        farmer.setState(request.state());
        farmer.setPincode(request.pincode());
        farmer.setExperience(request.experience());

        return toResponse(farmerRepository.save(farmer));
    }

    @Override
    @Transactional(readOnly = true)
    public FarmerResponse getProfile(String email) {

        Farmer farmer =
                farmerRepository.findByUserEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Farmer profile not found"
                                )
                        );

        return toResponse(farmer);
    }

    @Override
    @Transactional
    public FarmerResponse updateProfile(
            String email,
            FarmerRequest request
    ) {

        Farmer farmer =
                farmerRepository.findByUserEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Farmer profile not found"
                                )
                        );

        farmer.setPhone(request.phone());
        farmer.setVillage(request.village());
        farmer.setDistrict(request.district());
        farmer.setState(request.state());
        farmer.setPincode(request.pincode());
        farmer.setExperience(request.experience());

        return toResponse(farmerRepository.save(farmer));
    }

    private User getFarmerUser(String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        if (user.getRole() != Role.FARMER) {
            throw new IllegalStateException(
                    "Only FARMER can create farmer profile"
            );
        }

        return user;
    }

    private FarmerResponse toResponse(Farmer farmer) {

        User user = farmer.getUser();

        return new FarmerResponse(
                farmer.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                farmer.getPhone(),
                farmer.getVillage(),
                farmer.getDistrict(),
                farmer.getState(),
                farmer.getPincode(),
                farmer.getExperience()
        );
    }
}
