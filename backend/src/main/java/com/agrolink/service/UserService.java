package com.agrolink.service;


import com.agrolink.dto.user.UserResponse;

public interface UserService {

    UserResponse getCurrentUser(String email);
}
