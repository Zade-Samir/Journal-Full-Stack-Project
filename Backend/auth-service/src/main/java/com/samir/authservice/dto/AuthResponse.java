package com.samir.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token; // This is the access token
    private String refreshToken;

    public AuthResponse(String token) {
        this.token = token;
    }
}
