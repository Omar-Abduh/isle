package com.isle.auth.dto;
import java.time.Instant;
import java.util.UUID;
public record UserDTO(
    UUID id,
    String email,
    String displayName,
    String timezone,
    String pictureUrl,
    Instant joinedAt
) {}
