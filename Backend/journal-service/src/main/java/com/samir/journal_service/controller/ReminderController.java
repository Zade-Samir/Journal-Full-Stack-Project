package com.samir.journal_service.controller;

import com.samir.journal_service.Dto.ReminderPrefDTO;
import com.samir.journal_service.common.ApiResponse;
import com.samir.journal_service.entity.UserReminderPref;
import com.samir.journal_service.repo.UserReminderPrefRepo;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journal/reminders")
@AllArgsConstructor
public class ReminderController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReminderController.class);

    private final UserReminderPrefRepo reminderPrefRepo;

    /** GET /journal/reminders/preferences — fetch current user's reminder preferences */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<ReminderPrefDTO>> getPreferences(Authentication authentication) {
        String userEmail = authentication.getName();
        LOGGER.info("API HIT: Getting reminder preferences for user: {}", userEmail);

        UserReminderPref pref = reminderPrefRepo.findById(userEmail)
                .orElseGet(() -> {
                    // Return defaults without persisting — user hasn't opted in yet
                    UserReminderPref defaults = new UserReminderPref();
                    defaults.setUserEmail(userEmail);
                    defaults.setReminderEnabled(false);
                    defaults.setReminderHour(20);
                    return defaults;
                });

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Reminder preferences fetched successfully",
                new ReminderPrefDTO(pref.isReminderEnabled(), pref.getReminderHour())
        ));
    }

    /** PUT /journal/reminders/preferences — upsert reminder preferences */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<ReminderPrefDTO>> updatePreferences(
            Authentication authentication,
            @RequestBody ReminderPrefDTO dto
    ) {
        String userEmail = authentication.getName();
        LOGGER.info("API HIT: Updating reminder preferences for user: {} — enabled={}, hour={}",
                userEmail, dto.isReminderEnabled(), dto.getReminderHour());

        // Validate hour
        if (dto.getReminderHour() < 0 || dto.getReminderHour() > 23) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false, "Reminder hour must be between 0 and 23", null
            ));
        }

        UserReminderPref pref = reminderPrefRepo.findById(userEmail)
                .orElseGet(() -> {
                    UserReminderPref newPref = new UserReminderPref();
                    newPref.setUserEmail(userEmail);
                    return newPref;
                });

        pref.setReminderEnabled(dto.isReminderEnabled());
        pref.setReminderHour(dto.getReminderHour());
        reminderPrefRepo.save(pref);

        LOGGER.info("Reminder preferences saved for user: {}", userEmail);
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Reminder preferences updated successfully",
                new ReminderPrefDTO(pref.isReminderEnabled(), pref.getReminderHour())
        ));
    }
}
