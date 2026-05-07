package com.habittracker.auth.dto;
import java.util.UUID;
public record UserDTO(UUID id, String email, String displayName, String timezone) {}
