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
import com.agrolink.service.TwilioVerifyService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OtpServiceImplTest {

    private static final String PHONE_IN = "+919811111111";
    private static final String PHONE_OTHER = "+919822222222";
    private static final String TWILIO_CODE = "424242";

    private OtpConfig config;
    private JwtService jwtService;
    private OtpServiceImpl otpService;
    private FakeVerifyService verifyService;

    private static class FakeVerifyService implements TwilioVerifyService {

        final boolean configured;
        final String acceptedCode;
        final List<String> sends = new ArrayList<>();
        final List<String> checks = new ArrayList<>();

        boolean failSend;
        boolean failCheck;

        FakeVerifyService(boolean configured, String acceptedCode) {
            this.configured = configured;
            this.acceptedCode = acceptedCode;
        }

        @Override
        public boolean isConfigured() {
            return configured;
        }

        @Override
        public void sendCode(String phone) {

            if (failSend) {
                throw new BadRequestException(
                        "Unable to send the verification code. "
                                + "Check the mobile number or try again later."
                );
            }

            sends.add(phone);
        }

        @Override
        public boolean checkCode(String phone, String code) {

            if (failCheck) {
                throw new BadRequestException(
                        "Unable to verify the code. Please try again."
                );
            }

            checks.add(phone + ":" + code);

            return configured && acceptedCode.equals(code);
        }
    }

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
        config.setDevCode("123456");

        JwtConfig jwtConfig = new JwtConfig();
        jwtConfig.setSecret("AgroLinkTestSecretKeyForJwtAuthentication2026Secure");
        jwtConfig.setExpiration(86400000);
        jwtConfig.setRegistrationExpiration(600000);

        jwtService = new JwtService(jwtConfig);

        verifyService = new FakeVerifyService(true, TWILIO_CODE);

        otpService = new OtpServiceImpl(config, jwtService, verifyService);
    }

    @Test
    void neverExposesCodeWhenTwilioConnected() {

        OtpSendResponse sent = otpService.send(sendRequest("tw@example.com", PHONE_IN));

        assertNotNull(sent.requestId());
        assertNull(sent.otp(), "The OTP must never be returned when Twilio Verify is active");
        assertEquals(1, verifyService.sends.size());
        assertEquals(PHONE_IN, verifyService.sends.get(0));
    }

    @Test
    void sendAndVerifyWithTwilioReturnsRegistrationToken() {

        OtpSendResponse sent = otpService.send(sendRequest("sita@example.com", PHONE_IN));

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(sent.requestId(), PHONE_IN, TWILIO_CODE, "sita@example.com")
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
                verifyRequest(sent.requestId(), PHONE_IN, TWILIO_CODE, "one@example.com")
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
                        verifyRequest(sent.requestId(), PHONE_OTHER, TWILIO_CODE, "two@example.com")
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
        assertTrue(verifyService.sends.isEmpty());
    }

    @Test
    void sendFailureIsReportedSafe() {

        FakeVerifyService failing = new FakeVerifyService(true, TWILIO_CODE);
        OtpServiceImpl service = new OtpServiceImpl(config, jwtService, failing);
        failing.failSend = true;

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> service.send(sendRequest("fail@example.com", PHONE_IN))
        );

        assertTrue(ex.getMessage().contains("Unable to send the verification code"));
    }

    @Test
    void wrongTwilioCodeIsRejected() {

        OtpSendResponse sent = otpService.send(sendRequest("wrong@example.com", PHONE_IN));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(
                        verifyRequest(sent.requestId(), PHONE_IN, "000000", "wrong@example.com")
                )
        );

        assertTrue(ex.getMessage().contains("Invalid or expired OTP"));
        assertFalse(verifyService.checks.isEmpty());
        assertEquals(PHONE_IN + ":000000", verifyService.checks.get(0));
    }

    @Test
    void checkFailureIsReportedSafe() {

        OtpSendResponse sent = otpService.send(sendRequest("check@example.com", PHONE_IN));

        verifyService.failCheck = true;

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(
                        verifyRequest(sent.requestId(), PHONE_IN, TWILIO_CODE, "check@example.com")
                )
        );

        assertTrue(ex.getMessage().contains("Unable to verify the code"));
    }

    @Test
    void wrongCodeIncrementsAttemptsAndInvalidatesAfterLimit() {

        FakeVerifyService dev = new FakeVerifyService(false, null);
        otpService = new OtpServiceImpl(config, jwtService, dev);

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
    void devFallbackAcceptsConfiguredDevCode() {

        FakeVerifyService dev = new FakeVerifyService(false, null);
        otpService = new OtpServiceImpl(config, jwtService, dev);

        OtpSendResponse sent = otpService.send(sendRequest("dev@example.com", PHONE_IN));

        assertEquals("123456", sent.otp());
        assertTrue(dev.sends.isEmpty(), "No Twilio call should be made in dev fallback");

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(sent.requestId(), PHONE_IN, "123456", "dev@example.com")
        );

        assertTrue(verified.verified());
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

        FakeVerifyService dev = new FakeVerifyService(false, null);
        otpService = new OtpServiceImpl(config, jwtService, dev);

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

        FakeVerifyService dev = new FakeVerifyService(false, null);
        otpService = new OtpServiceImpl(config, jwtService, dev);

        config.setResendCooldownSeconds(0);

        OtpSendResponse first = otpService.send(sendRequest("new@example.com", PHONE_IN));
        OtpSendResponse second = otpService.send(sendRequest("new@example.com", PHONE_IN));

        assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest(first.requestId(), PHONE_IN, "123456", "new@example.com"))
        );

        OtpVerifyResponse verified = otpService.verify(
                verifyRequest(second.requestId(), PHONE_IN, "123456", "new@example.com")
        );

        assertTrue(verified.verified());
    }

    @Test
    void expiredOtpFails() throws InterruptedException {

        FakeVerifyService dev = new FakeVerifyService(false, null);
        otpService = new OtpServiceImpl(config, jwtService, dev);

        config.setTtlSeconds(1);

        OtpSendResponse sent = otpService.send(sendRequest("fast@example.com", PHONE_IN));

        Thread.sleep(1100);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest(sent.requestId(), PHONE_IN, "123456", "fast@example.com"))
        );

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    void unknownRequestIdFails() {

        assertThrows(
                BadRequestException.class,
                () -> otpService.verify(verifyRequest("no-such-id", PHONE_IN, "123456", "x@example.com"))
        );
    }

    private OtpSendRequest sendRequest(String email, String phone) {
        return new OtpSendRequest(email, phone);
    }

    private OtpVerifyRequest verifyRequest(String requestId, String phone, String code, String email) {
        return new OtpVerifyRequest(requestId, phone, code, email);
    }
}