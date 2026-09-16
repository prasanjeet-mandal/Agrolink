package com.agrolink.dto.user;


public record UserResponse(

        Long id,
        String fullName,
        String email,
        String role,
        boolean enabled

) {
}
