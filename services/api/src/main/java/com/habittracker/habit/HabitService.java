package com.habittracker.habit;

import com.habittracker.habit.dto.*;
import com.habittracker.habit.model.*;
import com.habittracker.habit.repository.*;
import com.habittracker.shared.dto.PageResponse;
import com.habittracker.shared.exception.ClockDriftException;
import com.habittracker.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final SubHabitRepository subHabitRepository;
    private final HabitMapper habitMapper;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public PageResponse<HabitResponse> listHabits(UUID userId, Pageable pageable) {
        var page = habitRepository.findByUserIdAndArchivedFalse(userId, pageable);
        return PageResponse.of(
            habitMapper.toResponseList(page.getContent()),
            pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()
        );
    }

    public HabitResponse createHabit(UUID userId, HabitRequest req) {
        var habit = new Habit();
        habit.setUserId(userId);
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        habit = habitRepository.save(habit);
        replaceSubHabits(habit, req);
        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public HabitResponse updateHabit(UUID id, UUID userId, HabitRequest req) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + id));
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        replaceSubHabits(habit, req);
        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public void archiveHabit(UUID id, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + id));
        habit.setArchived(true);
        habitRepository.save(habit);
    }

    // ── Completion Logging ────────────────────────────────────────────────────

    public HabitResponse logCompletion(UUID habitId, UUID userId, LogRequest req) {
        validateTimestamp(req.loggedAt());

        var habit = habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + habitId));

        if (habit.getHabitType() == HabitType.COMPOSITE) {
            if (req.subHabitId() == null) {
                throw new ResourceNotFoundException("Composite habits must be checked off one sub-task at a time");
            }
            subHabitRepository.findByIdAndParentId(req.subHabitId(), habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-task not found: " + req.subHabitId()));
            logSubHabitCompletion(habitId, req);
            boolean parentComplete = isParentComplete(habitId, req.date());
            upsertParentLog(habitId, req.date(), parentComplete, req.loggedAt());
            updateStreakFastPath(habit, req.date(), parentComplete);
        } else {
            upsertParentLog(habitId, req.date(), req.completed(), req.loggedAt());
            updateStreakFastPath(habit, req.date(), req.completed());
        }

        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public PageResponse<HabitLogDTO> getHistory(UUID habitId, UUID userId, int page, int size) {
        habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + habitId));
        var logs = habitLogRepository.findByHabitIdOrderByLogDateDesc(habitId);
        var paged = logs.stream()
            .skip((long) page * size)
            .limit(size)
            .map(l -> new HabitLogDTO(l.getId(), l.getLogDate(), l.isCompleted(), l.getLoggedAt()))
            .toList();
        return PageResponse.of(paged, page, size, logs.size());
    }

    public HabitStatsDTO getStats(UUID habitId, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + habitId));

        List<LocalDate> allDates = habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId);
        long totalCompletions = allDates.size();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long completionsIn30Days = allDates.stream()
            .filter(d -> !d.isBefore(thirtyDaysAgo))
            .count();
        double completionRate = (completionsIn30Days / 30.0) * 100;

        return new HabitStatsDTO(
            habit.getCurrentStreak(),
            habit.getLongestStreak(),
            totalCompletions,
            Math.round(completionRate * 10.0) / 10.0
        );
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Fast-path streak update on check-in.
     * Avoids a full DB scan — nightly reconciliation corrects any drift.
     */
    private void updateStreakFastPath(Habit habit, LocalDate date, boolean completed) {
        LocalDate yesterday = date.minusDays(1);
        boolean prevDayLogged = habitLogRepository.existsCompletedParentLog(habit.getId(), yesterday);

        if (completed && prevDayLogged) {
            habit.setCurrentStreak(habit.getCurrentStreak() + 1);
        } else if (completed) {
            // New streak starts (or today is the first completion)
            habit.setCurrentStreak(1);
        } else {
            habit.setCurrentStreak(0);
        }
        if (habit.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(habit.getCurrentStreak());
        }
    }

    private boolean isParentComplete(UUID parentId, LocalDate date) {
        int total = subHabitRepository.countByParentId(parentId);
        int completed = habitLogRepository.countCompletedSubHabits(parentId, date);
        return total > 0 && completed == total;
    }

    private void logSubHabitCompletion(UUID habitId, LogRequest req) {
        var logEntry = habitLogRepository
            .findByHabitIdAndSubHabitIdAndLogDate(habitId, req.subHabitId(), req.date())
            .orElse(new HabitLog(habitId, req.subHabitId(), req.date()));
        logEntry.setCompleted(req.completed());
        logEntry.setLoggedAt(req.loggedAt());
        habitLogRepository.save(logEntry);
    }

    private void upsertParentLog(UUID habitId, LocalDate date, boolean completed, Instant loggedAt) {
        var parentLog = habitLogRepository.findParentLog(habitId, date)
            .orElse(new HabitLog(habitId, null, date));
        parentLog.setCompleted(completed);
        parentLog.setLoggedAt(loggedAt);
        habitLogRepository.save(parentLog);
    }

    private void replaceSubHabits(Habit habit, HabitRequest req) {
        habit.getSubHabits().clear();

        if (req.habitType() != HabitType.COMPOSITE || req.subHabits() == null) {
            return;
        }

        short sortOrder = 0;
        for (String name : req.subHabits()) {
            String trimmed = name == null ? "" : name.trim();
            if (trimmed.isBlank()) continue;

            var subHabit = new SubHabit();
            subHabit.setParentId(habit.getId());
            subHabit.setName(trimmed);
            subHabit.setSortOrder(sortOrder++);
            habit.getSubHabits().add(subHabit);
        }
    }

    /**
     * Anti-cheat: rejects timestamps more than 60s in the future
     * or more than 24h in the past.
     */
    private void validateTimestamp(Instant clientTimestamp) {
        if (clientTimestamp == null) return;
        Instant now = Instant.now();
        if (clientTimestamp.isAfter(now.plusSeconds(60))) {
            throw new ClockDriftException("Timestamp is in the future");
        }
        if (Duration.between(clientTimestamp, now).abs().toHours() > 24) {
            throw new ClockDriftException("Timestamp desync exceeds 24 hours");
        }
    }
}
