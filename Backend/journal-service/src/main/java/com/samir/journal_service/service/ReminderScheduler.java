package com.samir.journal_service.service;

import com.samir.journal_service.entity.UserReminderPref;
import com.samir.journal_service.repo.JournalRepo;
import com.samir.journal_service.repo.UserReminderPrefRepo;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Runs at the top of every hour (0 0 * * * *).
 * For each user whose reminder_hour matches the current hour and who
 * has NOT written a journal entry today, sends a reminder email.
 */
@Component
@AllArgsConstructor
public class ReminderScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReminderScheduler.class);

    private final UserReminderPrefRepo reminderPrefRepo;
    private final JournalRepo journalRepo;
    private final ReminderEmailService emailService;

    @Scheduled(cron = "0 0 * * * *") // Top of every hour
    public void sendDailyReminders() {
        int currentHour = LocalTime.now().getHour();
        LOGGER.info("ReminderScheduler triggered at hour: {}", currentHour);

        List<UserReminderPref> candidates = reminderPrefRepo.findAllEnabledAtHour(currentHour);
        LOGGER.info("Found {} users with reminders set for hour {}", candidates.size(), currentHour);

        LocalDate today = LocalDate.now();
        int sent = 0;

        for (UserReminderPref pref : candidates) {
            String email = pref.getUserEmail();
            boolean hasJournaled = journalRepo.findByUserIdAndDateAndIsDeletedFalse(email, today).isPresent();
            if (!hasJournaled) {
                emailService.sendReminderEmail(email, null);
                sent++;
            }
        }
        LOGGER.info("ReminderScheduler: sent {} reminder emails for hour {}", sent, currentHour);
    }
}
