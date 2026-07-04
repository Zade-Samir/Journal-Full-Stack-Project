package com.example.journal_service.entity;

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

    private String whatIDoForGoal;
    private String feeling;
    private String feelingNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}














