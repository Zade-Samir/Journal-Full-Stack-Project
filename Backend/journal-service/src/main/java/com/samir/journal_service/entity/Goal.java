package com.samir.journal_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "goals",
        indexes = {
                @Index(name = "idx_goal_user_id", columnList = "userId"),
                @Index(name = "idx_goal_status", columnList = "status"),
                @Index(name = "idx_goal_type", columnList = "type")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status = GoalStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType type = GoalType.SHORT_TERM;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
