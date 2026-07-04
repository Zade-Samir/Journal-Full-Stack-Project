package com.samir.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
//login response
public class AuthResponse {

    private String token;
}
