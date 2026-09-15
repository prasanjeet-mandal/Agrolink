package com.agrolink.service.impl;

import com.agrolink.config.OtpConfig;
import com.agrolink.dto.auth.OtpSendRequest;
import com.agrolink.dto.auth.OtpSendResponse;
import com.agrolink.dto.auth.OtpVerifyRequest;
import com.agrolink.dto.auth.OtpVerifyResponse;
import com.agrolink.exception.BadRequestException;
import com.agrolink.exception.RateLimitException;
import com.agrolink.security.JwtService;
import com.agrolink.service.OtpService;
import com.agrolink.service.TwilioVerifyService;
import com.agrolink.util.PhoneUtil;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private final OtpConfig config;
    private final JwtService jwtService;
    private final TwilioVerifyService verifyService;

    // requestId -> verification intent. Holds only bookkeeping metadata,
    // never the OTP itself (Twilio Verify owns the code lifecycle).
    private final Map<String, Intent> store = new ConcurrentHashMap<>();

    private final Map<String, String> phoneToRequestId = new ConcurrentHashMap<>();

    // phone -> recent send timestamps, used only for rate limiting.
    private final Map<String, List<Instant>> sendLog = new ConcurrentHashMap<>();

    public OtpServiceImpl(
            OtpConfig config,
            JwtService jwtService,
            TwilioVerifyService verifyService
    ) {
        this.config = config;
        this.jwtService = jwtService;
        this.verifyService = verifyService;
    }

    private record Intent(String email, String phone, Instant createdAt, int attempts) {
    }

    @Override
    public OtpSendResponse send(OtpSendRequest request) {

        String email = request.email().trim().toLowerCase();
        String phone = request.phone().trim();

        if (!PhoneUtil.isValidE164(phone)) {
            throw new BadRequestException(
                    "Enter a valid phone number in international format, e.g. +919876543210"
            );
        }

        Instant now = Instant.now();

        enforceSendLimit(phone, now);

        String requestId = UUID.randomUUID().toString();

        String previous = phoneToRequestId.remove(phone);

        if (previous != null) {
            store.remove(previous);
        }

        store.put(
                requestId,
                new Intent(email, phone, now, 0)
        );

        phoneToRequestId.put(phone, requestId);
        sendLog.computeIfAbsent(phone, k -> new ArrayList<>()).add(now);

        String exposedCode = null;

        if (verifyService.isConfigured()) {
            verifyService.sendCode(phone);
        } else {
            // Dev fallback: no Twilio credentials configured. Accepts the fixed
            // dev code so the UI stays usable without an SMS provider.
            if (config.isDevExposeCode()) {
                exposedCode = config.getDevCode();
            }
        }

        return new OtpSendResponse(
                requestId,
                exposedCode,
                mask(email),
                mask(phone),
                config.getTtlSeconds()
        );
    }

    @Override
    public OtpVerifyResponse verify(OtpVerifyRequest request) {

        String phone = request.phone().trim();
        String code = request.code() == null ? "" : request.code().trim();
        String email = request.email() == null ? "" : request.email().trim().toLowerCase();

        if (!PhoneUtil.isValidE164(phone)) {
            throw new BadRequestException(
                    "Enter a valid phone number in international format, e.g. +919876543210"
            );
        }

        if (code.isBlank()) {
            throw new BadRequestException(
                    "Enter the verification code"
            );
        }

        Intent intent = store.get(request.requestId());

        if (intent == null) {
            throw new BadRequestException(
                    "This verification request has expired. Please request a new code"
            );
        }

        if (!intent.phone().equals(phone)) {
            throw new BadRequestException(
                    "Invalid or expired OTP"
            );
        }

        Instant now = Instant.now();

        if (now.isAfter(intent.createdAt().plusSeconds(config.getTtlSeconds()))) {
            store.remove(request.requestId());
            phoneToRequestId.remove(phone);
            throw new BadRequestException(
                    "OTP has expired. Please request a new code"
            );
        }

        if (intent.attempts() >= config.getMaxVerifyAttempts()) {
            store.remove(request.requestId());
            phoneToRequestId.remove(phone);
            throw new BadRequestException(
                    "Too many incorrect attempts. Please request a new code"
            );
        }

        boolean approved = verifyService.isConfigured()
                ? verifyService.checkCode(phone, code)
                : config.getDevCode().equals(code);

        if (!approved) {
            store.put(
                    request.requestId(),
                    new Intent(
                            intent.email(),
                            intent.phone(),
                            intent.createdAt(),
                            intent.attempts() + 1
                    )
            );

            throw new BadRequestException(
                    "Invalid or expired OTP"
            );
        }

        store.remove(request.requestId());
        phoneToRequestId.remove(phone);

        String tokenEmail = email.isBlank() ? intent.email() : email;

        String registrationToken =
                jwtService.generateRegistrationToken(
                        tokenEmail,
                        phone
                );

        return new OtpVerifyResponse(
                true,
                request.requestId(),
                registrationToken,
                config.getTtlSeconds()
        );
    }

    private void enforceSendLimit(String phone, Instant now) {

        List<Instant> history = sendLog.getOrDefault(
                phone,
                List.of()
        );

        Instant lastAttempt = history.isEmpty()
                ? null
                : history.get(history.size() - 1);

        if (lastAttempt != null) {
            long waited = ChronoUnit.SECONDS.between(lastAttempt, now);

            if (waited < config.getResendCooldownSeconds()) {
                long remaining = config.getResendCooldownSeconds() - waited;
                throw new RateLimitException(
                        "Please wait " + remaining
                                + "s before requesting another code"
                );
            }
        }

        Instant windowStart = now.minus(
                config.getRateWindowMinutes(),
                ChronoUnit.MINUTES
        );

        long recent = history.stream()
                .filter(t -> t.isAfter(windowStart))
                .count();

        if (recent >= config.getMaxSendsPerWindow()) {
            throw new RateLimitException(
                    "Too many OTP requests. Please try again later"
            );
        }
    }

    private String mask(String value) {

        String v = String.valueOf(value == null ? "" : value);

        if (v.length() <= 2) {
            return v;
        }

        int keep = Math.min(2, v.length() - 1);

        return v.substring(0, keep)
                + "*".repeat(Math.max(v.length() - keep - 1, 1))
                + v.substring(v.length() - 1);
    }
}