package com.isle.habit.dto;
import com.isle.habit.model.HabitType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record HabitResponse(
    UUID id, String name, String description,
    HabitType habitType, String rrule,
    int currentStreak, int longestStreak, boolean archived,
    boolean completedToday, List<SubHabitDTO> subHabits, Instant createdAt
) {}
