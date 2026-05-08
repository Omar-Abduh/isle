package com.isle.habit;

import com.isle.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Nightly maintenance tasks that run at 03:00 UTC.
 *
 * <p>Each step is isolated in its own try/catch so a failure in one step does not
 * prevent the remaining steps from running.
 *
 * <p>IMPORTANT: The top-level scheduler method is intentionally NOT @Transactional.
 * PostgreSQL forbids REFRESH MATERIALIZED VIEW CONCURRENTLY inside a transaction
 * block, so the MV refresh is executed via raw JDBC with auto-commit = true.
 * Subsequent write steps each carry their own transaction boundary.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    public void nightlyMaintenance() {
        log.info("Starting nightly maintenance");
        refreshStreakMv();
        reconcileStreaks();
        purgeExpiredTokens();
        log.info("Nightly maintenance complete");
    }

    /**
     * Refreshes the streak materialized view.
     *
     * <p>REFRESH MATERIALIZED VIEW CONCURRENTLY cannot run inside a transaction
     * block (PostgreSQL limitation). We therefore acquire a raw JDBC connection,
     * set auto-commit = true, and execute the statement directly — bypassing
     * Spring's transaction infrastructure entirely for this one call.
     */
    private void refreshStreakMv() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            conn.setAutoCommit(true);
            stmt.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY habit_tracker.streak_history_mv");
            log.info("Streak materialized view refreshed");
        } catch (Exception e) {
            log.error("Failed to refresh streak materialized view — streak data may be stale", e);
        }
    }

    /**
     * Reconciles current_streak and longest_streak on every non-deleted habit
     * using a single bulk UPDATE driven by the just-refreshed materialized view.
     *
     * <p>This replaces the previous approach of loading all habits into memory
     * (habitRepository.findAll()), which was an OOM risk at scale.
     *
     * <p>Logic:
     * <ul>
     *   <li>Take the most recent streak island from the MV for each habit.</li>
     *   <li>If its end date is today or yesterday, the streak is still active —
     *       set current_streak = streak_length.</li>
     *   <li>Otherwise the streak is broken — set current_streak = 0.</li>
     *   <li>longest_streak is always the running maximum (never decreases).</li>
     * </ul>
     */
    @Transactional
    public void reconcileStreaks() {
        try {
            // Step 1: update habits that have at least one entry in the MV.
            int updated = jdbcTemplate.update("""
                UPDATE habit_tracker.habits h
                SET
                    current_streak = CASE
                        WHEN mv.streak_end >= CURRENT_DATE - 1 THEN mv.streak_length::int
                        ELSE 0
                    END,
                    longest_streak = GREATEST(h.longest_streak, mv.streak_length::int)
                FROM (
                    SELECT DISTINCT ON (habit_id)
                           habit_id,
                           streak_end,
                           streak_length
                    FROM   habit_tracker.streak_history_mv
                    ORDER  BY habit_id, streak_end DESC
                ) mv
                WHERE h.id = mv.habit_id
                  AND h.deleted_at IS NULL
                """);

            // Step 2: zero out any habit whose streak counter is positive but has
            // no active streak in the MV (e.g. due to prior data corruption).
            jdbcTemplate.update("""
                UPDATE habit_tracker.habits h
                SET    current_streak = 0
                WHERE  h.deleted_at IS NULL
                  AND  h.current_streak > 0
                  AND  NOT EXISTS (
                      SELECT 1
                      FROM   habit_tracker.streak_history_mv mv
                      WHERE  mv.habit_id = h.id
                        AND  mv.streak_end >= CURRENT_DATE - 1
                  )
                """);

            log.info("Streak reconciliation complete — {} habits updated in step 1", updated);
        } catch (Exception e) {
            log.error("Streak reconciliation failed", e);
        }
    }

    @Transactional
    public void purgeExpiredTokens() {
        try {
            refreshTokenRepository.deleteExpiredAndRevoked();
            log.info("Expired refresh tokens purged");
        } catch (Exception e) {
            log.error("Token purge failed", e);
        }
    }
}
