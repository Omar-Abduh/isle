package com.habittracker.habit;

import com.habittracker.habit.dto.*;
import com.habittracker.habit.model.*;
import com.habittracker.habit.repository.*;
import com.habittracker.shared.dto.PageResponse;
import com.habittracker.shared.exception.ClockDriftException;
import com.habittracker.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    /** Maximum number of days in the past a client may backfill a log entry for. */
    private static final int MAX_BACKFILL_DAYS = 7;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public PageResponse<HabitResponse> listHabits(UUID userId, Pageable pageable, String timezone) {
        var page = habitRepository.findByUserIdAndArchivedFalse(userId, pageable);
        return PageResponse.of(
            habitMapper.toResponseList(page.getContent(), timezone),
            pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()
        );
    }

    public HabitResponse createHabit(UUID userId, HabitRequest req, String timezone) {
        var habit = new Habit();
        habit.setUserId(userId);
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        habit = habitRepository.save(habit);
        replaceSubHabits(habit, req);
        return habitMapper.toResponse(habitRepository.save(habit), timezone);
    }

    public HabitResponse updateHabit(UUID id, UUID userId, HabitRequest req, String timezone) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + id));
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        replaceSubHabits(habit, req);
        return habitMapper.toResponse(habitRepository.save(habit), timezone);
    }

    public void archiveHabit(UUID id, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + id));
        habit.setArchived(true);
        habitRepository.save(habit);
    }

    // ── Completion Logging ────────────────────────────────────────────────────

    public HabitResponse logCompletion(UUID habitId, UUID userId, LogRequest req, String timezone) {
        validateTimestamp(req.loggedAt());
        validateLogDate(req.date(), timezone);

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
            updateStreakFastPath(habit, req.date(), parentComplete, timezone);
        } else {
            upsertParentLog(habitId, req.date(), req.completed(), req.loggedAt());
            updateStreakFastPath(habit, req.date(), req.completed(), timezone);
        }

        return habitMapper.toResponse(habitRepository.save(habit), timezone);
    }

    /**
     * Returns paginated log history for a habit.
     *
     * <p>Previously this loaded all logs into memory and paginated in Java — a
     * serious problem for habits with long histories. Pagination is now pushed
     * down to the database.
     */
    @Transactional(readOnly = true)
    public PageResponse<HabitLogDTO> getHistory(UUID habitId, UUID userId, int page, int size) {
        habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + habitId));

        var pageable = PageRequest.of(page, size, Sort.by("logDate").descending());
        var logPage = habitLogRepository.findPagedByHabitId(habitId, pageable);

        var dtos = logPage.getContent().stream()
            .map(l -> new HabitLogDTO(l.getId(), l.getLogDate(), l.isCompleted(), l.getLoggedAt()))
            .toList();

        return PageResponse.of(dtos, page, size, logPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public HabitStatsDTO getStats(UUID habitId, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found: " + habitId));

        List<LocalDate> allDates = habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId);
        long totalCompletions = allDates.size();

        LocalDate thirtyDaysAgo = LocalDate.now(ZoneOffset.UTC).minusDays(30);
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

    @Transactional(readOnly = true)
    public List<WeeklyStatDTO> getWeeklyStats(UUID userId, String timezone) {
        LocalDate today = LocalDate.now(ZoneId.of(timezone));
        LocalDate sevenDaysAgo = today.minusDays(6);
        
        // Find all active habits for the user to join against logs
        List<Habit> habits = habitRepository.findActiveByUserId(userId);
        List<UUID> habitIds = habits.stream().map(Habit::getId).toList();
        
        if (habitIds.isEmpty()) {
            return Collections.emptyList();
        }

        // We fetch completed logs for these habits in the last 7 days
        // Assuming habitLogRepository has a method, but since we don't, we can just fetch the dates
        // A better approach is to use a repository query, but for simplicity we can just iterate.
        // Let's create a map of date -> count
        Map<LocalDate, Integer> counts = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            counts.put(today.minusDays(i), 0);
        }

        for (UUID habitId : habitIds) {
            List<LocalDate> dates = habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId);
            for (LocalDate d : dates) {
                if (!d.isBefore(sevenDaysAgo) && !d.isAfter(today)) {
                    counts.put(d, counts.get(d) + 1);
                }
            }
        }

        List<WeeklyStatDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            result.add(new WeeklyStatDTO(d.toString(), counts.get(d)));
        }
        return result;
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Fast-path streak update on check-in.
     *
     * <p>Applies only when {@code date} is today or yesterday (UTC) and the log
     * is a completion. All other cases are deferred to the nightly reconciliation
     * which has access to the full history.
     *
     * <p>Rationale for not resetting on {@code completed = false}: an uncheck
     * cannot reliably determine the true streak without a full scan.  Nightly
     * reconciliation corrects any drift within 24 hours.
     */
    private void updateStreakFastPath(Habit habit, LocalDate date, boolean completed, String timezone) {
        LocalDate today     = LocalDate.now(ZoneId.of(timezone));
        LocalDate yesterday = today.minusDays(1);

        // Only apply the fast path for present-day or previous-day entries.
        // Older back-fills require a full recalculation — nightly maintenance handles those.
        if (!date.equals(today) && !date.equals(yesterday)) {
            return;
        }

        // An uncheck cannot reliably update the streak without reading the full history.
        // Leave it to the nightly reconciliation rather than risk corrupting the counter.
        if (!completed) {
            return;
        }

        LocalDate prevDay = date.minusDays(1);
        boolean prevDayLogged = habitLogRepository.existsCompletedParentLog(habit.getId(), prevDay);

        if (prevDayLogged) {
            habit.setCurrentStreak(habit.getCurrentStreak() + 1);
        } else {
            habit.setCurrentStreak(1); // new streak starts today
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
     * Anti-cheat: rejects timestamps more than 60 seconds in the future
     * or more than 24 hours in the past.
     */
    private void validateTimestamp(Instant clientTimestamp) {
        if (clientTimestamp == null) return;
        Instant now = Instant.now();
        if (clientTimestamp.isAfter(now.plusSeconds(60))) {
            throw new ClockDriftException("Timestamp is in the future");
        }
        if (clientTimestamp.isBefore(now.minus(Duration.ofHours(24)))) {
            throw new ClockDriftException("Timestamp desync exceeds 24 hours");
        }
    }

    /**
     * Validates the log date:
     * <ul>
     *   <li>Future dates are never allowed.</li>
     *   <li>Dates older than {@value #MAX_BACKFILL_DAYS} days are rejected to
     *       prevent arbitrary back-fill that would corrupt streak fast-paths.</li>
     * </ul>
     */
    private void validateLogDate(LocalDate date, String timezone) {
        LocalDate today = LocalDate.now(ZoneId.of(timezone));
        if (date.isAfter(today)) {
            throw new ClockDriftException("Log date cannot be in the future");
        }
        if (date.isBefore(today.minusDays(MAX_BACKFILL_DAYS))) {
            throw new ClockDriftException(
                "Log date is too far in the past (max backfill: " + MAX_BACKFILL_DAYS + " days)"
            );
        }
    }
}
