package com.isle.unit;

import com.isle.habit.StreakCalculator;
import com.isle.habit.repository.HabitLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StreakCalculatorTest {

    @Mock HabitLogRepository habitLogRepository;
    @InjectMocks StreakCalculator streakCalculator;

    @Test
    void calculateCurrentStreak_consecutiveDays_returnsCorrectStreak() {
        UUID habitId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        when(habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId))
            .thenReturn(List.of(today, today.minusDays(1), today.minusDays(2)));

        assertThat(streakCalculator.calculateCurrentStreak(habitId)).isEqualTo(3);
    }

    @Test
    void calculateCurrentStreak_withGap_streakBreaks() {
        UUID habitId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        when(habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId))
            .thenReturn(List.of(today, today.minusDays(2)));  // gap on day 1

        assertThat(streakCalculator.calculateCurrentStreak(habitId)).isEqualTo(1);
    }

    @Test
    void calculateCurrentStreak_empty_returnsZero() {
        UUID habitId = UUID.randomUUID();
        when(habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId))
            .thenReturn(List.of());

        assertThat(streakCalculator.calculateCurrentStreak(habitId)).isEqualTo(0);
    }

    @Test
    void calculateCurrentStreak_lastLogMoreThanOneDayAgo_returnsZero() {
        UUID habitId = UUID.randomUUID();
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);
        when(habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId))
            .thenReturn(List.of(threeDaysAgo, threeDaysAgo.minusDays(1)));

        // Streak is broken since most recent log is > 1 day ago
        assertThat(streakCalculator.calculateCurrentStreak(habitId)).isEqualTo(0);
    }
}
