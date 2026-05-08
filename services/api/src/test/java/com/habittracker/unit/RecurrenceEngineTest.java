package com.habittracker.unit;

import com.habittracker.habit.RecurrenceEngine;
import com.habittracker.habit.repository.HabitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class RecurrenceEngineTest {

    @Mock HabitRepository habitRepository;
    @InjectMocks RecurrenceEngine engine;

    @Test
    void isDueOnDate_dailyRule_alwaysTrue() {
        assertThat(engine.isDueOnDate("FREQ=DAILY", LocalDate.now())).isTrue();
    }

    @Test
    void isDueOnDate_weeklyMonday_trueOnMonday() {
        LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);
        assertThat(engine.isDueOnDate("FREQ=WEEKLY;BYDAY=MO", monday)).isTrue();
    }

    @Test
    void isDueOnDate_weeklyMonday_falseOnSunday() {
        LocalDate sunday = LocalDate.now().with(DayOfWeek.SUNDAY);
        assertThat(engine.isDueOnDate("FREQ=WEEKLY;BYDAY=MO", sunday)).isFalse();
    }

    @Test
    void isDueOnDate_invalidRule_returnsFalse() {
        assertThat(engine.isDueOnDate("INVALID_RRULE", LocalDate.now())).isFalse();
    }

    @Test
    void isDueOnDate_weekdaysOnly_falseOnWeekend() {
        LocalDate saturday = LocalDate.now().with(DayOfWeek.SATURDAY);
        assertThat(engine.isDueOnDate("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", saturday)).isFalse();
    }

    @Test
    void isDueOnDate_monthlyFirstDay_trueOnFirstOfMonth() {
        // Find the first day of next month to avoid issues with current date
        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        assertThat(engine.isDueOnDate("FREQ=MONTHLY;BYMONTHDAY=1", firstOfMonth)).isTrue();
    }
}
