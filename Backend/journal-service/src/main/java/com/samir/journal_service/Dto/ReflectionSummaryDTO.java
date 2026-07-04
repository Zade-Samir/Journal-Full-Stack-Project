package com.samir.journal_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReflectionSummaryDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalEntries;
    private String dominantMood;
    private Map<String, Long> moodFrequency;
    private List<String> gratitudeList;
    private List<GoalDTO> completedGoals;
    private List<GoalDTO> activeGoals;
}
