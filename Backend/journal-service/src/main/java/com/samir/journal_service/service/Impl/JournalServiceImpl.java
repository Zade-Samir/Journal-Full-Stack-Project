package com.samir.journal_service.service.Impl;

import com.samir.journal_service.Dto.*;
import com.samir.journal_service.entity.Goal;
import com.samir.journal_service.entity.GoalStatus;
import com.samir.journal_service.entity.Journal;
import com.samir.journal_service.exception.ResourceNotFoundException;
import com.samir.journal_service.exception.UnauthorizedException;
import com.samir.journal_service.mapper.JournalMapper;
import com.samir.journal_service.repo.GoalRepo;
import com.samir.journal_service.repo.JournalRepo;
import com.samir.journal_service.service.JournalService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class JournalServiceImpl implements JournalService {

    private final JournalRepo repo;
    private final GoalRepo goalRepo;
    private final JournalMapper mapper;

    private static final Logger LOGGER = LoggerFactory.getLogger(JournalServiceImpl.class);

    @Override
    public JournalStatsDTO getJournalStats(String userEmail, String range) {
        LOGGER.info("Fetching journal stats for user: {} with range: {}", userEmail, range);
        
        LocalDate startDate;
        if ("7d".equalsIgnoreCase(range)) {
            startDate = LocalDate.now().minusDays(7);
        } else if ("90d".equalsIgnoreCase(range)) {
            startDate = LocalDate.now().minusDays(90);
        } else if ("1y".equalsIgnoreCase(range) || "365d".equalsIgnoreCase(range)) {
            startDate = LocalDate.now().minusDays(365);
        } else if ("all".equalsIgnoreCase(range)) {
            startDate = LocalDate.of(1970, 1, 1);
        } else {
            // Default is 30d
            startDate = LocalDate.now().minusDays(30);
        }

        List<MoodCountDTO> moodCounts = repo.countFeelingsByUserIdAndDateAfter(userEmail, startDate);
        List<DailyMoodDTO> dailyMoods = repo.findDailyFeelingsByUserIdAndDateAfter(userEmail, startDate);

        return new JournalStatsDTO(moodCounts, dailyMoods);
    }

    //create the journal
    @Override
    @CacheEvict(value = "todayJournals", key = "#userEmail")
    public JournalRequestDTO createJournal(String userEmail, JournalRequestDTO dto) {

        LOGGER.info("Creating journal for user: {}", userEmail);

        Journal journal = mapper.toEntity(dto); //dto to entity

        journal.setUserId(userEmail);
        journal.setDate(LocalDate.now());
        journal.setCreatedAt(LocalDateTime.now());
        journal.setUpdatedAt(LocalDateTime.now());

        if (dto.getGoalIds() != null && !dto.getGoalIds().isEmpty()) {
            List<Goal> goals = goalRepo.findAllById(dto.getGoalIds());
            List<Goal> userGoals = goals.stream()
                    .filter(g -> g.getUserId().equals(userEmail))
                    .collect(Collectors.toList());
            journal.setGoals(userGoals);
        }

        Journal saved = repo.save(journal);

        LOGGER.info("Journal created successfully with ID: {}", saved.getId());

        return mapper.toDTO(saved); //entity to dto
    }


    //get today journal
    @Override
    @Cacheable(value = "todayJournals", key = "#userEmail")
    public JournalRequestDTO getTodayJournal(String userEmail) {

        LOGGER.info("Fetching today's journal for user: {}", userEmail);

        LocalDate today = LocalDate.now();

        Optional<Journal> journalOpt = repo.findByUserIdAndDateAndIsDeletedFalse(userEmail, today);
        if (journalOpt.isEmpty()) {
            LOGGER.info("No journal found for user: {} on date: {}", userEmail, today);
            return null;
        }

        return mapper.toDTO(journalOpt.get()); //converting entity into dto
    }

    //update the journal
    @Override
    @CacheEvict(value = "todayJournals", key = "#userEmail")
    public JournalRequestDTO updateJournal(Long journalId, String userEmail, JournalRequestDTO dto) {

        LOGGER.info("Updating journal ID: {} for user: {}", journalId, userEmail);

        Journal existingJournal = repo.findById(journalId)
                .orElseThrow(
                        () -> {
                            LOGGER.warn("No journal found for user: {} for journalId: {}", userEmail, journalId);
                            return new ResourceNotFoundException("No journal found with journal Id");
                        }
                );

        if(!existingJournal.getUserId().equals(userEmail)) {
            LOGGER.error("Unauthorized update attempt by user: {}", userEmail);
            throw new UnauthorizedException("Unauthorized access!");
        }

        //let's update the existing journal
        existingJournal.setWhatDidIDo(dto.getWhatDidIDo());
        existingJournal.setBestMoment(dto.getBestMoment());
        existingJournal.setWorstMoment(dto.getWorstMoment());
        existingJournal.setWhatILearned(dto.getWhatILearned());

        existingJournal.setGratitude(dto.getGratitude());
        existingJournal.setShortTermGoal(dto.getShortTermGoal());
        existingJournal.setLongTermGoal(dto.getLongTermGoal());

        if (dto.getGoalIds() != null) {
            List<Goal> goals = goalRepo.findAllById(dto.getGoalIds());
            List<Goal> userGoals = goals.stream()
                    .filter(g -> g.getUserId().equals(userEmail))
                    .collect(Collectors.toList());
            existingJournal.setGoals(userGoals);
        } else {
            existingJournal.getGoals().clear();
        }

        existingJournal.setWhatIDoForGoal(dto.getWhatIDoForGoal());
        existingJournal.setFeeling(dto.getFeeling());
        existingJournal.setFeelingNote(dto.getFeelingNote());

        existingJournal.setUpdatedAt(LocalDateTime.now());

        Journal updated = repo.save(existingJournal);

        LOGGER.info("Journal updated successfully by user: {}", userEmail);

        return mapper.toDTO(updated);
    }

    //delete journal
    @Override
    public void deleteJournal(Long journalId, String userEmail, String role) {

        LOGGER.info("Delete request for journalId: {} by user: {} with role: {}",
                journalId, userEmail, role);

        Journal journal = repo.findById(journalId)
                .orElseThrow(
                        () -> {
                            LOGGER.warn("No journal found for user: {} for journalId: {} in DB", userEmail, journalId);
                            return new ResourceNotFoundException("Journal not found in DB..");
                        }
                );

        // ADMIN can delete anything
        if ("ROLE_ADMIN".equals(role)) {
            LOGGER.info("Admin deleting journal");
        }
        // USER can delete only own journal
        else if (!journal.getUserId().equals(userEmail)) {
            LOGGER.error("Unauthorized delete attempt by user: {}", userEmail);
            throw new UnauthorizedException("You can delete only your own journal");
        }

        journal.setDeleted(true);
        repo.save(journal);

        LOGGER.info("Journal soft deleted successfully for user: {}", userEmail);
    }

    //auto saving the journal
    @Override
    @CacheEvict(value = "todayJournals", key = "#userEmail")
    public JournalRequestDTO autoSaveJournal(String userEmail, JournalAutoSaveDTO dto) {

        LOGGER.info("Auto-saving journal for user: {}", userEmail);

        //find the today date
        LocalDate today = LocalDate.now();

        //find the journal by userId, else create new journal
        Journal journal = repo.findByUserIdAndDateAndIsDeletedFalse(userEmail, today)
                .orElse(new Journal()); //else create the new journal

        //update basic info
        journal.setUserId(userEmail);
        journal.setDate(today);

        //update all if not null
        if(dto.getWhatDidIDo() != null) {
            journal.setWhatDidIDo(dto.getWhatDidIDo());
        }
        if(dto.getBestMoment() != null) {
            journal.setBestMoment(dto.getBestMoment());
        }
        if(dto.getWorstMoment() != null) {
            journal.setWorstMoment(dto.getWorstMoment());
        }
        if(dto.getWhatILearned() != null) {
            journal.setWhatILearned(dto.getWhatILearned());
        }
        if(dto.getGratitude() != null) {
            journal.setGratitude(dto.getGratitude());
        }


        if(dto.getShortTermGoal() != null) {
            journal.setShortTermGoal(dto.getShortTermGoal());
        }
        if(dto.getLongTermGoal() != null) {
            journal.setLongTermGoal(dto.getLongTermGoal());
        }
        if(dto.getGoalIds() != null) {
            List<Goal> goals = goalRepo.findAllById(dto.getGoalIds());
            List<Goal> userGoals = goals.stream()
                    .filter(g -> g.getUserId().equals(userEmail))
                    .collect(Collectors.toList());
            journal.setGoals(userGoals);
        }
        if(dto.getWhatIDoForGoal() != null) {
            journal.setWhatIDoForGoal(dto.getWhatIDoForGoal());
        }


        if(dto.getFeeling() != null) {
            journal.setFeeling(dto.getFeeling());
        }
        if(dto.getFeelingNote() != null) {
            journal.setFeelingNote(dto.getFeelingNote());
        }


        if (journal.getCreatedAt() == null) {
            journal.setCreatedAt(LocalDateTime.now());
        }

        journal.setUpdatedAt(LocalDateTime.now());

        //save
        Journal saved = repo.save(journal);

        //return
        LOGGER.info("Auto-saving journal successfully for user: {}", userEmail);
        return mapper.toDTO(saved);
    }


    //get all journals
    @Override
    public Page<JournalRequestDTO> getAllJournal(String userEmail, String role, int page, int size) {

        LOGGER.info("Fetching journals for user: {} with role: {}", userEmail, role);

        Pageable pageable = PageRequest.of(page, size);

        Page<Journal> journals;

        // ADMIN → can see everything
        if ("ROLE_ADMIN".equals(role)) {
            LOGGER.info("Admin access granted - fetching all journals");
            journals = repo.findAll(pageable);
        }
        // USER → only own journals
        else {
            LOGGER.info("User access - fetching own journals only");
            journals = repo.findByUserIdAndIsDeletedFalse(userEmail, pageable);
        }

        return journals
                .map(
                        x -> mapper.toDTO(x)
                );
    }

    @Override
    public int getJournalStreak(String userEmail) {
        LOGGER.info("Calculating journal streak for user: {}", userEmail);
        List<LocalDate> dates = repo.findDatesByUserIdAndIsDeletedFalse(userEmail);

        if (dates == null || dates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate latestDate = dates.get(0);

        // If the latest entry is older than yesterday, the streak is broken (0)
        if (!latestDate.equals(today) && !latestDate.equals(yesterday)) {
            return 0;
        }

        int streak = 1;
        LocalDate current = latestDate;
        for (int i = 1; i < dates.size(); i++) {
            LocalDate next = dates.get(i);
            if (next.equals(current.minusDays(1))) {
                streak++;
                current = next;
            } else if (next.equals(current)) {
                // Ignore duplicates on the same day if they exist
            } else {
                break;
            }
        }
        return streak;
    }

    @Override
    public ReflectionSummaryDTO getReflectionSummary(String userEmail, String range, String startDateStr, String endDateStr) {
        LOGGER.info("Fetching reflection summary for user: {} with range: {}, startDate: {}, endDate: {}", userEmail, range, startDateStr, endDateStr);

        LocalDate startDate = null;
        LocalDate endDate = null;

        if (startDateStr != null && !startDateStr.trim().isEmpty() && endDateStr != null && !endDateStr.trim().isEmpty()) {
            try {
                startDate = LocalDate.parse(startDateStr);
                endDate = LocalDate.parse(endDateStr);
            } catch (Exception e) {
                LOGGER.warn("Failed to parse start/end dates: {} - {}, falling back to range", startDateStr, endDateStr);
            }
        }

        if (startDate == null || endDate == null) {
            endDate = LocalDate.now();
            if ("30d".equalsIgnoreCase(range) || "month".equalsIgnoreCase(range)) {
                startDate = endDate.minusDays(30);
            } else {
                // Default is 7d (week)
                startDate = endDate.minusDays(7);
            }
        }

        List<Journal> journals = repo.findByUserIdAndDateBetweenAndIsDeletedFalseOrderByDateDesc(userEmail, startDate, endDate);

        int totalEntries = journals.size();
        java.util.Map<String, Long> moodFrequency = journals.stream()
                .filter(j -> j.getFeeling() != null)
                .collect(Collectors.groupingBy(j -> j.getFeeling().toLowerCase(), Collectors.counting()));

        String dominantMood = "N/A";
        long maxCount = 0;
        for (java.util.Map.Entry<String, Long> entry : moodFrequency.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                dominantMood = entry.getKey();
            }
        }

        List<String> gratitudeList = journals.stream()
                .filter(j -> j.getGratitude() != null)
                .flatMap(j -> j.getGratitude().stream())
                .filter(g -> g != null && !g.trim().isEmpty())
                .collect(Collectors.toList());

        // Completed goals in range (updated in range and marked DONE)
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        List<Goal> completedGoals = goalRepo.findByUserIdAndStatusAndUpdatedAtBetween(userEmail, GoalStatus.DONE, startDateTime, endDateTime);

        // Active goals (IN_PROGRESS or NOT_STARTED)
        List<Goal> inProgressGoals = goalRepo.findByUserIdAndStatus(userEmail, GoalStatus.IN_PROGRESS);
        List<Goal> notStartedGoals = goalRepo.findByUserIdAndStatus(userEmail, GoalStatus.NOT_STARTED);

        java.util.List<Goal> activeGoals = new java.util.ArrayList<>();
        activeGoals.addAll(inProgressGoals);
        activeGoals.addAll(notStartedGoals);

        List<GoalDTO> completedGoalDTOs = completedGoals.stream().map(mapper::toGoalDTO).collect(Collectors.toList());
        List<GoalDTO> activeGoalDTOs = activeGoals.stream().map(mapper::toGoalDTO).collect(Collectors.toList());

        return new ReflectionSummaryDTO(
                startDate,
                endDate,
                totalEntries,
                dominantMood,
                moodFrequency,
                gratitudeList,
                completedGoalDTOs,
                activeGoalDTOs
        );
    }
}
















