package com.isle.habit.dto;
import com.isle.habit.model.HabitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
public record HabitRequest(
    @NotBlank @Size(max = 120) String name,
    @Size(max = 500) String description,
    @NotNull HabitType habitType,
    @NotBlank String rrule,
    List<@NotBlank @Size(max = 80) String> subHabits
) {}
