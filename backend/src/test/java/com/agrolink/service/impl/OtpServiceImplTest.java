package com.agrolink.service.impl;

import com.agrolink.config.JwtConfig;
import com.agrolink.config.OtpConfig;
import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;
import com.agrolink.exception.BadRequestException;
import com.agrolink.exception.RateLimitException;
import com.agrolink.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpServiceImplTest {

    private static final String PHONE_IN = "+919811111111";
    private static final String PHONE_OTHER = "+919822222222";
    private static final String DEV_CODE = "123456";

    private OtpConfig config;
    private JwtService jwtService;
    private OtpServiceImpl otpService;

    @BeforeEach
    void setUp() {

        config = new OtpConfig();
        config.setTtlSeconds(600);
        config.setMaxSendsPerWindow(3);
        config.setRateWindowMinutes(60);
        config.setResendCooldownSeconds(30);
        config.setMaxVerifyAttempts(5);
        config.setRequireVerify(true);
        config.setDevExposeCode(true);
        config.setDevCode(DEV_CODE);

        JwtConfig jwtConfig = new JwtConfig();
        jwtConfig.setSecret("AgroLinkTestSecretKeyForJwtAuthentication2026Secure");
        jwtConfig.setExpiration(86400000);
        jwtConfig.setRegistrationExpiration(600000);

        jwtService = new JwtService(jwtConfig);
        otpService = new OtpServiceImpl(config, jwtService);
    }

    @Test
    void devCodeIsExposedOnSend() {

        OtpSendResponse sent = otpService.send(sendRequest("tw@example.com", PHONE_IN));

        assertNotNull(sent.requestId());
        assertEquals(DEV_CODE, sent.otp());
    }

    @Test
    void sendAndVerifyWithDevCodeReturnsRegistrationToken() {

        OtpSendResponse sent = otpService.send(sendRequest("sita@example.com", PHONE_IN));

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(sent.requestId(), PHONE_IN, DEV_CODE, "sita@example.com")
        );

        assertTrue(verified.verified());
        assertNotNull(verified.registrationToken());

        JwtService.RegistrationClaims claims =
                jwtService.verifyRegistrationToken(verified.registrationToken());

        assertEquals("sita@example.com", claims.email());
        assertEquals(PHONE_IN, claims.phone());
    }

    @Test
    void registrationTokenIsBoundToEmailAndPhone() {

        OtpSendResponse sent = otpService.send(sendRequest("one@example.com", PHONE_IN));

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(sent.requestId(), PHONE_IN, DEV_CODE, "one@example.com")
        );

        JwtService.RegistrationClaims claims =
                jwtService.verifyRegistrationToken(verified.registrationToken());

        assertEquals("one@example.com", claims.email());
        assertEquals(PHONE_IN, claims.phone());
    }

    @Test
    void rejectsPhoneThatDoesNotMatchTheIntent() {

        OtpSendResponse sent = otpService.send(sendRequest("two@example.com", PHONE_IN));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(
                        verifyRequest(sent.requestId(), PHONE_OTHER, DEV_CODE, "two@example.com")
                )
        );

        assertTrue(ex.getMessage().contains("Invalid or expired OTP"));
    }

    @Test
    void rejectsNonE164PhoneOnSend() {

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.send(sendRequest("bad@example.com", "9812345678"))
        );

        assertTrue(ex.getMessage().toLowerCase().contains("international format"));
    }

    @Test
    void wrongCodeIsRejected() {

        OtpSendResponse sent = otpService.send(sendRequest("wrong@example.com", PHONE_IN));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(
                        verifyRequest(sent.requestId(), PHONE_IN, "000000", "wrong@example.com")
                )
        );

        assertTrue(ex.getMessage().contains("Invalid or expired OTP"));
    }

    @Test
    void wrongCodeIncrementsAttemptsAndInvalidatesAfterLimit() {

        OtpSendResponse sent = otpService.send(sendRequest("rama@example.com", PHONE_IN));

        for (int i = 0; i < config.getMaxVerifyAttempts(); i++) {
            assertThrows(
                    BadRequestException.class,
                    () -> otpService.verify(verifyRequest(sent.requestId(), PHONE_IN, "000000", "rama@example.com"))
            );
        }

        BadRequestException last = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest(sent.requestId(), PHONE_IN, "000000", "rama@example.com"))
        );

        assertTrue(last.getMessage().contains("Too many incorrect attempts"));
    }

    @Test
    void resendWithinCooldownIsRejected() {

        otpService.send(sendRequest("kavi@example.com", PHONE_IN));

        assertThrows(
                RateLimitException.class,
                () -> otpService.send(sendRequest("kavi@example.com", PHONE_IN))
        );
    }

    @Test
    void sendLimitReachedWithinWindow() {

        config.setResendCooldownSeconds(0);

        for (int i = 0; i < config.getMaxSendsPerWindow(); i++) {
            otpService.send(sendRequest("limit@example.com", PHONE_IN));
        }

        assertThrows(
                RateLimitException.class,
                () -> otpService.send(sendRequest("limit@example.com", PHONE_IN))
        );
    }

    @Test
    void oldIntentIsInvalidatedOnResend() {

        config.setResendCooldownSeconds(0);

        OtpSendResponse first = otpService.send(sendRequest("new@example.com", PHONE_IN));
        OtpSendResponse second = otpService.send(sendRequest("new@example.com", PHONE_IN));

        assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest(first.requestId(), PHONE_IN, DEV_CODE, "new@example.com"))
        );

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(second.requestId(), PHONE_IN, DEV_CODE, "new@example.com")
        );

        assertTrue(verified.verified());
    }

    @Test
    void expiredOtpFails() throws InterruptedException {

        config.setTtlSeconds(1);

        OtpSendResponse sent = otpService.send(sendRequest("fast@example.com", PHONE_IN));

        Thread.sleep(1100);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest(sent.requestId(), PHONE_IN, DEV_CODE, "fast@example.com"))
        );

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    void unknownRequestIdFails() {

        assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest("no-such-id", PHONE_IN, DEV_CODE, "x@example.com"))
        );
    }

    private OtpSendRequest sendRequest(String email, String phone) {
        return new OtpSendRequest(email, phone);
    }

    private OtpVerifyRequest verifyRequest(String requestId, String phone, String code, String email) {
        return new OtpVerifyRequest(requestId, phone, code, email);
    }
}
