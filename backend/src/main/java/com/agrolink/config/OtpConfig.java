package com.agrolink.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.otp")
public class OtpConfig {

    private long ttlSeconds = 600;

    private int maxSendsPerWindow = 5;

    private long rateWindowMinutes = 60;

    private long resendCooldownSeconds = 30;

    private int maxVerifyAttempts = 5;

    private boolean requireVerify = true;

    private boolean devExposeCode = true;

    private String devCode = "123456";

    public long getTtlSeconds() {
        return ttlSeconds;
    }

    public void setTtlSeconds(long ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }

    public int getMaxSendsPerWindow() {
        return maxSendsPerWindow;
    }

    public void setMaxSendsPerWindow(int maxSendsPerWindow) {
        this.maxSendsPerWindow = maxSendsPerWindow;
    }

    public long getRateWindowMinutes() {
        return rateWindowMinutes;
    }

    public void setRateWindowMinutes(long rateWindowMinutes) {
        this.rateWindowMinutes = rateWindowMinutes;
    }

    public long getResendCooldownSeconds() {
        return resendCooldownSeconds;
    }

    public void setResendCooldownSeconds(long resendCooldownSeconds) {
        this.resendCooldownSeconds = resendCooldownSeconds;
    }

    public int getMaxVerifyAttempts() {
        return maxVerifyAttempts;
    }

    public void setMaxVerifyAttempts(int maxVerifyAttempts) {
        this.maxVerifyAttempts = maxVerifyAttempts;
    }

    public boolean isRequireVerify() {
        return requireVerify;
    }

    public void setRequireVerify(boolean requireVerify) {
        this.requireVerify = requireVerify;
    }

    public boolean isDevExposeCode() {
        return devExposeCode;
    }

    public void setDevExposeCode(boolean devExposeCode) {
        this.devExposeCode = devExposeCode;
    }

    public String getDevCode() {
        return devCode;
    }

    public void setDevCode(String devCode) {
        this.devCode = devCode;
    }
}