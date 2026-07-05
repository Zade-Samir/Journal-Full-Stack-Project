package com.samir.authservice.security;

import com.samir.authservice.service.AuthService;
import com.samir.authservice.dto.AuthResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final AuthService authService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        try {
            OAuth2User user = (OAuth2User) authentication.getPrincipal();

            //extract email
            String email = user.getAttribute("email");
            LOGGER.info("OAuth2 login SUCCESS for email: {}", email);

            AuthResponse result = authService.handleGoogleLogin(email);
            LOGGER.info("Token generated, redirecting to: {}/oauth-success", frontendUrl);

            // Write secure HttpOnly cookie for refresh token
            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("refresh_token", result.getRefreshToken())
                    .httpOnly(true)
                    .secure(false) // Set to false to support local testing over HTTP without SSL
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60) // 7 days
                    .sameSite("Lax")
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());

            response.sendRedirect(frontendUrl + "/oauth-success?token=" + result.getToken());
        } catch (Exception e) {
            LOGGER.error("Error in OAuth2SuccessHandler: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + "/login?error=server_error");
        }
    }
}