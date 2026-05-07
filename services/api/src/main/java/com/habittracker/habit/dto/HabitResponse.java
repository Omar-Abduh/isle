package com.habittracker.habit.dto;
import com.habittracker.habit.model.HabitType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record HabitResponse(
    UUID id, String name, String description,
    HabitType habitType, String rrule,
    int currentStreak, int longestStreak, boolean archived,
    List<SubHabitDTO> subHabits, Instant createdAt
) {}
