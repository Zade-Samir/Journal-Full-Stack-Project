package com.samir.authservice.service;

import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    void register(AuthRequest request);

    String handleGoogleLogin(String email);
}
