package com.samir.authservice.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);
    private final RestClient restClient;

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .build();
    }

    private record ResendPayload(
            String from,
            List<String> to,
            String subject,
            String html
    ) {}

    @Async
    public void sendVerificationEmail(String toEmail, String token) {
        LOGGER.info("Preparing to send verification email via Resend to: {}", toEmail);
        try {
            String htmlMsg = "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;\">"
                    + "<h2 style=\"color: #333333; text-align: center;\">Verify Your Email Address</h2>"
                    + "<p>Hello,</p>"
                    + "<p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes:</p>"
                    + "<div style=\"text-align: center; margin: 35px 0;\">"
                    + "<span style=\"background-color: #f4f4f4; border: 1px solid #dddddd; color: #333333; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 14px 28px; border-radius: 10px; display: inline-block;\">" + token + "</span>"
                    + "</div>"
                    + "<p>If you did not request this code, you can safely ignore this email.</p>"
                    + "<p style=\"margin-top: 40px;\">Best regards,<br/>The Quiet Room Team</p>"
                    + "</div>";

            ResendPayload payload = new ResendPayload(
                    "The Quiet Room <" + fromEmail + ">",
                    List.of(toEmail),
                    "Verify Your Email - The Quiet Room",
                    htmlMsg
            );

            restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            LOGGER.info("Verification email sent via Resend successfully to: {}", toEmail);
        } catch (Exception e) {
            LOGGER.error("Failed to send verification email via Resend to: {}", toEmail, e);
        }
    }
}
