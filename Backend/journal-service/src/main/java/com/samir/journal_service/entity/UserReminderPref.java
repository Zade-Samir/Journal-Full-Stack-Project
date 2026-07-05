package com.samir.journal_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_reminder_pref")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserReminderPref {

    @Id
    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(name = "reminder_enabled", nullable = false)
    private boolean reminderEnabled = true;

    /** Hour of day (0-23) at which the reminder email should be sent */
    @Column(name = "reminder_hour", nullable = false)
    private int reminderHour = 20; // 8 PM default

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
