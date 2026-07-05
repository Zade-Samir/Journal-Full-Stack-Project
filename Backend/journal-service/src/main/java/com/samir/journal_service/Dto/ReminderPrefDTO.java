package com.samir.journal_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderPrefDTO {

    /** Whether the daily reminder email is enabled */
    private boolean reminderEnabled;

    /** Hour of day (0–23) at which the reminder should be sent */
    private int reminderHour;
}
