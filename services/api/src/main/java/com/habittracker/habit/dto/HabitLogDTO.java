package com.habittracker.habit.dto;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
public record HabitLogDTO(UUID id, LocalDate logDate, boolean completed, Instant loggedAt) {}
