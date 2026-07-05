package com.samir.authservice.service;

import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    void register(AuthRequest request);

    AuthResponse handleGoogleLogin(String email);

    void verifyOtp(String email, String code);

    void resendOtp(String email);

    AuthResponse refreshAccessToken(String refreshToken);

    void logout(String refreshToken);
}
