package com.agrolink.service.impl;


import com.agrolink.dto.fpo.FpoRequest;
import com.agrolink.dto.fpo.FpoResponse;
import com.agrolink.entity.Fpo;
import com.agrolink.entity.User;
import com.agrolink.enums.Role;
import com.agrolink.repository.FpoRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.service.FpoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FpoServiceImpl implements FpoService {

    private final FpoRepository fpoRepository;
    private final UserRepository userRepository;

    public FpoServiceImpl(
            FpoRepository fpoRepository,
            UserRepository userRepository
    ) {
        this.fpoRepository = fpoRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public FpoResponse createProfile(
            String email,
            FpoRequest request
    ) {

        User user = getFpoUser(email);

        if (fpoRepository.existsByUserEmail(email)) {
            throw new IllegalStateException(
                    "FPO profile already exists"
            );
        }

        Fpo fpo = new Fpo();

        fpo.setUser(user);
        fpo.setOrganizationName(
                request.organizationName()
        );
        fpo.setRegistrationNumber(
                request.registrationNumber()
        );
        fpo.setPhone(request.phone());
        fpo.setVillage(request.village());
        fpo.setDistrict(request.district());
        fpo.setState(request.state());
        fpo.setPincode(request.pincode());
        fpo.setDescription(request.description());

        return toResponse(fpoRepository.save(fpo));
    }

    @Override
    @Transactional(readOnly = true)
    public FpoResponse getProfile(String email) {

        Fpo fpo =
                fpoRepository.findByUserEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "FPO profile not found"
                                )
                        );

        return toResponse(fpo);
    }

    @Override
    @Transactional
    public FpoResponse updateProfile(
            String email,
            FpoRequest request
    ) {

        Fpo fpo =
                fpoRepository.findByUserEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "FPO profile not found"
                                )
                        );

        fpo.setOrganizationName(
                request.organizationName()
        );
        fpo.setRegistrationNumber(
                request.registrationNumber()
        );
        fpo.setPhone(request.phone());
        fpo.setVillage(request.village());
        fpo.setDistrict(request.district());
        fpo.setState(request.state());
        fpo.setPincode(request.pincode());
        fpo.setDescription(request.description());

        return toResponse(fpoRepository.save(fpo));
    }

    private User getFpoUser(String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        if (user.getRole() != Role.FPO) {
            throw new IllegalStateException(
                    "Only FPO can create FPO profile"
            );
        }

        return user;
    }

    private FpoResponse toResponse(Fpo fpo) {

        return new FpoResponse(
                fpo.getId(),
                fpo.getUser().getId(),
                fpo.getOrganizationName(),
                fpo.getRegistrationNumber(),
                fpo.getPhone(),
                fpo.getVillage(),
                fpo.getDistrict(),
                fpo.getState(),
                fpo.getPincode(),
                fpo.getDescription()
        );
    }
}
