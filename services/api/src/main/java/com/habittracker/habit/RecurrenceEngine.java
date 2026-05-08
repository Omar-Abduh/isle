package com.habittracker.habit;

import com.habittracker.habit.model.Habit;
import com.habittracker.habit.repository.HabitRepository;
import net.fortuna.ical4j.model.Recur;
import net.fortuna.ical4j.model.parameter.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class RecurrenceEngine {

    private final HabitRepository habitRepository;

    public RecurrenceEngine(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    /**
     * Returns all active (non-archived) habits for a user that are due on the given date.
     */
    public List<Habit> getDueHabits(UUID userId, LocalDate date) {
        return habitRepository.findActiveByUserId(userId)
            .stream()
            .filter(h -> isDueOnDate(h.getRrule(), date))
            .toList();
    }

    /**
     * Returns {@code true} if the given RRULE string produces an occurrence on {@code date}.
     *
     * <p>Previous implementation used {@code seed == periodStart == periodEnd}, creating
     * a zero-width window. Some ical4j versions and rule types (e.g. FREQ=MONTHLY) would
     * not reliably generate an occurrence within an empty range.
     *
     * <p>Fix: use {@code date - 1 day} as the seed so the recurrence series phases
     * correctly regardless of rule type, and check a half-open {@code [date, date+1)}
     * window to capture exactly one day.
     */
    public boolean isDueOnDate(String rrule, LocalDate date) {
        try {
            Recur recur = new Recur(rrule);
            // Seed one day before ensures the series phases correctly for any frequency
            // (daily, weekly, monthly, etc.) without relying on the target date itself
            // being the anchor point.
            net.fortuna.ical4j.model.Date seed       = toIcalDate(date.minusDays(1));
            net.fortuna.ical4j.model.Date rangeStart = toIcalDate(date);
            net.fortuna.ical4j.model.Date rangeEnd   = toIcalDate(date.plusDays(1)); // exclusive end
            var dates = recur.getDates(seed, rangeStart, rangeEnd, Value.DATE);
            return !dates.isEmpty();
        } catch (Exception e) {
            // Malformed RRULE — treat as not due
            return false;
        }
    }

    private net.fortuna.ical4j.model.Date toIcalDate(LocalDate d) {
        return new net.fortuna.ical4j.model.Date(
            java.util.Date.from(d.atStartOfDay(ZoneOffset.UTC).toInstant())
        );
    }
}
