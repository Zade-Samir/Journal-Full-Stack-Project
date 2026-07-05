-- V5: User reminder preferences for daily journal email reminders
CREATE TABLE IF NOT EXISTS user_reminder_pref (
    user_email      VARCHAR(255) NOT NULL PRIMARY KEY,
    reminder_enabled BOOLEAN      NOT NULL DEFAULT TRUE,
    reminder_hour   INT          NOT NULL DEFAULT 20,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
