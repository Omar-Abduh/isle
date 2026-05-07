package com.habittracker.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.habittracker.auth.dto.*;
import com.habittracker.auth.model.RefreshToken;
import com.habittracker.auth.model.User;
import com.habittracker.auth.repository.RefreshTokenRepository;
import com.habittracker.auth.repository.UserRepository;
import com.habittracker.shared.exception.ResourceNotFoundException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client-id}")    private String googleClientId;
    @Value("${google.client-secret}") private String googleClientSecret;
    @Value("${google.token-endpoint}") private String googleTokenEndpoint;
    @Value("${jwt.private-key}")     private String jwtPrivateKeyPath;
    @Value("${jwt.access-expiry-minutes:15}") private int accessExpiryMinutes;
    @Value("${jwt.refresh-expiry-days:30}")   private int refreshExpiryDays;

    public AuthResponse exchange(String code, String codeVerifier) {
        Map<String, Object> googleTokens = exchangeWithGoogle(code, codeVerifier);
        String idToken = (String) googleTokens.get("id_token");

        Map<String, Object> claims = decodeIdTokenClaims(idToken);
        String googleSub   = (String) claims.get("sub");
        String email       = (String) claims.get("email");
        String name        = (String) claims.get("name");

        User user = userRepository.findByGoogleSub(googleSub).orElseGet(() -> {
            User u = new User();
            u.setGoogleSub(googleSub);
            u.setEmail(email);
            u.setDisplayName(name);
            return userRepository.save(u);
        });

        String accessToken = issueAccessJwt(user);
        String rawRefreshToken = generateOpaqueToken();
        storeRefreshToken(user.getId(), rawRefreshToken);

        log.info("User authenticated: {}", user.getId());
        return new AuthResponse(accessToken, rawRefreshToken, toUserDTO(user));
    }

    public RefreshResponse refresh(String rawRefreshToken) {
        String hash = sha256Hex(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.revokeAllForUser(stored.getUserId());
            throw new ResourceNotFoundException("Refresh token expired or revoked");
        }

        User user = userRepository.findById(stored.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Single-use rotation: delete old, issue new
        refreshTokenRepository.delete(stored);
        String newAccessToken = issueAccessJwt(user);
        String newRawRefreshToken = generateOpaqueToken();
        storeRefreshToken(user.getId(), newRawRefreshToken);

        log.info("Token rotated for user: {}", user.getId());
        return new RefreshResponse(newAccessToken, newRawRefreshToken);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeWithGoogle(String code, String codeVerifier) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        var body = new LinkedMultiValueMap<String, String>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("code_verifier", codeVerifier);
        body.add("grant_type", "authorization_code");
        body.add("redirect_uri", ""); // PKCE flow — redirect_uri is in the initial request
        var response = restTemplate.exchange(
            googleTokenEndpoint, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> decodeIdTokenClaims(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return objectMapper.readValue(payload, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode id_token", e);
        }
    }

    private String issueAccessJwt(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(accessExpiryMinutes, ChronoUnit.MINUTES)))
            .signWith(loadPrivateKey())
            .compact();
    }

    private RSAPrivateKey loadPrivateKey() {
        try {
            String pem = java.nio.file.Files.readString(java.nio.file.Path.of(jwtPrivateKeyPath))
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(pem);
            return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new RuntimeException("Failed to load JWT private key", e);
        }
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void storeRefreshToken(UUID userId, String rawToken) {
        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setTokenHash(sha256Hex(rawToken));
        rt.setExpiresAt(Instant.now().plus(refreshExpiryDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 failed", e);
        }
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getDisplayName(), user.getTimezone());
    }
}
