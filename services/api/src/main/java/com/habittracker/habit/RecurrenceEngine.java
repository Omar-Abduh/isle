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
     * Returns true if the given RRULE string matches the given date.
     * Uses ical4j's Recur to evaluate the rule.
     */
    public boolean isDueOnDate(String rrule, LocalDate date) {
        try {
            Recur recur = new Recur(rrule);
            // Use a wide window, then check if the specific date appears
            net.fortuna.ical4j.model.Date icalDate = toIcalDate(date);
            // getDates returns all recurrence instances in [periodStart, periodEnd]
            // We use the same date as seed, periodStart, and periodEnd to get a single-day window
            var dates = recur.getDates(icalDate, icalDate, icalDate, Value.DATE);
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

