package com.habittracker.habit;

import com.habittracker.habit.model.Habit;
import com.habittracker.habit.repository.HabitRepository;
import net.fortuna.ical4j.model.Recur;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Date;
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
            Recur<?> recur = new Recur<>(rrule);
            Date seed   = toDate(date.minusDays(1));
            Date target = toDate(date);
            Date after  = toDate(date.plusDays(1));
            return !recur.getDates(seed, target, after).isEmpty();
        } catch (Exception e) {
            // Malformed RRULE — treat as not due
            return false;
        }
    }

    private Date toDate(LocalDate d) {
        return Date.from(d.atStartOfDay(ZoneOffset.UTC).toInstant());
    }
}
