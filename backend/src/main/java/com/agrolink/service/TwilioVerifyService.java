package com.agrolink.service;

public interface TwilioVerifyService {

    boolean isConfigured();

    void sendCode(String phone);

    boolean checkCode(String phone, String code);
}