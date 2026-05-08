package com.habittracker.auth.dto;
public record AuthResponse(String accessToken, String refreshToken, UserDTO user) {}
