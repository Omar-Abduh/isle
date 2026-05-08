-- seed.sql
-- Automatically picks up the first user in the database to link the seeded habits

DO $$
DECLARE
    uid UUID;
    h1 UUID := '11111111-1111-1111-1111-111111111111';
    h2 UUID := '22222222-2222-2222-2222-222222222222';
    h3 UUID := '33333333-3333-3333-3333-333333333333';
    h4 UUID := '44444444-4444-4444-4444-444444444444';
    h5 UUID := '55555555-5555-5555-5555-555555555555';
    sh1 UUID := '66666666-6666-6666-6666-666666666666';
    sh2 UUID := '77777777-7777-7777-7777-777777777777';
    sh3 UUID := '88888888-8888-8888-8888-888888888888';
    i INT;
    log_date DATE;
BEGIN
    -- Get the current user ID
    SELECT id INTO uid FROM habit_tracker.users LIMIT 1;

    IF uid IS NULL THEN
        RAISE EXCEPTION 'No user found in the database. Please login first.';
    END IF;

    -- Insert Habits
    INSERT INTO habit_tracker.habits (id, user_id, name, description, habit_type, rrule, current_streak, longest_streak, created_at, updated_at) VALUES
    (h1, uid, 'Morning Run', 'Run 5km every morning', 'POSITIVE', 'FREQ=DAILY', 7, 7, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    (h2, uid, 'No Social Media', 'Avoid Instagram and TikTok', 'NEGATIVE', 'FREQ=DAILY', 7, 7, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    (h3, uid, 'Morning Routine', 'Start the day right', 'COMPOSITE', 'FREQ=DAILY', 7, 7, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    (h4, uid, 'Gym Session', 'Lift weights', 'POSITIVE', 'FREQ=WEEKLY;BYDAY=MO,WE,FR', 3, 3, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP),
    (h5, uid, 'Review Budget', 'Check finances', 'POSITIVE', 'FREQ=MONTHLY;BYMONTHDAY=1', 1, 1, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Sub Habits
    INSERT INTO habit_tracker.sub_habits (id, parent_id, name, sort_order) VALUES
    (sh1, h3, 'Make Bed', 0),
    (sh2, h3, 'Read', 1),
    (sh3, h3, 'Stretch', 2)
    ON CONFLICT (id) DO NOTHING;

    -- Insert logs for the past 7 days (May 1 to May 7, assuming today is May 8)
    -- We'll dynamically compute the past 7 days based on CURRENT_DATE
    FOR i IN 1..7 LOOP
        log_date := CURRENT_DATE - i;
        
        -- Daily Positive & Negative
        INSERT INTO habit_tracker.habit_logs (habit_id, log_date, completed, logged_at) VALUES 
        (h1, log_date, true, CURRENT_TIMESTAMP),
        (h2, log_date, true, CURRENT_TIMESTAMP);
        
        -- Composite Sub-habits
        INSERT INTO habit_tracker.habit_logs (habit_id, sub_habit_id, log_date, completed, logged_at) VALUES 
        (h3, sh1, log_date, true, CURRENT_TIMESTAMP),
        (h3, sh2, log_date, true, CURRENT_TIMESTAMP),
        (h3, sh3, log_date, true, CURRENT_TIMESTAMP);
        
        -- Composite Parent Log
        INSERT INTO habit_tracker.habit_logs (habit_id, log_date, completed, logged_at) VALUES 
        (h3, log_date, true, CURRENT_TIMESTAMP);
        
        -- Gym Session (MWF) - roughly 3 days a week
        IF EXTRACT(DOW FROM log_date) IN (1, 3, 5) THEN
            INSERT INTO habit_tracker.habit_logs (habit_id, log_date, completed, logged_at) VALUES 
            (h4, log_date, true, CURRENT_TIMESTAMP);
        END IF;

        -- Review Budget (1st of month)
        IF EXTRACT(DAY FROM log_date) = 1 THEN
            INSERT INTO habit_tracker.habit_logs (habit_id, log_date, completed, logged_at) VALUES 
            (h5, log_date, true, CURRENT_TIMESTAMP);
        END IF;
    END LOOP;
END $$;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW habit_tracker.streak_history_mv;
