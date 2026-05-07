package com.habittracker.habit.dto;
import com.habittracker.habit.model.HabitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record HabitRequest(
    @NotBlank @Size(max = 120) String name,
    @Size(max = 500) String description,
    @NotNull HabitType habitType,
    @NotBlank String rrule
) {}
