package com.example.journal_service.controller;

import com.example.journal_service.Dto.JournalAutoSaveDTO;
import com.example.journal_service.Dto.JournalRequestDTO;
import com.example.journal_service.Dto.JournalStatsDTO;
import com.example.journal_service.Dto.StreakDTO;
import com.example.journal_service.common.ApiResponse;
import com.example.journal_service.service.JournalService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/journal")
@AllArgsConstructor
public class JournalController {

    private static final Logger LOGGER = LoggerFactory.getLogger(JournalController.class);

    private final JournalService service;

    //helper methods to extract the userEmail and role, instead of extracting every time
    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }

    private String getUserRole(Authentication authentication) {
        return authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();
    }

    //Create new journal entry
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping()
    public ResponseEntity<ApiResponse<JournalRequestDTO>> createJournal(
            Authentication authentication,
            @Valid @RequestBody JournalRequestDTO dto) {

        String userEmail = getUserEmail(authentication);

        LOGGER.info("API HIT: Creating journal for user: {}", userEmail);
        JournalRequestDTO result = service.createJournal(userEmail, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal created successfully",
                        result
                )
        );
    }

    //Get today's journal
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<JournalRequestDTO>> getTodayJournal(
            Authentication authentication
    ) {
        String userEmail = getUserEmail(authentication);

        LOGGER.info("API HIT: Getting today's Journal for user: {}", userEmail);
        JournalRequestDTO result = service.getTodayJournal(userEmail);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal fetched successfully",
                        result
                )
        );
    }

    //Get journal stats
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<JournalStatsDTO>> getJournalStats(
            Authentication authentication,
            @RequestParam(defaultValue = "30d") String range
    ) {
        String userEmail = getUserEmail(authentication);

        LOGGER.info("API HIT: Getting journal stats for user: {} with range: {}", userEmail, range);
        JournalStatsDTO result = service.getJournalStats(userEmail, range);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal stats fetched successfully",
                        result
                )
        );
    }

    //Get journal streak
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StreakDTO>> getJournalStreak(
            Authentication authentication
    ) {
        String userEmail = getUserEmail(authentication);

        LOGGER.info("API HIT: Getting journal streak for user: {}", userEmail);
        int streak = service.getJournalStreak(userEmail);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal streak fetched successfully",
                        new StreakDTO(streak)
                )
        );
    }

    //Get all journals (archive)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<Page<JournalRequestDTO>>> getAllJournal(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        String userEmail = getUserEmail(authentication);
        String role = getUserRole(authentication);

        LOGGER.info("API HIT: Getting all journals for user: {}", userEmail);
        Page<JournalRequestDTO> result = service.getAllJournal(userEmail, role, page, size);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "All journals fetched successfully",
                        result
                )
        );
    }

    //Update journal
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping("/{journalId}")
    public ResponseEntity<ApiResponse<JournalRequestDTO>> updateJournal(
            @PathVariable Long journalId,
            Authentication authentication,
            @Valid @RequestBody JournalRequestDTO dto
    ) {
        String userEmail = getUserEmail(authentication);

        LOGGER.info("API HIT: Updating journal for user: {}", userEmail);
        JournalRequestDTO result = service.updateJournal(journalId, userEmail, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal updated successfully",
                        result
                )
        );
    }

    //delete journal(soft delete)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/{journalId}")
    public ResponseEntity<ApiResponse<String>> deleteJournal(
            @PathVariable Long journalId,
            Authentication authentication) {

        String userEmail = getUserEmail(authentication);
        String role = getUserRole(authentication);

        LOGGER.info("Deleting journal for user: {} with role: {}", userEmail, role);
        service.deleteJournal(journalId, userEmail, role);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal delete successfully!!",
                        null
                )
        );
    }

    //let's make Auto-save journal here
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PatchMapping("/auto-save")
    public ResponseEntity<ApiResponse<JournalRequestDTO>> autoSaveJournal(
            Authentication authentication,
            @Valid @RequestBody JournalAutoSaveDTO dto
    ) {
        String userEmail = getUserEmail(authentication);
        LOGGER.info("API HIT: Auto-saving journal for user: {}", userEmail);
        JournalRequestDTO result = service.autoSaveJournal(userEmail, dto);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Journal auto-saved successfully",
                        result
                )
        );
    }

    //Get weekly/monthly reflection summary
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/reflection")
    public ResponseEntity<ApiResponse<com.example.journal_service.Dto.ReflectionSummaryDTO>> getReflectionSummary(
            Authentication authentication,
            @RequestParam(defaultValue = "7d") String range,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        String userEmail = getUserEmail(authentication);
        LOGGER.info("API HIT: Getting reflection summary for user: {} with range: {} (or custom dates: {} to {})", userEmail, range, startDate, endDate);
        com.example.journal_service.Dto.ReflectionSummaryDTO result = service.getReflectionSummary(userEmail, range, startDate, endDate);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Reflection summary fetched successfully",
                        result
                )
        );
    }

}
