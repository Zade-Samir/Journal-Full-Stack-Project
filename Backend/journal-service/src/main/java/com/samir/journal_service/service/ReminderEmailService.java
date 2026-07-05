package com.samir.journal_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Sends journal reminder emails via the Resend API.
 * Mirrors the pattern used in auth-service's EmailService.
 */
@Service
public class ReminderEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReminderEmailService.class);

    private final RestClient restClient;

    @Value("${resend.api.key:}")
    private String apiKey;

    @Value("${resend.from.email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public ReminderEmailService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .build();
    }

    private record ResendPayload(String from, List<String> to, String subject, String html) {}

    @Async
    public void sendReminderEmail(String toEmail, String firstName) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("re_your_api_key")) {
            LOGGER.warn("Resend API key not configured — skipping reminder email for {}", toEmail);
            return;
        }

        LOGGER.info("Sending daily journal reminder to: {}", toEmail);
        try {
            String name = (firstName != null && !firstName.isBlank()) ? firstName : "there";
            String html = "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #3b82f6; margin-bottom: 8px;\">Your Quiet Room is waiting 📖</h2>"
                    + "<p>Hey " + name + ",</p>"
                    + "<p>You haven't written in your journal yet today. Even a few sentences can make a real difference — capture what happened, what you felt, or what you're grateful for.</p>"
                    + "<div style=\"text-align: center; margin: 32px 0;\">"
                    + "<a href=\"" + frontendUrl + "\" style=\"background-color: #3b82f6; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;\">Open My Journal</a>"
                    + "</div>"
                    + "<p style=\"color: #888; font-size: 13px;\">You can adjust or turn off reminders in your account settings.</p>"
                    + "<p style=\"margin-top: 32px;\">— The Quiet Room</p>"
                    + "</div>";

            ResendPayload payload = new ResendPayload(
                    "The Quiet Room <" + fromEmail + ">",
                    List.of(toEmail),
                    "Don't forget to journal today ✍️",
                    html
            );

            restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            LOGGER.info("Reminder email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            LOGGER.error("Failed to send reminder email to: {}", toEmail, e);
        }
    }

    @Async
    public void sendGoalCompletionEmail(String toEmail, String goalTitle) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("re_your_api_key")) {
            LOGGER.warn("Resend API key not configured — skipping goal completion email for {}", toEmail);
            return;
        }

        LOGGER.info("Sending goal completion congratulatory email to: {}", toEmail);
        try {
            String html = "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #10b981; margin-bottom: 8px;\">Congratulations on achieving your goal! 🎉🏆</h2>"
                    + "<p>Hello,</p>"
                    + "<p>We noticed that you've marked your goal <strong>\"" + goalTitle + "\"</strong> as completed! Achieving a goal takes dedication, effort, and focus. You should be proud of your progress!</p>"
                    + "<div style=\"text-align: center; margin: 32px 0;\">"
                    + "<a href=\"" + frontendUrl + "/goals\" style=\"background-color: #10b981; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;\">View My Goals</a>"
                    + "</div>"
                    + "<p>Keep writing, tracking, and reaching for the stars.</p>"
                    + "<p style=\"margin-top: 32px;\">— The Quiet Room</p>"
                    + "</div>";

            ResendPayload payload = new ResendPayload(
                    "The Quiet Room <" + fromEmail + ">",
                    List.of(toEmail),
                    "Goal Achieved: " + goalTitle + "! 🎉",
                    html
            );

            restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            LOGGER.info("Goal completion email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            LOGGER.error("Failed to send goal completion email to: {}", toEmail, e);
        }
    }

    @Async
    public void sendGoalDeadlineWarningEmail(String toEmail, String goalTitle, int daysLeft) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("re_your_api_key")) {
            LOGGER.warn("Resend API key not configured — skipping goal deadline email for {}", toEmail);
            return;
        }

        LOGGER.info("Sending goal deadline warning email to: {}", toEmail);
        try {
            String html = "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #f59e0b; margin-bottom: 8px;\">Goal Deadline Approaching ⏳</h2>"
                    + "<p>Hello,</p>"
                    + "<p>This is a friendly reminder that the target date for your goal <strong>\"" + goalTitle + "\"</strong> is in " + daysLeft + " days.</p>"
                    + "<p>Take a few moments to review your progress, update your journal, and take another step towards completion. Consistency is key!</p>"
                    + "<div style=\"text-align: center; margin: 32px 0;\">"
                    + "<a href=\"" + frontendUrl + "/goals\" style=\"background-color: #f59e0b; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;\">Open Goals Dashboard</a>"
                    + "</div>"
                    + "<p style=\"margin-top: 32px;\">— The Quiet Room</p>"
                    + "</div>";

            ResendPayload payload = new ResendPayload(
                    "The Quiet Room <" + fromEmail + ">",
                    List.of(toEmail),
                    "Goal Target Approaching: " + goalTitle + " ⏳",
                    html
            );

            restClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            LOGGER.info("Goal deadline email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            LOGGER.error("Failed to send goal deadline email to: {}", toEmail, e);
        }
    }
}
