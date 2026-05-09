<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# Application Logic

## Recurrence Engine (RRULE)

Instead of relying on crons, the backend uses iCal `RRULE` strings to calculate whether a habit is "due" on a given client-local date.

**Example RRULEs:**
- `FREQ=DAILY` — Daily habit
- `FREQ=WEEKLY;BYDAY=MO,WE,FR` — Habits on Monday, Wednesday, Friday
- `FREQ=MONTHLY` — Monthly habit

## Streak Calculation

Streaks are strictly mathematically derived from the continuous intersection of "due dates" and "logged dates". If a user misses a due date, the `current_streak` falls to 0.

## Timezone Awareness

The backend **never** relies on UTC system time to judge if a habit was completed "today". All requests from the frontend inject `X-Timezone`, shifting the boundaries of "today" so streaks behave exactly as the user expects, regardless of geography.

This ensures your streak will never break just because you traveled.
