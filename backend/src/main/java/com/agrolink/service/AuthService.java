package com.agrolink.service;

import com.agrolink.dto.auth.AuthResponse;
import com.agrolink.dto.auth.LoginRequest;
import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;
import com.agrolink.dto.auth.RegisterRequest;
import com.agrolink.dto.user.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse me(String email);

    String forgotPassword(String email);

    String resetPassword(String token, String password);

    OtpSendResponse sendOtp(OtpSendRequest request);

    OtpVerifyResponse verifyOtp(OtpVerifyRequest request);
}