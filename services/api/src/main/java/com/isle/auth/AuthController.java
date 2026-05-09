package com.isle.auth;

import com.isle.auth.dto.*;
import com.isle.auth.repository.RefreshTokenRepository;
import com.isle.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenRepository refreshTokenRepository;

    @PostMapping("/exchange")
    public ResponseEntity<PageResponse<AuthResponse>> exchange(@Valid @RequestBody AuthExchangeRequest req) {
        AuthResponse auth = authService.exchange(req.code(), req.codeVerifier(), req.redirectUri());
        return ResponseEntity.ok(PageResponse.single(auth));
    }

    @PostMapping("/refresh")
    public ResponseEntity<PageResponse<RefreshResponse>> refresh(@Valid @RequestBody RefreshRequest req) {
        RefreshResponse tokens = authService.refresh(req.refreshToken());
        return ResponseEntity.ok(PageResponse.single(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt) {
        refreshTokenRepository.revokeAllForUser(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.noContent().build();
    }
}
