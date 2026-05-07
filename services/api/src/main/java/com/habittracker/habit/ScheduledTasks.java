package com.habittracker.habit;

import com.habittracker.auth.repository.RefreshTokenRepository;
import com.habittracker.habit.repository.HabitRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final HabitRepository habitRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StreakCalculator streakCalculator;
    private final EntityManager entityManager;

    /**
     * Every night at 3:00 AM UTC:
     * 1. Refresh the streak materialized view (CONCURRENTLY — no read locks)
     * 2. Reconcile current_streak on all habits (drift correction)
     * 3. Clean up expired/revoked refresh tokens
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    @Transactional
    public void nightlyMaintenance() {
        log.info("Starting nightly maintenance");

        // 1. Refresh MV concurrently — non-blocking reads during refresh
        entityManager.createNativeQuery(
            "REFRESH MATERIALIZED VIEW CONCURRENTLY habit_tracker.streak_history_mv"
        ).executeUpdate();
        log.info("Streak materialized view refreshed");

        // 2. Reconcile current_streak against real log data
        var habits = habitRepository.findAll();
        int reconciled = 0;
        for (var habit : habits) {
            int realStreak = streakCalculator.calculateCurrentStreak(habit.getId());
            if (habit.getCurrentStreak() != realStreak) {
                habit.setCurrentStreak(realStreak);
                if (realStreak > habit.getLongestStreak()) {
                    habit.setLongestStreak(realStreak);
                }
                habitRepository.save(habit);
                reconciled++;
            }
        }
        log.info("Streak reconciliation complete. {} habits corrected.", reconciled);

        // 3. Clean expired/revoked tokens
        refreshTokenRepository.deleteExpiredAndRevoked();
        log.info("Expired refresh tokens purged");
    }
}
