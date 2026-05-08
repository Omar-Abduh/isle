-- Streak history materialized view
-- Computes contiguous streaks using the "gaps and islands" pattern.
-- REFRESH MATERIALIZED VIEW CONCURRENTLY requires the unique index below.

CREATE MATERIALIZED VIEW streak_history_mv AS
WITH ordered AS (
    SELECT habit_id, log_date,
           ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY log_date) AS rn
    FROM habit_tracker.habit_logs
    WHERE completed = TRUE
),
islands AS (
    SELECT habit_id, log_date,
           (log_date - CAST(rn AS INT)) AS island_id
    FROM ordered
)
SELECT habit_id,
       MIN(log_date) AS streak_start,
       MAX(log_date) AS streak_end,
       COUNT(*)      AS streak_length
FROM islands
GROUP BY habit_id, island_id
ORDER BY habit_id, streak_start DESC;

-- Required for REFRESH CONCURRENTLY (must be on unique columns)
CREATE UNIQUE INDEX idx_streak_mv_unique
    ON streak_history_mv (habit_id, streak_start, streak_end);
