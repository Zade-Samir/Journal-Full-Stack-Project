package com.samir.journal_service.service;

import com.samir.journal_service.Dto.GoalDTO;
import com.samir.journal_service.Dto.GoalRequestDTO;
import com.samir.journal_service.Dto.JournalRequestDTO;

import java.util.List;

public interface GoalService {
    List<GoalDTO> getGoals(String userEmail, String statusFilter);
    GoalDTO createGoal(String userEmail, GoalRequestDTO dto);
    GoalDTO updateGoal(Long goalId, String userEmail, GoalRequestDTO dto);
    void deleteGoal(Long goalId, String userEmail);
    List<JournalRequestDTO> getJournalsByGoal(Long goalId, String userEmail);
}
