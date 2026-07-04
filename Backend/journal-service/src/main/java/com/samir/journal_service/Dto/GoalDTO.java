package com.samir.journal_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    private String title;
    private LocalDate targetDate;
    private String status; // NOT_STARTED, IN_PROGRESS, DONE
    private String type; // SHORT_TERM, LONG_TERM
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
