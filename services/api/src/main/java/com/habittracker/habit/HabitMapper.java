package com.habittracker.habit;

import com.habittracker.habit.dto.HabitResponse;
import com.habittracker.habit.dto.SubHabitDTO;
import com.habittracker.habit.model.Habit;
import com.habittracker.habit.repository.HabitLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class HabitMapper {

    private final HabitLogRepository habitLogRepository;

    public HabitResponse toResponse(Habit habit) {
        LocalDate today = LocalDate.now();
        List<SubHabitDTO> subHabitDTOs = habit.getSubHabits().stream()
            .map(s -> new SubHabitDTO(
                s.getId(),
                s.getName(),
                s.getSortOrder(),
                habitLogRepository
                    .findByHabitIdAndSubHabitIdAndLogDate(habit.getId(), s.getId(), today)
                    .map(log -> log.isCompleted())
                    .orElse(false)
            ))
            .toList();
        boolean completedToday = habitLogRepository.existsCompletedParentLog(habit.getId(), today);

        return new HabitResponse(
            habit.getId(),
            habit.getName(),
            habit.getDescription(),
            habit.getHabitType(),
            habit.getRrule(),
            habit.getCurrentStreak(),
            habit.getLongestStreak(),
            habit.isArchived(),
            completedToday,
            subHabitDTOs,
            habit.getCreatedAt()
        );
    }

    public List<HabitResponse> toResponseList(List<Habit> habits) {
        return habits.stream().map(this::toResponse).toList();
    }
}
