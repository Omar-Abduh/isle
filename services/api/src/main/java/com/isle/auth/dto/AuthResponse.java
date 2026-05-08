package com.isle.auth.dto;
public record AuthResponse(String accessToken, String refreshToken, UserDTO user) {}
