package com.agrolink.service.impl;

import com.agrolink.config.OtpConfig;
import com.agrolink.config.TwilioProperties;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TwilioVerifyServiceImplTest {

    @Test
    void providerMock_alwaysDisabled() {

        TwilioProperties props = fullProps();
        OtpConfig config = new OtpConfig();
        config.setProvider("mock");

        TwilioVerifyServiceImpl svc = new TwilioVerifyServiceImpl(props, config);
        assertFalse(svc.isConfigured());
    }

    @Test
    void providerTwilio_withAllCreds_enabled() {

        TwilioProperties props = fullProps();
        OtpConfig config = new OtpConfig();
        config.setProvider("twilio");

        TwilioVerifyServiceImpl svc = new TwilioVerifyServiceImpl(props, config);
        assertTrue(svc.isConfigured());
    }

    @Test
    void providerTwilio_missingCreds_disabled() {

        TwilioProperties props = new TwilioProperties();
        OtpConfig config = new OtpConfig();
        config.setProvider("twilio");

        TwilioVerifyServiceImpl svc = new TwilioVerifyServiceImpl(props, config);
        assertFalse(svc.isConfigured());
    }

    @Test
    void providerDefaultMock_noCredsDisabled() {

        TwilioProperties props = new TwilioProperties();
        OtpConfig config = new OtpConfig();
        // default provider = mock
        TwilioVerifyServiceImpl svc = new TwilioVerifyServiceImpl(props, config);
        assertFalse(svc.isConfigured());
    }

    private TwilioProperties fullProps() {

        TwilioProperties props = new TwilioProperties();
        props.setAccountSid("AC");
        props.setApiKeySid("SK");
        props.setApiKeySecret("secret");
        props.setVerifyServiceSid("VA");
        return props;
    }
}