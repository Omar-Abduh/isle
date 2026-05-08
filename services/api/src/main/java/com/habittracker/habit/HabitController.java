package com.habittracker.habit;

import com.habittracker.habit.dto.*;
import com.habittracker.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Validated
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    // ── Habit CRUD ──────────────────────────────────────────────────────────

    @GetMapping("/habits")
    public ResponseEntity<PageResponse<HabitResponse>> listHabits(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 100);
        UUID userId = UUID.fromString(jwt.getSubject());
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(habitService.listHabits(userId, pageable));
    }

    @PostMapping("/habits")
    public ResponseEntity<PageResponse<HabitResponse>> createHabit(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody HabitRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.createHabit(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(PageResponse.single(response));
    }

    @PutMapping("/habits/{id}")
    public ResponseEntity<PageResponse<HabitResponse>> updateHabit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody HabitRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.updateHabit(id, userId, req);
        return ResponseEntity.ok(PageResponse.single(response));
    }

    @DeleteMapping("/habits/{id}")
    public ResponseEntity<Void> archiveHabit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        habitService.archiveHabit(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ── Check-in / Completion Log ────────────────────────────────────────────

    @PostMapping("/logs")
    public ResponseEntity<PageResponse<HabitResponse>> logCompletion(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody LogRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.logCompletion(req.habitId(), userId, req);
        return ResponseEntity.ok(PageResponse.single(response));
    }

    @GetMapping("/habits/{id}/logs")
    public ResponseEntity<PageResponse<HabitLogDTO>> getHabitHistory(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "30") int size) {
        // Cap page size — previously uncapped unlike listHabits, allowing
        // unbounded result sets that could OOM the server.
        size = Math.min(size, 100);
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(habitService.getHistory(id, userId, page, size));
    }

    // ── Statistics ───────────────────────────────────────────────────────────

    @GetMapping("/habits/{id}/stats")
    public ResponseEntity<PageResponse<HabitStatsDTO>> getStats(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitStatsDTO stats = habitService.getStats(id, userId);
        return ResponseEntity.ok(PageResponse.single(stats));
    }
}
