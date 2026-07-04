package com.samir.authservice.controller;

import com.samir.authservice.common.ApiResponse;
import com.samir.authservice.dto.AuthRequest;
import com.samir.authservice.dto.AuthResponse;
import com.samir.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService service;
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

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
            @Valid @RequestBody AuthRequest request
    ) {
        LOGGER.info("API HIT: Login endpoint called");
        AuthResponse result = service.login(request);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Login successful",
                        result)
        );
    }
}
