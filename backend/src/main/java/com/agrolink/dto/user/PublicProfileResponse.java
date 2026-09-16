package com.agrolink.dto.user;

public record PublicProfileResponse(
        Long id,
        String fullName,
        String role,
        String phone,
        String organizationName,
        String village,
        String district,
        String state,
        String pincode,
        String description,
        String experience
) {
}