package com.agrolink.service.impl;


import com.agrolink.dto.auth.AuthResponse;
import com.agrolink.dto.auth.LoginRequest;
import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;
import com.agrolink.dto.auth.RegisterRequest;
import com.agrolink.dto.user.UserResponse;
import com.agrolink.entity.DeliveryPartnerProfile;
import com.agrolink.entity.User;
import com.agrolink.enums.Role;
import com.agrolink.exception.BadRequestException;
import com.agrolink.repository.DeliveryPartnerProfileRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.config.OtpConfig;
import com.agrolink.security.JwtService;
import com.agrolink.security.SecurityUser;
import com.agrolink.service.AuthService;
import com.agrolink.service.OtpService;
import com.agrolink.util.PhoneUtil;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;

import static com.agrolink.enums.Role.BUYER;
import static com.agrolink.enums.Role.CONSUMER;
import static com.agrolink.enums.Role.DELIVERY_PARTNER;
import static com.agrolink.enums.Role.FARMER;
import static com.agrolink.enums.Role.FPO;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final OtpConfig otpConfig;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            OtpService otpService,
            DeliveryPartnerProfileRepository deliveryPartnerProfileRepository,
            OtpConfig otpConfig
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.deliveryPartnerProfileRepository = deliveryPartnerProfileRepository;
        this.otpConfig = otpConfig;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email =
                request.email().trim().toLowerCase();

        String phone =
                request.phone() == null ? "" : request.phone().trim();

        if (!PhoneUtil.isValidE164(phone)) {
            throw new BadRequestException(
                    "Enter a valid phone number in international format, e.g. +919876543210"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        if (!EnumSet.of(BUYER, CONSUMER, FARMER, FPO, DELIVERY_PARTNER).contains(request.role())) {
            throw new RuntimeException(
                    "This role cannot be selected during registration"
            );
        }

        Role role = request.role() == BUYER ? CONSUMER : request.role();

        if (otpConfig.isRequireVerify()) {

            JwtService.RegistrationClaims claims;

            try {
                claims = jwtService.verifyRegistrationToken(request.otpToken());
            } catch (BadRequestException ignored) {
                throw new BadRequestException(
                        "Email verification is required. Please complete OTP verification first"
                );
            }

            if (!email.equals(claims.email())) {
                throw new BadRequestException(
                        "OTP was verified for a different email"
                );
            }

            if (!phone.equals(claims.phone())) {
                throw new BadRequestException(
                        "OTP was verified for a different phone number"
                );
            }
        }

        if (request.role() == DELIVERY_PARTNER
                && (isBlank(request.vehicleNumber()) || isBlank(request.drivingLicense()))) {
            throw new RuntimeException(
                    "Vehicle number and driving licence are required for delivery partners"
            );
        }

        User user = new User();

        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPhoneVerified(true);

        user.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        user.setRole(role);
        user.setEnabled(true);

        User savedUser =
                userRepository.save(user);

        if (role == DELIVERY_PARTNER) {

            DeliveryPartnerProfile profile =
                    new DeliveryPartnerProfile();

            profile.setUser(savedUser);
            profile.setVehicleNumber(request.vehicleNumber().trim());
            profile.setDrivingLicense(request.drivingLicense().trim());

            deliveryPartnerProfileRepository.save(profile);
        }

        SecurityUser securityUser =
                new SecurityUser(savedUser);

        String token =
                jwtService.generateToken(securityUser);

        return new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String email =
                request.email().trim().toLowerCase();

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                request.password()
                        )
                );

        SecurityUser securityUser =
                (SecurityUser) authentication.getPrincipal();

        String token =
                jwtService.generateToken(securityUser);

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    @Override
    public UserResponse me(String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.isEnabled()
        );
    }

    @Override
    public String forgotPassword(String email) {

        String normalized = email.trim().toLowerCase();

                userRepository.existsByEmail(normalized);

        return "If an account exists for that email, a reset link has been sent.";
    }

    @Override
    public String resetPassword(String token, String password) {

                if (token == null || token.isBlank() || password == null || password.length() < 6) {
                        throw new RuntimeException("A valid reset token and password of at least 6 characters are required");
        }

                throw new RuntimeException("Password reset is not configured");
    }

    @Override
    public OtpSendResponse sendOtp(OtpSendRequest request) {

        return otpService.send(request);
    }

    @Override
    public OtpVerifyResponse verifyOtp(OtpVerifyRequest request) {

        return otpService.verify(request);
    }

    private static boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}