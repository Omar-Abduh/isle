package com.habittracker.habit.dto;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
public record LogRequest(
    @NotNull UUID habitId,
    UUID subHabitId,
    @NotNull LocalDate date,
    @NotNull Boolean completed,
    @NotNull Instant loggedAt
) {}
