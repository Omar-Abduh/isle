package com.habittracker.habit.repository;

import com.habittracker.habit.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    Optional<HabitLog> findByHabitIdAndSubHabitIdAndLogDate(UUID habitId, UUID subHabitId, LocalDate logDate);

    boolean existsByHabitIdAndLogDateAndCompleted(UUID habitId, LocalDate logDate, boolean completed);

    @Query("SELECT hl.logDate FROM HabitLog hl WHERE hl.habitId = :habitId AND hl.completed = true ORDER BY hl.logDate DESC")
    List<LocalDate> findCompletedDatesByHabitIdOrderByDateDesc(UUID habitId);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habitId = :parentHabitId AND hl.subHabitId IS NOT NULL AND hl.logDate = :date AND hl.completed = true")
    int countCompletedSubHabits(UUID parentHabitId, LocalDate date);

    @Query("SELECT hl FROM HabitLog hl WHERE hl.habitId = :habitId ORDER BY hl.logDate DESC")
    List<HabitLog> findByHabitIdOrderByLogDateDesc(UUID habitId);
}
