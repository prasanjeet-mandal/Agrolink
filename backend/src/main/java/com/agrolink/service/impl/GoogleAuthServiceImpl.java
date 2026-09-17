package com.agrolink.service.impl;


import com.agrolink.config.GoogleConfig;
import com.agrolink.dto.auth.GoogleAuthResponse;
import com.agrolink.dto.auth.GoogleLoginRequest;
import com.agrolink.dto.auth.GoogleSignupRequest;
import com.agrolink.entity.DeliveryPartnerProfile;
import com.agrolink.entity.User;
import com.agrolink.enums.AuthProvider;
import com.agrolink.enums.Role;
import com.agrolink.exception.BadRequestException;
import com.agrolink.repository.DeliveryPartnerProfileRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.security.GoogleIdTokenVerifier;
import com.agrolink.security.GoogleTokenExchanger;
import com.agrolink.security.JwtService;
import com.agrolink.security.SecurityUser;
import com.agrolink.service.GoogleAuthService;
import com.agrolink.util.RoleGuard;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private final GoogleConfig googleConfig;
    private final GoogleTokenExchanger tokenExchanger;
    private final GoogleIdTokenVerifier tokenVerifier;
    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public GoogleAuthServiceImpl(
            GoogleConfig googleConfig,
            GoogleTokenExchanger tokenExchanger,
            GoogleIdTokenVerifier tokenVerifier,
            UserRepository userRepository,
            DeliveryPartnerProfileRepository deliveryPartnerProfileRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.googleConfig = googleConfig;
        this.tokenExchanger = tokenExchanger;
        this.tokenVerifier = tokenVerifier;
        this.userRepository = userRepository;
        this.deliveryPartnerProfileRepository = deliveryPartnerProfileRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public GoogleAuthResponse googleLogin(GoogleLoginRequest request) {

        if (!googleConfig.isConfigured() || !tokenVerifier.isConfigured()) {
            throw new BadRequestException(
                    "Google sign-in is not configured on this server"
            );
        }

        String idToken =
                tokenExchanger.exchangeForIdToken(request.code());

        GoogleIdTokenVerifier.IdTokenInfo info =
                tokenVerifier.verify(idToken);

        User existing =
                userRepository.findByGoogleId(info.subject())
                        .orElseGet(() ->
                                userRepository.findByEmail(info.email())
                                        .orElse(null)
                        );

        if (existing != null) {
            return tokenResponse(
                    linkAccount(existing, info)
            );
        }

        if (!info.emailVerified()) {
            throw new BadRequestException(
                    "Your Google account email is not verified"
            );
        }

        String ticket =
                jwtService.generateGoogleSignupTicket(
                        info.email(),
                        info.subject(),
                        info.name(),
                        info.emailVerified()
                );

        return new GoogleAuthResponse(
                null,
                null,
                null,
                info.name(),
                info.email(),
                null,
                true,
                ticket
        );
    }

    @Override
    @Transactional
    public GoogleAuthResponse completeSignup(GoogleSignupRequest request) {

        JwtService.GoogleSignupClaims claims =
                jwtService.verifyGoogleSignupTicket(request.signupTicket());

        Role role =
                parseRole(request.role());

        if (role == null) {
            throw new BadRequestException(
                    "Role is required"
            );
        }

        if (role == Role.DELIVERY_PARTNER
                && (isBlank(request.vehicleNumber()) || isBlank(request.drivingLicense()))) {
            throw new BadRequestException(
                    "Vehicle number and driving licence are required for delivery partners"
            );
        }

        if (userRepository.existsByEmail(claims.email())) {
            throw new BadRequestException(
                    "An account with this email already exists"
            );
        }

        if (userRepository.existsByGoogleId(claims.googleId())) {
            throw new BadRequestException(
                    "This Google account is already linked to another AgroLink user"
            );
        }

        User user = new User();

        user.setFullName(
                claims.name().isBlank() ? claims.email() : claims.name()
        );
        user.setEmail(claims.email());
        user.setPhone("");
        user.setRole(role);
        user.setEnabled(true);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setGoogleId(claims.googleId());
        user.setEmailVerified(claims.emailVerified());
        user.setPassword(
                passwordEncoder.encode(
                        UUID.randomUUID().toString()
                )
        );

        user = userRepository.save(user);

        if (role == Role.DELIVERY_PARTNER) {
            saveDeliveryPartnerProfile(
                    user,
                    request.vehicleNumber(),
                    request.drivingLicense()
            );
        }

        return tokenResponse(user);
    }

    private User linkAccount(User user, GoogleIdTokenVerifier.IdTokenInfo info) {

        if (user.getAuthProvider() == AuthProvider.GOOGLE) {

            if (user.getGoogleId() != null
                    && !user.getGoogleId().equals(info.subject())) {
                throw new BadRequestException(
                        "This email is linked to a different Google account"
                );
            }

            return user;
        }

        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setGoogleId(info.subject());
        user.setEmailVerified(info.emailVerified());
        user.setEnabled(true);

        return userRepository.save(user);
    }

    private GoogleAuthResponse tokenResponse(User user) {

        SecurityUser securityUser =
                new SecurityUser(user);

        String token =
                jwtService.generateToken(securityUser);

        return new GoogleAuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                false,
                null
        );
    }

    private void saveDeliveryPartnerProfile(
            User user,
            String vehicleNumber,
            String drivingLicense
    ) {
        if (isBlank(vehicleNumber) || isBlank(drivingLicense)) {
            throw new BadRequestException(
                    "Vehicle number and driving licence are required for delivery partners"
            );
        }

        DeliveryPartnerProfile profile =
                new DeliveryPartnerProfile();

        profile.setUser(user);
        profile.setVehicleNumber(vehicleNumber.trim());
        profile.setDrivingLicense(drivingLicense.trim());

        deliveryPartnerProfileRepository.save(profile);
    }

    private Role parseRole(String raw) {

        if (isBlank(raw)) {
            return null;
        }

        Role role;

        try {
            role = Role.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }

        return RoleGuard.isRegistrable(role)
                ? role
                : null;
    }

    private static boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}