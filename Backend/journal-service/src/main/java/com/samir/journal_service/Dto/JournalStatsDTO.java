package com.samir.journal_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalStatsDTO {
    private List<MoodCountDTO> moodCounts;
    private List<DailyMoodDTO> dailyMoods;
}
