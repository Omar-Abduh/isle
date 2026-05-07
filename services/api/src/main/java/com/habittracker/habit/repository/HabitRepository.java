package com.habittracker.habit.repository;

import com.habittracker.habit.model.Habit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {
    Page<Habit> findByUserId(UUID userId, Pageable pageable);
    Page<Habit> findByUserIdAndArchivedFalse(UUID userId, Pageable pageable);
    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);

    // @SQLRestriction on Habit handles deleted_at IS NULL; archived=false comes from the query
    @Query("SELECT h FROM Habit h WHERE h.userId = :userId AND h.archived = false")
    List<Habit> findActiveByUserId(UUID userId);
}
