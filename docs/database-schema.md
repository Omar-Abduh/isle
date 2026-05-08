<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# Database Schema

The persistence layer is managed by PostgreSQL, using strict foreign key constraints and `UUID` primary keys.

```mermaid
erDiagram
    USERS ||--o{ HABITS : creates
    USERS {
        uuid id PK
        string google_id "Unique"
        string email
        string display_name
        string timezone
    }

    HABITS ||--o{ SUB_HABITS : contains
    HABITS ||--o{ HABIT_LOGS : logs
    HABITS {
        uuid id PK
        uuid user_id FK
        string name
        string habit_type "POSITIVE, NEGATIVE, COMPOSITE"
        string rrule "e.g., FREQ=DAILY"
        int current_streak
        int longest_streak
    }

    SUB_HABITS ||--o{ HABIT_LOGS : logs
    SUB_HABITS {
        uuid id PK
        uuid parent_id FK
        string name
        int sort_order
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        uuid sub_habit_id FK "Nullable"
        date log_date
        boolean completed
        timestamp logged_at
    }
```

## Tables

- **USERS**: User accounts with timezone and OAuth information
- **HABITS**: Habit definitions with recurrence rules and streak tracking
- **SUB_HABITS**: Sub-tasks within composite habits
- **HABIT_LOGS**: Historical logs of habit completions
