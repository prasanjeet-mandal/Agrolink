package com.agrolink.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "twilio")
public class TwilioProperties {

    private String accountSid = "";

    private String apiKeySid = "";

    private String apiKeySecret = "";

    private String verifyServiceSid = "";

    private String verifyChannel = "sms";

    public String getAccountSid() {
        return accountSid;
    }

    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    public String getApiKeySid() {
        return apiKeySid;
    }

    public void setApiKeySid(String apiKeySid) {
        this.apiKeySid = apiKeySid;
    }

    public String getApiKeySecret() {
        return apiKeySecret;
    }

    public void setApiKeySecret(String apiKeySecret) {
        this.apiKeySecret = apiKeySecret;
    }

    public String getVerifyServiceSid() {
        return verifyServiceSid;
    }

    public void setVerifyServiceSid(String verifyServiceSid) {
        this.verifyServiceSid = verifyServiceSid;
    }

    public String getVerifyChannel() {
        return verifyChannel;
    }

    public void setVerifyChannel(String verifyChannel) {
        this.verifyChannel = verifyChannel;
    }

    public boolean isConfigured() {
        return !accountSid.isBlank()
                && !apiKeySid.isBlank()
                && !apiKeySecret.isBlank()
                && !verifyServiceSid.isBlank();
    }
}