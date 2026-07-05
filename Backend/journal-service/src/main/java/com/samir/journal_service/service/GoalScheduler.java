package com.samir.journal_service.service;

import com.samir.journal_service.entity.Goal;
import com.samir.journal_service.entity.GoalStatus;
import com.samir.journal_service.repo.GoalRepo;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled job to check for active goals whose deadline is approaching.
 * Runs daily at 9:00 AM.
 */
@Component
@AllArgsConstructor
public class GoalScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GoalScheduler.class);

    private final GoalRepo goalRepo;
    private final ReminderEmailService emailService;

    // Run daily at 9:00 AM (0 0 9 * * *)
    @Scheduled(cron = "0 0 9 * * *")
    public void sendGoalDeadlineWarnings() {
        LOGGER.info("GoalScheduler: Checking active goals for upcoming deadlines...");
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(2); // Warn if deadline is in exactly 2 days

        List<Goal> upcomingGoals = goalRepo.findByStatusNotAndTargetDate(GoalStatus.DONE, warningDate);
        LOGGER.info("Found {} active goals with target date on {}", upcomingGoals.size(), warningDate);

        int sentCount = 0;
        for (Goal goal : upcomingGoals) {
            String email = goal.getUserId();
            LOGGER.info("Sending upcoming goal deadline notification to user: {} for goal: {}", email, goal.getTitle());
            emailService.sendGoalDeadlineWarningEmail(email, goal.getTitle(), 2);
            sentCount++;
        }
        LOGGER.info("GoalScheduler completed: Sent {} deadline warnings.", sentCount);
    }
}
