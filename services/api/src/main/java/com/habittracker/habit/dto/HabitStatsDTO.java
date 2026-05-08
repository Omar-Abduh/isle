package com.habittracker.habit.dto;
public record HabitStatsDTO(
    int currentStreak, int longestStreak,
    long totalCompletions, double completionRate30Days
) {}
