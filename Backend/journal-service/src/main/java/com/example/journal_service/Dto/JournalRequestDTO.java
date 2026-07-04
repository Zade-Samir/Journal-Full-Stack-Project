package com.example.journal_service.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JournalRequestDTO {

    private Long id;

    @NotBlank(message = "What you did today cannot be empty")
    @Size(min = 5, message = "Write at least 5 characters")
    private String whatDidIDo;

    @NotBlank(message = "Best moment cannot be empty")
    private String bestMoment;
    private String worstMoment;

    @NotBlank(message = "Learning cannot be empty")
    private String whatILearned;

    private List<String> gratitude;
    private List<String> shortTermGoal;
    private List<String> longTermGoal;

    @NotBlank(message = "Your work for goal cannot be empty")
    private String whatIDoForGoal;

    @NotBlank(message = "Feeling is required")
    private String feeling;
    private String feelingNote;
}