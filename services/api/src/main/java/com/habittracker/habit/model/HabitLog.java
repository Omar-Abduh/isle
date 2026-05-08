package com.habittracker.habit.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "habit_logs", schema = "habit_tracker")
@Getter @Setter @NoArgsConstructor
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "habit_id", nullable = false)
    private UUID habitId;

    @Column(name = "sub_habit_id")
    private UUID subHabitId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private boolean completed = true;

    /**
     * Use @CreationTimestamp so Hibernate sets this from the actual DB-write
     * time rather than from Java object construction (which would produce
     * incorrect timestamps when Hibernate creates proxy objects).
     *
     * <p>loggedAt can be overwritten explicitly (e.g. from the client's
     * LogRequest.loggedAt) before the entity is persisted — @CreationTimestamp
     * only applies when the field is still null at flush time.
     */
    @CreationTimestamp
    @Column(name = "logged_at", nullable = false)
    private Instant loggedAt;

    public HabitLog(UUID habitId, UUID subHabitId, LocalDate logDate) {
        this.habitId    = habitId;
        this.subHabitId = subHabitId;
        this.logDate    = logDate;
    }
}
