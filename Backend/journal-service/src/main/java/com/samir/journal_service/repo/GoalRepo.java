package com.samir.journal_service.repo;

import com.samir.journal_service.entity.Goal;
import com.samir.journal_service.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepo extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(String userId);
    List<Goal> findByUserIdAndStatus(String userId, GoalStatus status);

    List<Goal> findByUserIdAndStatusAndUpdatedAtBetween(String userId, GoalStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM journal_goal WHERE goal_id = :goalId", nativeQuery = true)
    void deleteJournalLinksByGoalId(@Param("goalId") Long goalId);
}
