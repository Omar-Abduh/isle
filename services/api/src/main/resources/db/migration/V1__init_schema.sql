CREATE SCHEMA IF NOT EXISTS habit_tracker;
SET search_path TO habit_tracker;

CREATE TYPE habit_type AS ENUM ('POSITIVE', 'NEGATIVE', 'COMPOSITE');

CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_sub   VARCHAR(255) UNIQUE NOT NULL,
    email        VARCHAR(320) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    timezone     VARCHAR(60) NOT NULL DEFAULT 'UTC',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ,
    deleted_at   TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE habits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(500),
    habit_type      habit_type NOT NULL DEFAULT 'POSITIVE',
    rrule           VARCHAR(255) NOT NULL,
    current_streak  INT NOT NULL DEFAULT 0,
    longest_streak  INT NOT NULL DEFAULT 0,
    archived        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE sub_habits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    name        VARCHAR(80) NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE habit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id     UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    sub_habit_id UUID REFERENCES sub_habits(id) ON DELETE CASCADE,
    log_date     DATE NOT NULL,
    completed    BOOLEAN NOT NULL DEFAULT TRUE,
    logged_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Two partial indexes to handle nullable sub_habit_id correctly (UNIQUE constraint on NULLs)
CREATE UNIQUE INDEX idx_logs_regular_unique
    ON habit_logs(habit_id, log_date) WHERE sub_habit_id IS NULL;
CREATE UNIQUE INDEX idx_logs_subhabit_unique
    ON habit_logs(habit_id, sub_habit_id, log_date) WHERE sub_habit_id IS NOT NULL;

-- Performance indexes
CREATE INDEX idx_habits_user ON habits(user_id) WHERE archived = FALSE;
CREATE INDEX idx_logs_habit_date ON habit_logs(habit_id, log_date DESC);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id) WHERE revoked = FALSE;
CREATE INDEX idx_users_google ON users(google_sub);
CREATE INDEX idx_sub_habits_parent ON sub_habits(parent_id);
