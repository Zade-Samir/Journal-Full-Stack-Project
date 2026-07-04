package com.samir.journal_service.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequestDTO {

    @NotBlank(message = "Goal title is required")
    private String title;

    private LocalDate targetDate;

    @NotBlank(message = "Goal status is required")
    private String status; // NOT_STARTED, IN_PROGRESS, DONE

    @NotBlank(message = "Goal type is required")
    private String type; // SHORT_TERM, LONG_TERM
}
