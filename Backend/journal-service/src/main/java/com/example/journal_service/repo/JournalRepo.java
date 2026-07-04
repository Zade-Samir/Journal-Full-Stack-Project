package com.example.journal_service.repo;

import com.example.journal_service.entity.Journal;
import com.example.journal_service.Dto.MoodCountDTO;
import com.example.journal_service.Dto.DailyMoodDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JournalRepo extends JpaRepository<Journal, Long> {

//    List<Journal> findByUserIdAndIsDeletedFalseOrderByDateDesc(String userId);

    Page<Journal> findByUserIdAndIsDeletedFalse(String userId, Pageable pageable);

    Optional<Journal> findByUserIdAndDateAndIsDeletedFalse(String userId, LocalDate today);

    @Query("SELECT new com.example.journal_service.Dto.MoodCountDTO(j.feeling, COUNT(j)) " +
           "FROM Journal j " +
           "WHERE j.userId = :userId AND j.date >= :startDate " +
           "GROUP BY j.feeling")
    List<MoodCountDTO> countFeelingsByUserIdAndDateAfter(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate
    );

    @Query("SELECT new com.example.journal_service.Dto.DailyMoodDTO(j.date, j.feeling) " +
           "FROM Journal j " +
           "WHERE j.userId = :userId AND j.date >= :startDate " +
           "ORDER BY j.date ASC")
    List<DailyMoodDTO> findDailyFeelingsByUserIdAndDateAfter(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate
    );

    @Query("SELECT DISTINCT j.date FROM Journal j " +
           "WHERE j.userId = :userId AND j.isDeleted = false " +
           "ORDER BY j.date DESC")
    List<LocalDate> findDatesByUserIdAndIsDeletedFalse(@Param("userId") String userId);

    @Query("SELECT j FROM Journal j JOIN j.goals g WHERE g.id = :goalId AND j.userId = :userId AND j.isDeleted = false ORDER BY j.date DESC")
    List<Journal> findJournalsByGoalIdAndUserId(@Param("goalId") Long goalId, @Param("userId") String userId);

    List<Journal> findByUserIdAndDateBetweenAndIsDeletedFalseOrderByDateDesc(String userId, LocalDate startDate, LocalDate endDate);
}
