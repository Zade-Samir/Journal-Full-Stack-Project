package com.example.journal_service.controller;

import com.example.journal_service.Dto.GoalDTO;
import com.example.journal_service.Dto.GoalRequestDTO;
import com.example.journal_service.Dto.JournalRequestDTO;
import com.example.journal_service.common.ApiResponse;
import com.example.journal_service.service.GoalService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/journal/goals")
@AllArgsConstructor
public class GoalController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GoalController.class);

    private final GoalService goalService;

    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalDTO>>> getGoals(
            Authentication authentication,
            @RequestParam(required = false) String status
    ) {
        String email = getUserEmail(authentication);
        LOGGER.info("API HIT: Fetching goals for user: {}", email);
        List<GoalDTO> goals = goalService.getGoals(email, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Goals fetched successfully", goals));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<GoalDTO>> createGoal(
            Authentication authentication,
            @Valid @RequestBody GoalRequestDTO dto
    ) {
        String email = getUserEmail(authentication);
        LOGGER.info("API HIT: Creating goal for user: {}", email);
        GoalDTO result = goalService.createGoal(email, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Goal created successfully", result));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/{goalId}")
    public ResponseEntity<ApiResponse<GoalDTO>> updateGoal(
            @PathVariable Long goalId,
            Authentication authentication,
            @Valid @RequestBody GoalRequestDTO dto
    ) {
        String email = getUserEmail(authentication);
        LOGGER.info("API HIT: Updating goal ID: {} for user: {}", goalId, email);
        GoalDTO result = goalService.updateGoal(goalId, email, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Goal updated successfully", result));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/{goalId}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable Long goalId,
            Authentication authentication
    ) {
        String email = getUserEmail(authentication);
        LOGGER.info("API HIT: Deleting goal ID: {} for user: {}", goalId, email);
        goalService.deleteGoal(goalId, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Goal deleted successfully", null));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{goalId}/journals")
    public ResponseEntity<ApiResponse<List<JournalRequestDTO>>> getJournalsByGoal(
            @PathVariable Long goalId,
            Authentication authentication
    ) {
        String email = getUserEmail(authentication);
        LOGGER.info("API HIT: Fetching journals for goal ID: {} for user: {}", goalId, email);
        List<JournalRequestDTO> result = goalService.getJournalsByGoal(goalId, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Journals for goal fetched successfully", result));
    }
}
