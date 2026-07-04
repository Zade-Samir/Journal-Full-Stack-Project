package com.example.journal_service.Dto;

import lombok.Data;

import java.util.List;

@Data
public class JournalAutoSaveDTO {

    private String whatDidIDo;
    private String bestMoment;
    private String worstMoment;
    private String whatILearned;

    private List<String> gratitude;
    private List<String> shortTermGoal;
    private List<String> longTermGoal;

    private String whatIDoForGoal;
    private String feeling;
    private String feelingNote;
}
