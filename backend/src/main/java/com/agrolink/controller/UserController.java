package com.agrolink.controller;


import com.agrolink.dto.user.PublicProfileResponse;
import com.agrolink.dto.user.UserResponse;
import com.agrolink.entity.User;
import com.agrolink.repository.FarmerRepository;
import com.agrolink.repository.FpoRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository users;
    private final FarmerRepository farmers;
    private final FpoRepository fpos;

    public UserController(
            UserService userService,
            UserRepository users,
            FarmerRepository farmers,
            FpoRepository fpos
    ) {
        this.userService = userService;
        this.users = users;
        this.farmers = farmers;
        this.fpos = fpos;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(
            Authentication authentication
    ) {

        return userService.getCurrentUser(
                authentication.getName()
        );
    }

    @GetMapping("/me/profile")
    public PublicProfileResponse getCurrentUserProfile(
            Authentication authentication
    ) {

        var user = users.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return profileFor(user);
    }

    @GetMapping("/{id}/public")
    public PublicProfileResponse getPublicProfile(
            @PathVariable Long id
    ) {

        var user = users.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return profileFor(user);
    }

    private PublicProfileResponse profileFor(
            User user
    ) {

        var farmer = farmers.findByUserId(user.getId()).orElse(null);
        var fpo = fpos.findByUserId(user.getId()).orElse(null);

        return new PublicProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getRole().name(),
                farmer != null ? farmer.getPhone() : fpo != null ? fpo.getPhone() : null,
                fpo != null ? fpo.getOrganizationName() : null,
                farmer != null ? farmer.getVillage() : fpo != null ? fpo.getVillage() : null,
                farmer != null ? farmer.getDistrict() : fpo != null ? fpo.getDistrict() : null,
                farmer != null ? farmer.getState() : fpo != null ? fpo.getState() : null,
                farmer != null ? farmer.getPincode() : fpo != null ? fpo.getPincode() : null,
                fpo != null ? fpo.getDescription() : null,
                farmer != null ? farmer.getExperience() : null
        );
    }
}