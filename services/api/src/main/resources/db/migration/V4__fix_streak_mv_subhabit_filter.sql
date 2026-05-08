-- V4: Fix streak_history_mv to exclude sub-habit log rows.
--
-- BUG in V2: The materialized view joined ALL habit_logs rows, including rows
-- where sub_habit_id IS NOT NULL (individual sub-task completions for COMPOSITE
-- habits). This caused COMPOSITE habit streaks to be inflated because each
-- sub-task completion was counted as a separate streak entry.
--
-- Fix: add WHERE sub_habit_id IS NULL so only parent-level completion rows
-- (the ones that represent the habit itself being "done for the day") contribute
-- to streak islands.
--
-- We cannot ALTER a materialized view in place — drop and recreate.

DROP MATERIALIZED VIEW IF EXISTS habit_tracker.streak_history_mv;

CREATE MATERIALIZED VIEW habit_tracker.streak_history_mv AS
WITH ordered AS (
    SELECT habit_id,
           log_date,
           ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY log_date) AS rn
    FROM   habit_tracker.habit_logs
    WHERE  completed     = TRUE
      AND  sub_habit_id IS NULL   -- parent-level completions only
),
islands AS (
    SELECT habit_id,
           log_date,
           (log_date - CAST(rn AS INT)) AS island_id
    FROM   ordered
)
SELECT habit_id,
       MIN(log_date) AS streak_start,
       MAX(log_date) AS streak_end,
       COUNT(*)      AS streak_length
FROM   islands
GROUP  BY habit_id, island_id
ORDER  BY habit_id, streak_start DESC;

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_streak_mv_unique
    ON habit_tracker.streak_history_mv (habit_id, streak_start, streak_end);
