package com.samir.journal_service.repo;

import com.samir.journal_service.entity.UserReminderPref;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserReminderPrefRepo extends JpaRepository<UserReminderPref, String> {

    /** All users who have reminders enabled at the given hour */
    @Query("SELECT r FROM UserReminderPref r WHERE r.reminderEnabled = true AND r.reminderHour = :hour")
    List<UserReminderPref> findAllEnabledAtHour(int hour);
}
