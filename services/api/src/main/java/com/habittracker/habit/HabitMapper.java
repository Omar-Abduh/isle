package com.habittracker.habit;

import com.habittracker.habit.dto.HabitResponse;
import com.habittracker.habit.dto.SubHabitDTO;
import com.habittracker.habit.model.Habit;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class HabitMapper {

    public HabitResponse toResponse(Habit habit) {
        List<SubHabitDTO> subHabitDTOs = habit.getSubHabits().stream()
            .map(s -> new SubHabitDTO(s.getId(), s.getName(), s.getSortOrder()))
            .toList();

        return new HabitResponse(
            habit.getId(),
            habit.getName(),
            habit.getDescription(),
            habit.getHabitType(),
            habit.getRrule(),
            habit.getCurrentStreak(),
            habit.getLongestStreak(),
            habit.isArchived(),
            subHabitDTOs,
            habit.getCreatedAt()
        );
    }

    public List<HabitResponse> toResponseList(List<Habit> habits) {
        return habits.stream().map(this::toResponse).toList();
    }
}
