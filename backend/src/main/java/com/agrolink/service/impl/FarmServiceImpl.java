package com.agrolink.service.impl;

import com.agrolink.dto.farm.FarmRequest;
import com.agrolink.dto.farm.FarmResponse;
import com.agrolink.entity.Farm;
import com.agrolink.entity.Farmer;
import com.agrolink.repository.FarmRepository;
import com.agrolink.repository.FarmerRepository;
import com.agrolink.service.FarmService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FarmerRepository farmerRepository;

    public FarmServiceImpl(
            FarmRepository farmRepository,
            FarmerRepository farmerRepository
    ) {
        this.farmRepository = farmRepository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    @Transactional
    public FarmResponse createFarm(
            String email,
            FarmRequest request
    ) {

        Farmer farmer = getFarmer(email);

        Farm farm = new Farm();

        farm.setFarmer(farmer);

        setFields(farm, request);

        return toResponse(
                farmRepository.save(farm)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<FarmResponse> getMyFarms(
            String email
    ) {

        return farmRepository
                .findByFarmerUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FarmResponse updateFarm(
            String email,
            Long farmId,
            FarmRequest request
    ) {

        Farm farm = farmRepository
                .findById(farmId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Farm not found"
                        )
                );

        if (!farm.getFarmer()
                .getUser()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "You cannot update this farm"
            );
        }

        setFields(farm, request);

        return toResponse(
                farmRepository.save(farm)
        );
    }

    @Override
    @Transactional
    public void deleteFarm(
            String email,
            Long farmId
    ) {

        Farm farm = farmRepository
                .findById(farmId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Farm not found"
                        )
                );

        if (!farm.getFarmer()
                .getUser()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "You cannot delete this farm"
            );
        }

        farmRepository.delete(farm);
    }

    private Farmer getFarmer(String email) {

        return farmerRepository
                .findByUserEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Create farmer profile first"
                        )
                );
    }

    private void setFields(
            Farm farm,
            FarmRequest request
    ) {

        farm.setFarmName(request.farmName());
        farm.setLandArea(request.landArea());
        farm.setLandUnit(request.landUnit());
        farm.setVillage(request.village());
        farm.setDistrict(request.district());
        farm.setState(request.state());
        farm.setPincode(request.pincode());
        farm.setSoilType(request.soilType());
    }

    private FarmResponse toResponse(Farm farm) {

        return new FarmResponse(
                farm.getId(),
                farm.getFarmer().getId(),
                farm.getFarmName(),
                farm.getLandArea(),
                farm.getLandUnit(),
                farm.getVillage(),
                farm.getDistrict(),
                farm.getState(),
                farm.getPincode(),
                farm.getSoilType()
        );
    }
}