package com.samir.journal_service.service.Impl;

import com.samir.journal_service.Dto.GoalDTO;
import com.samir.journal_service.Dto.GoalRequestDTO;
import com.samir.journal_service.Dto.JournalRequestDTO;
import com.samir.journal_service.entity.Goal;
import com.samir.journal_service.entity.GoalStatus;
import com.samir.journal_service.entity.GoalType;
import com.samir.journal_service.entity.Journal;
import com.samir.journal_service.exception.ResourceNotFoundException;
import com.samir.journal_service.exception.UnauthorizedException;
import com.samir.journal_service.mapper.JournalMapper;
import com.samir.journal_service.repo.GoalRepo;
import com.samir.journal_service.repo.JournalRepo;
import com.samir.journal_service.service.GoalService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class GoalServiceImpl implements GoalService {

    private static final Logger LOGGER = LoggerFactory.getLogger(GoalServiceImpl.class);

    private final GoalRepo goalRepo;
    private final JournalRepo journalRepo;
    private final JournalMapper mapper;

    @Override
    public List<GoalDTO> getGoals(String userEmail, String statusFilter) {
        LOGGER.info("Fetching goals for user: {} with statusFilter: {}", userEmail, statusFilter);
        
        List<Goal> goals;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            try {
                GoalStatus status = GoalStatus.valueOf(statusFilter.toUpperCase());
                goals = goalRepo.findByUserIdAndStatus(userEmail, status);
            } catch (IllegalArgumentException e) {
                LOGGER.warn("Invalid status filter passed: {}, fetching all user goals", statusFilter);
                goals = goalRepo.findByUserId(userEmail);
            }
        } else {
            goals = goalRepo.findByUserId(userEmail);
        }

        return goals.stream()
                .map(mapper::toGoalDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GoalDTO createGoal(String userEmail, GoalRequestDTO dto) {
        LOGGER.info("Creating goal for user: {}", userEmail);

        Goal goal = mapper.toGoal(dto);
        goal.setUserId(userEmail);
        
        // Enforce default status/type if null/empty
        if (goal.getStatus() == null) {
            goal.setStatus(GoalStatus.NOT_STARTED);
        }
        if (goal.getType() == null) {
            goal.setType(GoalType.SHORT_TERM);
        }

        Goal saved = goalRepo.save(goal);
        LOGGER.info("Goal created successfully with ID: {}", saved.getId());
        return mapper.toGoalDTO(saved);
    }

    @Override
    public GoalDTO updateGoal(Long goalId, String userEmail, GoalRequestDTO dto) {
        LOGGER.info("Updating goal ID: {} for user: {}", goalId, userEmail);

        Goal existingGoal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!existingGoal.getUserId().equals(userEmail)) {
            LOGGER.error("Unauthorized goal update attempt by user: {} for goal ID: {}", userEmail, goalId);
            throw new UnauthorizedException("Unauthorized access to this goal");
        }

        existingGoal.setTitle(dto.getTitle());
        existingGoal.setTargetDate(dto.getTargetDate());
        
        try {
            existingGoal.setStatus(GoalStatus.valueOf(dto.getStatus().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            LOGGER.warn("Invalid status: {}, leaving unchanged", dto.getStatus());
        }

        try {
            existingGoal.setType(GoalType.valueOf(dto.getType().toUpperCase()));
        } catch (IllegalArgumentException | NullPointerException e) {
            LOGGER.warn("Invalid type: {}, leaving unchanged", dto.getType());
        }

        Goal updated = goalRepo.save(existingGoal);
        LOGGER.info("Goal updated successfully for ID: {}", updated.getId());
        return mapper.toGoalDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGoal(Long goalId, String userEmail) {
        LOGGER.info("Deleting goal ID: {} for user: {}", goalId, userEmail);

        Goal existingGoal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!existingGoal.getUserId().equals(userEmail)) {
            LOGGER.error("Unauthorized goal delete attempt by user: {} for goal ID: {}", userEmail, goalId);
            throw new UnauthorizedException("Unauthorized access to this goal");
        }

        // Clean up join table links first to prevent foreign key issues
        goalRepo.deleteJournalLinksByGoalId(goalId);

        // Delete the goal
        goalRepo.delete(existingGoal);
        LOGGER.info("Goal deleted successfully for ID: {}", goalId);
    }

    @Override
    public List<JournalRequestDTO> getJournalsByGoal(Long goalId, String userEmail) {
        LOGGER.info("Fetching journals associated with goal ID: {} for user: {}", goalId, userEmail);

        // Verify goal exists and belongs to the user
        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID: " + goalId));

        if (!goal.getUserId().equals(userEmail)) {
            LOGGER.error("Unauthorized journals fetch attempt by user: {} for goal ID: {}", userEmail, goalId);
            throw new UnauthorizedException("Unauthorized access to this goal's journals");
        }

        List<Journal> journals = journalRepo.findJournalsByGoalIdAndUserId(goalId, userEmail);
        return journals.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
