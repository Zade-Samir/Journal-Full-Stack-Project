package com.samir.journal_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(
        name = "journal",
        indexes = {
                @Index(name = "idx_user_id", columnList = "userId"),
                @Index(name = "idx_user_date", columnList = "userId,date"),
                @Index(name = "idx_is_deleted", columnList = "is_deleted"),
                @Index(name = "idx_date_desc", columnList = "date")
        }
)
@Data
@org.hibernate.annotations.Where(clause = "is_deleted = false")
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private LocalDate date;
    private String whatDidIDo;
    private String bestMoment;
    private String worstMoment;
    private String whatILearned;

    @ElementCollection
    private List<String> gratitude;
    @ElementCollection
    private List<String> shortTermGoal;
    @ElementCollection
    private List<String> longTermGoal;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "journal_goal",
            joinColumns = @JoinColumn(name = "journal_id"),
            inverseJoinColumns = @JoinColumn(name = "goal_id"),
            indexes = {
                    @Index(name = "idx_jg_journal", columnList = "journal_id"),
                    @Index(name = "idx_jg_goal", columnList = "goal_id")
            }
    )
    private List<Goal> goals = new java.util.ArrayList<>();

    private String whatIDoForGoal;
    private String feeling;
    private String feelingNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}














