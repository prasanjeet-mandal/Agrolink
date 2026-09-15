package com.agrolink.service;

import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;

public interface OtpService {

    OtpSendResponse send(OtpSendRequest request);

    OtpVerifyResponse verify(OtpVerifyRequest request);
}