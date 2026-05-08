package com.habittracker.habit;

import com.habittracker.habit.repository.HabitLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class StreakCalculator {

    private final HabitLogRepository habitLogRepository;

    public StreakCalculator(HabitLogRepository habitLogRepository) {
        this.habitLogRepository = habitLogRepository;
    }

    /**
     * Full recalculation from DB — used for nightly reconciliation and stats.
     * Assumes dates are sorted descending (most recent first).
     */
    public int calculateCurrentStreak(UUID habitId) {
        List<LocalDate> dates = habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId);
        if (dates.isEmpty()) return 0;

        // A streak is only active if the most recent log is today or yesterday
        LocalDate mostRecent = dates.get(0);
        LocalDate today = LocalDate.now();
        if (mostRecent.isBefore(today.minusDays(1))) {
            return 0; // streak is broken — last log was more than 1 day ago
        }

        int streak = 1;
        LocalDate expected = mostRecent.minusDays(1);

        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
