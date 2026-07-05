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
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_user_date", columnList = "user_id,date"),
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

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "what_did_i_do", columnDefinition = "TEXT")
    private String whatDidIDo;

    @Column(name = "best_moment")
    private String bestMoment;

    @Column(name = "worst_moment")
    private String worstMoment;

    @Column(name = "what_i_learned", columnDefinition = "TEXT")
    private String whatILearned;

    @ElementCollection
    @CollectionTable(name = "journal_gratitude", joinColumns = @JoinColumn(name = "journal_id"))
    @Column(name = "gratitude")
    private List<String> gratitude;

    @ElementCollection
    @CollectionTable(name = "journal_short_term_goal", joinColumns = @JoinColumn(name = "journal_id"))
    @Column(name = "short_term_goal")
    private List<String> shortTermGoal;

    @ElementCollection
    @CollectionTable(name = "journal_long_term_goal", joinColumns = @JoinColumn(name = "journal_id"))
    @Column(name = "long_term_goal")
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

    @Column(name = "what_i_do_for_goal")
    private String whatIDoForGoal;

    @Column(name = "feeling")
    private String feeling;

    @Column(name = "feeling_note")
    private String feelingNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}














