package com.agrolink.service;

import com.agrolink.dto.auth.GoogleAuthResponse;
import com.agrolink.dto.auth.GoogleLoginRequest;
import com.agrolink.dto.auth.GoogleSignupRequest;

public interface GoogleAuthService {

    GoogleAuthResponse googleLogin(GoogleLoginRequest request);

    GoogleAuthResponse completeSignup(GoogleSignupRequest request);
}