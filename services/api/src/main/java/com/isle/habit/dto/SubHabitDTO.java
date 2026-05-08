package com.isle.habit.dto;
import java.util.UUID;
public record SubHabitDTO(UUID id, String name, short sortOrder, boolean completedToday) {}
