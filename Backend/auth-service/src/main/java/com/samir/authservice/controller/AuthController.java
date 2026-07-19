package com.samir.authservice.controller;

import com.samir.authservice.common.ApiResponse;
import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;
import com.samir.authservice.dto.VerifyOtpRequest;
import com.samir.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody AuthRequest request
    ) {
        LOGGER.info("API HIT: Register endpoint called");
        service.register(request);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User Register successfully!!",
                        null)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response
    ) {
        LOGGER.info("API HIT: Login endpoint called");
        AuthResponse result = service.login(request);

        // Write secure HttpOnly cookie for refresh token
        ResponseCookie cookie = ResponseCookie.from("refresh_token", result.getRefreshToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Do not return refresh token in body
        result.setRefreshToken(null);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        result)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        LOGGER.info("API HIT: Verify OTP endpoint called for email: {}", request.getEmail());
        service.verifyOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Email verified successfully!",
                        null)
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(
            @RequestParam("email") String email
    ) {
        LOGGER.info("API HIT: Resend OTP endpoint called for email: {}", email);
        service.resendOtp(email);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "New verification code sent successfully!",
                        null)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken
    ) {
        LOGGER.info("API HIT: Refresh endpoint called");
        if (refreshToken == null) {
            throw new RuntimeException("Missing refresh token.");
        }
        AuthResponse result = service.refreshAccessToken(refreshToken);
        result.setRefreshToken(null);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Token refreshed successfully!",
                        result)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        LOGGER.info("API HIT: Logout endpoint called");
        if (refreshToken != null) {
            service.logout(refreshToken);
        }

        // Clear refresh_token cookie
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0) // immediately delete
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Logged out successfully!",
                        null)
        );
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<String>> deleteAccount(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            HttpServletResponse response
    ) {
        LOGGER.info("API HIT: Delete account called for user: {}", userEmail);
        if (userEmail == null) {
            throw new RuntimeException("Missing user context");
        }
        service.deleteAccount(userEmail);

        // Clear refresh_token cookie too
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Account deleted successfully", null)
        );
    }
}
