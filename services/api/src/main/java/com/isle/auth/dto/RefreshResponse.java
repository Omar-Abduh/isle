package com.isle.auth.dto;
public record RefreshResponse(String accessToken, String refreshToken, UserDTO user) {}
