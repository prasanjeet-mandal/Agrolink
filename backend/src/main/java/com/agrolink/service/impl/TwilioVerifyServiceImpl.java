package com.agrolink.service.impl;

import com.agrolink.config.OtpConfig;
import com.agrolink.config.TwilioProperties;
import com.agrolink.exception.BadRequestException;
import com.agrolink.service.TwilioVerifyService;
import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TwilioVerifyServiceImpl implements TwilioVerifyService {

    private static final Logger log = LoggerFactory.getLogger(TwilioVerifyServiceImpl.class);

    private static final String APPROVED = "approved";

    private final TwilioProperties properties;
    private final boolean configured;

    private volatile boolean initialized;

    public TwilioVerifyServiceImpl(TwilioProperties properties, OtpConfig config) {
        this.properties = properties;
        this.configured = "twilio".equalsIgnoreCase(config.getProvider())
                && properties.isConfigured();
    }

    @Override
    public boolean isConfigured() {
        return configured;
    }

    @Override
    public void sendCode(String phone) {

        try {
            initTwilio();

            Verification.creator(
                    properties.getVerifyServiceSid(),
                    phone,
                    properties.getVerifyChannel()
            ).create();

            log.info("[AGROLINK-OTP] Twilio Verify code sent to {}", mask(phone));
        } catch (RuntimeException ex) {
            log.warn("[AGROLINK-OTP] Twilio Verify send failed", ex);
            throw new BadRequestException(
                    "Unable to send the verification code. "
                            + "Check the mobile number or try again later."
            );
        }
    }

    @Override
    public boolean checkCode(String phone, String code) {

        try {
            initTwilio();

            VerificationCheck check = VerificationCheck.creator(
                properties.getVerifyServiceSid()
        )
                .setTo(phone)
                .setCode(code)
                .create();

            return APPROVED.equalsIgnoreCase(check.getStatus());
        } catch (RuntimeException ex) {
            log.warn("[AGROLINK-OTP] Twilio Verify check failed", ex);
            throw new BadRequestException(
                    "Unable to verify the code. Please try again."
            );
        }
    }

    private void initTwilio() {

        if (!initialized) {
            synchronized (this) {
                if (!initialized) {
                    Twilio.init(
                            properties.getApiKeySid(),
                            properties.getApiKeySecret(),
                            properties.getAccountSid()
                    );
                    initialized = true;
                }
            }
        }
    }

    private String mask(String phone) {

        if (phone == null || phone.length() <= 4) {
            return phone;
        }

        return phone.substring(0, 2)
                + "*".repeat(phone.length() - 4)
                + phone.substring(phone.length() - 2);
    }
}