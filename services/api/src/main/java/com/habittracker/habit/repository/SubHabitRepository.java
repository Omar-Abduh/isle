package com.habittracker.habit.repository;

import com.habittracker.habit.model.SubHabit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubHabitRepository extends JpaRepository<SubHabit, UUID> {
    List<SubHabit> findByParentIdOrderBySortOrderAsc(UUID parentId);
    Optional<SubHabit> findByIdAndParentId(UUID id, UUID parentId);
    int countByParentId(UUID parentId);
}
