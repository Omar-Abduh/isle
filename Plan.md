# Isle Habit Tracker — Execution Plan v4.1

**Stack:** Tauri v2 · React · Spring Boot 3.4+ · PostgreSQL 16 · Docker · Nginx · Google OAuth 2.0 PKCE

---

## v4.1 Changelog — What v4.0 Was Missing

| # | Gap in v4.0 | Fixed In |
| --- | --- | --- |
| 1 | UML Class Diagram — completely absent | Phase 0.6 |
| 2 | Entity models (Habit, HabitLog, SubHabit, User, RefreshToken) — mentioned but never coded | Phase 1.3 |
| 3 | Repository interfaces — all absent | Phase 1.4 |
| 4 | All DTOs — absent (AuthExchangeRequest, AuthResponse, HabitRequest, etc.) | Phase 1.5 |
| 5 | HabitController.java — in file tree but never implemented | Phase 2.11 |
| 6 | AuthService.java — referenced but never shown | Phase 2.12 |
| 7 | HabitMapper.java — referenced in HabitService but never defined | Phase 1.6 |
| 8 | MapStruct removed from pom.xml but HabitMapper still used | Phase 2.1 |
| 9 | SubHabitRepository — used in isParentComplete() but never defined | Phase 1.4 |
| 10 | RefreshTokenRepository — never shown | Phase 1.4 |
| 11 | Nightly @Scheduled for streak reconciliation + materialized view refresh | Phase 2.13 |
| 12 | `uuid` crate missing from Cargo.toml (used in get_machine_id() fallback) | Phase 5.1 |
| 13 | useNotifications.ts uses browser Notification API — needs tauri-plugin-notification | Phase 4.6 |
| 14 | types/auth.ts and types/habit.ts — listed but never shown | Phase 4.7 |
| 15 | main.tsx — listed but never shown | Phase 4.8 |
| 16 | UI components (Dashboard, HabitCard, StreakRing, HistoryLog) — listed but never shown | Phase 4.9 |
| 17 | Execution Timeline — removed from v4 | Phase 8 |
| 18 | Environment Variable Manifest — removed from v4 | Appendix B |
| 19 | Testing strategy with actual test code — removed | Phase 7.5 |
| 20 | Architecture enforcement rules table — removed | Phase 1.2 |
| 21 | vite.config.ts, package.json, index.html — listed but never shown | Phase 4.10 |
| 22 | application-test.yml for CI test config — never mentioned | Phase 2.2 |
| 23 | @EnableScheduling annotation missing from main class | Phase 2.0 |

## v4.0 Changelog- Simplification

| v3.2 Component | v4 Decision | Reason |
| --- | --- | --- |
| AWS S3 backups | **REMOVED** | VPS disk + cron is enough |
| Backup sidecar container | **REMOVED** | Host OS cron is simpler |
| Certbot auto-renewal container | **REMOVED** | Host OS certbot cron is simpler |
| OWASP ZAP scanning | **REMOVED** | Manual review checklist instead |
| `.github/workflows/ci.yml` | **KEPT** | Essential for automated testing |
| `init-letsencrypt.sh` | **REMOVED** | Single manual certbot command |
| `application-prod.yml` | **REMOVED** | One `application.yml` with env vars |
| `docker-compose.prod.yml` | **REMOVED** | Single `docker-compose.yml` |
| `backup.sh` | **REMOVED** | Inline cron command |
| Groups feature tables | **REMOVED** | Not in core requirements |
| All other security + architecture | **KEPT** | Zero compromise on security |

**Golden Rule:** If it's security, auth, streak logic, or a core feature — it stays. If it's cloud-native DevOps theater — it goes.

## v3.2 Changelog -Bugs Fixing

| # | Bug | Location | Fix |
| --- | --- | --- | --- |
| 1 | Duplicate `volumes:` keys in docker-compose.prod.yml | Phase 7.2 | Merged into single `volumes:` section |
| 2 | `get_machine_id()` returns placeholder string | Phase 6.4 | Real implementation using `machine-uid` crate |
| 3 | `RRuleParser.isMatch()` — no library, won't compile | Phase 3.2 + Phase 4.1 | Added `ical4j` to pom.xml, real implementation shown |
| 4 | `refreshAccessToken()` imported but never defined | Phase 5.4 | Full `authApi.ts` file defined |
| 5 | Zustand `persist` uses `localStorage`, not Tauri Store | Phase 5.3 | Custom Tauri Store adapter for Zustand persist |
| 6 | `UNIQUE(habit_id, sub_habit_id, log_date)` broken for NULLs | Phase 2.3 | Two partial unique indexes instead |
| 7 | `dtolnay/rust-action@stable` wrong action name | Phase 7.6 | Fixed to `dtolnay/rust-toolchain@stable` |
| 8 | API envelope `success`+`timestamp` claimed fixed but missing | Phase 1.3 | Actually implemented in envelope + PageResponse |
| 9 | `backup.sh` script referenced but never provided | Phase 7.2 | Full script added |
| 10 | `PageResponse<T>` Java Record never defined | Phase 1.3 | Full Record definition with factory method |
| 11 | `ClockDriftException.java` never defined | Phase 3.4 | Full class + GlobalExceptionHandler handler |
| 12 | `exchangeCode()` in authApi.ts missing | Phase 5.4 | Full `authApi.ts` with both functions |
| 13 | `Cargo.toml` never shown | Phase 6.4 | Full Cargo.toml with all plugin deps |
| 14 | `bucket4j-jcache` wrong dependency for Caffeine usage | Phase 4.1 | Replaced with `caffeine` dependency |
| 15 | `@Value RSAPublicKey` — no Spring converter for file path | Phase 4.3 | Explicit PEM loading via `KeyFactory` |
| 16 | `POSTGRES_USER` missing from CI integration test env | Phase 7.6 | Added to CI postgres service |
| 17 | `Bandwidth.simple()` deprecated in Bucket4j 8.x | Phase 4.6 | Updated to builder API |
| 18 | `tauri_plugin_deep_link::register()` wrong v2 API | Phase 6.4 | Fixed to `app.deep_link().register_all()` |

---

## Table of Contents

1. [Phase 0: Infrastructure & Project Scaffolding](about:blank#phase-0)
2. [Phase 1: Data Layer & Entities](about:blank#phase-1)
3. [Phase 2: Backend API (Spring Boot)](about:blank#phase-2)
4. [Phase 3: Recurrence & Streak Engine](about:blank#phase-3)
5. [Phase 4: Frontend (Tauri + React)](about:blank#phase-4)
6. [Phase 5: Desktop Security & Tauri](about:blank#phase-5)
7. [Phase 6: VPS Deployment](about:blank#phase-6)
8. [Phase 7: CI/CD & Testing](about:blank#phase-7)
9. [Phase 8: Execution Timeline](about:blank#phase-8)
10. [Appendix A: Security Checklist Pre-Go-Live](about:blank#appendix-a)
11. [Appendix B: Environment Variable Manifest](about:blank#appendix-b)
12. [Appendix C: Complete File Tree](about:blank#appendix-c)

---

## Phase 0: Infrastructure & Project Scaffolding

### 0.1 Required Toolchain

| Tool | Minimum Version | Install Method |
| --- | --- | --- |
| Rust | >= 1.78 | `rustup` |
| Node.js | >= 20 LTS | `nvm` |
| pnpm | >= 9 | `npm i -g pnpm` |
| Java | >= 21 LTS | `sdkman` |
| Maven | >= 3.9 | `sdkman` |
| Spring Boot | >= 3.4 | Managed by parent pom |
| Docker | >= 26 | Docker Engine |
| psql | >= 16 | `apt install postgresql-client` |

> **Spring Boot 3.4+ is mandatory.** The `logging.structured.format.console: ecs` property is a 3.4+ feature.
> 

### 0.2 Monorepo Folder Structure

```
habit-tracker/
├── apps/
│   └── desktop/
│       ├── src/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── authApi.ts
│       │   │   └── habitApi.ts
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── HabitCard.tsx
│       │   │   ├── StreakRing.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   └── HistoryLog.tsx
│       │   ├── hooks/
│       │   │   ├── useOAuth.ts
│       │   │   ├── useOfflineSync.ts
│       │   │   └── useNotifications.ts
│       │   ├── store/
│       │   │   ├── authStore.ts
│       │   │   ├── habitStore.ts
│       │   │   └── offlineStore.ts
│       │   ├── lib/
│       │   │   ├── stronghold.ts
│       │   │   └── tauriStoreAdapter.ts
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   └── habit.ts
│       │   └── main.tsx
│       ├── src-tauri/
│       │   ├── capabilities/default.json
│       │   ├── src/lib.rs
│       │   ├── Cargo.toml
│       │   └── tauri.conf.json
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
├── services/
│   └── api/
│       ├── src/main/
│       │   ├── java/com/habittracker/
│       │   │   ├── HabitTrackerApplication.java
│       │   │   ├── auth/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── dto/
│       │   │   │   │   ├── AuthExchangeRequest.java
│       │   │   │   │   ├── AuthResponse.java
│       │   │   │   │   ├── RefreshRequest.java
│       │   │   │   │   └── RefreshResponse.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── User.java
│       │   │   │   │   └── RefreshToken.java
│       │   │   │   └── repository/
│       │   │   │       ├── UserRepository.java
│       │   │   │       └── RefreshTokenRepository.java
│       │   │   ├── habit/
│       │   │   │   ├── HabitController.java
│       │   │   │   ├── HabitService.java
│       │   │   │   ├── RecurrenceEngine.java
│       │   │   │   ├── StreakCalculator.java
│       │   │   │   ├── HabitMapper.java
│       │   │   │   ├── ScheduledTasks.java
│       │   │   │   ├── dto/
│       │   │   │   │   ├── HabitRequest.java
│       │   │   │   │   ├── HabitResponse.java
│       │   │   │   │   └── LogRequest.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── Habit.java
│       │   │   │   │   ├── HabitLog.java
│       │   │   │   │   └── SubHabit.java
│       │   │   │   └── repository/
│       │   │   │       ├── HabitRepository.java
│       │   │   │       ├── HabitLogRepository.java
│       │   │   │       └── SubHabitRepository.java
│       │   │   ├── shared/
│       │   │   │   ├── dto/PageResponse.java
│       │   │   │   ├── exception/
│       │   │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   │   └── ClockDriftException.java
│       │   │   │   └── GlobalExceptionHandler.java
│       │   │   └── config/
│       │   │       ├── SecurityConfig.java
│       │   │       └── RateLimitFilter.java
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-test.yml
│       │       └── db/migration/
│       │           ├── V1__init_schema.sql
│       │           └── V2__streak_materialized_view.sql
│       ├── src/test/
│       │   └── java/com/habittracker/
│       │       ├── unit/
│       │       │   ├── StreakCalculatorTest.java
│       │       │   └── RecurrenceEngineTest.java
│       │       └── integration/
│       │           ├── AuthFlowTest.java
│       │           └── HabitApiTest.java
│       ├── pom.xml
│       └── Dockerfile
├── infra/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── success.html
│   └── .env.example
├── .github/
│   └── workflows/ci.yml
└── README.md
```

### 0.3 Environment Variables (.env.example)

```bash
# --- PostgreSQL ---
POSTGRES_DB=habittracker
POSTGRES_USER=ht_user
POSTGRES_PASSWORD=change_me_strong_password

# --- Spring Boot ---
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/habittracker
SPRING_DATASOURCE_USERNAME=ht_user
SPRING_DATASOURCE_PASSWORD=change_me_strong_password
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=30
GOOGLE_CLIENT_ID=<from_google_cloud_console>
GOOGLE_CLIENT_SECRET=<from_google_cloud_console>

# --- Tauri / Frontend ---
VITE_API_BASE_URL=https://your-vps-domain
VITE_GOOGLE_CLIENT_ID=<same_client_id>
VITE_REDIRECT_URI=https://your-vps-domain/success.html
VITE_DEEP_LINK_SCHEME=habittracker
```

### 0.4 Google Cloud Console Setup

1. Create project → **“HabitTracker”**
2. APIs & Services → OAuth consent screen → External → fill app name, support email
3. Credentials → Create OAuth Client ID → **Desktop App** type
4. Authorized redirect URIs:
    - `https://your-vps-domain/success.html`
    - `http://localhost:8888/auth/callback` (dev only)
5. Copy **Client ID** (public) and **Client Secret** (server-side only — never in frontend)
6. Generate RSA-256 keypair for JWT signing:
    
    ```bash
    openssl genrsa -out jwt_private.pem 2048
    openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
    mkdir -p infra/secrets
    mv jwt_private.pem jwt_public.pem infra/secrets/
    chmod 600 infra/secrets/*.pem
    ```
    

### 0.5 OAuth Middleman Page (success.html)

Served directly from VPS Nginx at `/success.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Redirecting to HabitTracker...</title>
  <style>
    body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #ddd;
               border-top-color: #333; border-radius: 50%;
               animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Redirecting you back to the app...</p>
  <p id="fallback" style="display:none;">
    If nothing happens, <a id="manual-link" href="#">click here to open HabitTracker</a>.
  </p>
<script>
  (function() {
    var params = new URLSearchParams(window.location.search);
    var code  = params.get('code');
    var state = params.get('state');
    if (!code || !state) {
      document.body.innerHTML = '<h2>Invalid callback.</h2><p>Return to the app and try again.</p>';
      return;
    }
    var deepLink = 'habittracker://auth/callback?code='
      + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
    document.getElementById('manual-link').href = deepLink;
    setTimeout(function() {
      document.getElementById('fallback').style.display = 'block';
    }, 2000);
    window.location.replace(deepLink);
  })();
</script>
</body>
</html>
```

### 0.6 UML Class Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +UUID id
        +String googleSub
        +String email
        +String displayName
        +String timezone
        +Instant createdAt
        +Instant updatedAt
        +Instant deletedAt
    }

    class RefreshToken {
        +UUID id
        +UUID userId
        +String tokenHash
        +Instant expiresAt
        +boolean revoked
        +Instant createdAt
    }

    class Habit {
        +UUID id
        +UUID userId
        +String name
        +String description
        +HabitType habitType
        +String rrule
        +int currentStreak
        +int longestStreak
        +boolean archived
        +Instant createdAt
        +Instant updatedAt
        +Instant deletedAt
    }

    class SubHabit {
        +UUID id
        +UUID parentId
        +String name
        +short sortOrder
        +Instant createdAt
    }

    class HabitLog {
        +UUID id
        +UUID habitId
        +UUID subHabitId
        +LocalDate logDate
        +boolean completed
        +Instant loggedAt
    }

    class HabitType {
        <<enumeration>>
        POSITIVE
        NEGATIVE
        COMPOSITE
    }

    %% Relationships
    User "1" --> "*" RefreshToken : owns
    User "1" --> "*" Habit : owns
    Habit "1" --> "*" SubHabit : parent
    Habit "1" --> "*" HabitLog : tracks
    SubHabit "0..1" --> "*" HabitLog : tracks
    Habit ..> HabitType : uses

    note for HabitLog "Constraints:<br>- UNIQUE (habitId, logDate) WHERE subHabitId IS NULL<br>- UNIQUE (habitId, subHabitId, logDate) WHERE subHabitId IS NOT NULL<br>- COMPOSITE parent Habit complete ONLY when ALL SubHabits are logged complete."
```

---

## Phase 1: Data Layer & Entities

### 1.1 Database Schema (V1__init_schema.sql)

```sql
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

-- Two partial indexes to handle nullable sub_habit_id correctly
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
```

### 1.2 Streak Materialized View (V2__streak_materialized_view.sql)

```sql
CREATE MATERIALIZED VIEW streak_history_mv AS
WITH ordered AS (
    SELECT habit_id, log_date,
           ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY log_date) AS rn
    FROM habit_tracker.habit_logs
    WHERE completed = TRUE
),
islands AS (
    SELECT habit_id, log_date,
           (log_date - CAST(rn AS INT)) AS island_id
    FROM ordered
)
SELECT habit_id,
       MIN(log_date) AS streak_start,
       MAX(log_date) AS streak_end,
       COUNT(*)      AS streak_length
FROM islands
GROUP BY habit_id, island_id
ORDER BY habit_id, streak_start DESC;

-- Required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_streak_mv_unique
    ON streak_history_mv (habit_id, streak_start, streak_end);
```

### 1.3 Entity Models (JPA)

```java
// auth/model/User.java
package com.habittracker.auth.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "habit_tracker")
@SQLRestriction("deleted_at IS NULL")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "google_sub", nullable = false, unique = true)
    private String googleSub;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false)
    private String timezone = "UTC";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }
}
```

```java
// auth/model/RefreshToken.java
package com.habittracker.auth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens", schema = "habit_tracker")
@Getter @Setter @NoArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
```

```java
// habit/model/Habit.java
package com.habittracker.habit.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "habits", schema = "habit_tracker")
@SQLRestriction("deleted_at IS NULL")
@Getter @Setter @NoArgsConstructor
public class Habit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "habit_type", nullable = false)
    private HabitType habitType = HabitType.POSITIVE;

    @Column(nullable = false, length = 255)
    private String rrule;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(nullable = false)
    private boolean archived = false;

    @OneToMany(mappedBy = "parentId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubHabit> subHabits = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }
}
```

```java
// habit/model/HabitType.java
package com.habittracker.habit.model;

public enum HabitType {
    POSITIVE, NEGATIVE, COMPOSITE
}
```

```java
// habit/model/SubHabit.java
package com.habittracker.habit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sub_habits", schema = "habit_tracker")
@Getter @Setter @NoArgsConstructor
public class SubHabit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parent_id", nullable = false)
    private UUID parentId;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private short sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
```

```java
// habit/model/HabitLog.java
package com.habittracker.habit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "habit_logs", schema = "habit_tracker")
@Getter @Setter @NoArgsConstructor
public class HabitLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "habit_id", nullable = false)
    private UUID habitId;

    @Column(name = "sub_habit_id")
    private UUID subHabitId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private boolean completed = true;

    @Column(name = "logged_at", nullable = false)
    private Instant loggedAt = Instant.now();

    public HabitLog(UUID habitId, UUID subHabitId, LocalDate logDate) {
        this.habitId = habitId;
        this.subHabitId = subHabitId;
        this.logDate = logDate;
    }
}
```

### 1.4 Repository Interfaces

```java
// auth/repository/UserRepository.java
package com.habittracker.auth.repository;

import com.habittracker.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByGoogleSub(String googleSub);
    boolean existsByGoogleSub(String googleSub);
}
```

```java
// auth/repository/RefreshTokenRepository.java
package com.habittracker.auth.repository;

import com.habittracker.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.userId = :userId")
    void revokeAllForUser(UUID userId);

    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < CURRENT_TIMESTAMP OR t.revoked = true")
    void deleteExpiredAndRevoked();
}
```

```java
// habit/repository/HabitRepository.java
package com.habittracker.habit.repository;

import com.habittracker.habit.model.Habit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {
    Page<Habit> findByUserId(UUID userId, Pageable pageable);
    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);
    List<Habit> findActiveByUserId(UUID userId);  // @SQLRestriction handles archived=false + deleted_at IS NULL
}
```

```java
// habit/repository/HabitLogRepository.java
package com.habittracker.habit.repository;

import com.habittracker.habit.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {
    Optional<HabitLog> findByHabitIdAndSubHabitIdAndLogDate(UUID habitId, UUID subHabitId, LocalDate logDate);

    boolean existsByHabitIdAndLogDateAndCompleted(UUID habitId, LocalDate logDate, boolean completed);

    @Query("SELECT hl.logDate FROM HabitLog hl WHERE hl.habitId = :habitId AND hl.completed = true ORDER BY hl.logDate DESC")
    List<LocalDate> findCompletedDatesByHabitIdOrderByDateDesc(UUID habitId);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habitId = :parentHabitId AND hl.subHabitId IS NOT NULL AND hl.logDate = :date AND hl.completed = true")
    int countCompletedSubHabits(UUID parentHabitId, LocalDate date);

    @Query("SELECT hl FROM HabitLog hl WHERE hl.habitId = :habitId ORDER BY hl.logDate DESC")
    List<HabitLog> findByHabitIdOrderByLogDateDesc(UUID habitId);
}
```

```java
// habit/repository/SubHabitRepository.java
package com.habittracker.habit.repository;

import com.habittracker.habit.model.SubHabit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubHabitRepository extends JpaRepository<SubHabit, UUID> {
    List<SubHabit> findByParentIdOrderBySortOrderAsc(UUID parentId);
    int countByParentId(UUID parentId);
}
```

### 1.5 DTOs (Java Records)

```java
// auth/dto/AuthExchangeRequest.java
package com.habittracker.auth.dto;
import jakarta.validation.constraints.NotBlank;
public record AuthExchangeRequest(
    @NotBlank String code,
    @NotBlank String codeVerifier
) {}
```

```java
// auth/dto/AuthResponse.java
package com.habittracker.auth.dto;
public record AuthResponse(
    String accessToken,
    String refreshToken,
    UserDTO user
) {}
```

```java
// auth/dto/UserDTO.java
package com.habittracker.auth.dto;
import java.util.UUID;
public record UserDTO(
    UUID id,
    String email,
    String displayName,
    String timezone
) {}
```

```java
// auth/dto/RefreshRequest.java
package com.habittracker.auth.dto;
import jakarta.validation.constraints.NotBlank;
public record RefreshRequest(@NotBlank String refreshToken) {}
```

```java
// auth/dto/RefreshResponse.java
package com.habittracker.auth.dto;
public record RefreshResponse(String accessToken, String refreshToken) {}
```

```java
// habit/dto/HabitRequest.java
package com.habittracker.habit.dto;
import com.habittracker.habit.model.HabitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record HabitRequest(
    @NotBlank @Size(max = 120) String name,
    @Size(max = 500) String description,
    @NotNull HabitType habitType,
    @NotBlank String rrule
) {}
```

```java
// habit/dto/HabitResponse.java
package com.habittracker.habit.dto;
import com.habittracker.habit.model.HabitType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public record HabitResponse(
    UUID id,
    String name,
    String description,
    HabitType habitType,
    String rrule,
    int currentStreak,
    int longestStreak,
    boolean archived,
    List<SubHabitDTO> subHabits,
    Instant createdAt
) {}
```

```java
// habit/dto/SubHabitDTO.java
package com.habittracker.habit.dto;
import java.util.UUID;
public record SubHabitDTO(UUID id, String name, short sortOrder) {}
```

```java
// habit/dto/LogRequest.java
package com.habittracker.habit.dto;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
public record LogRequest(
    @NotNull UUID habitId,
    UUID subHabitId,
    @NotNull LocalDate date,
    @NotNull Boolean completed,
    @NotNull Instant loggedAt
) {}
```

### 1.6 HabitMapper (Manual — no MapStruct dependency needed)

```java
// habit/HabitMapper.java
package com.habittracker.habit;

import com.habittracker.habit.dto.HabitResponse;
import com.habittracker.habit.dto.SubHabitDTO;
import com.habittracker.habit.model.Habit;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class HabitMapper {

    public HabitResponse toResponse(Habit habit) {
        List<SubHabitDTO> subHabitDTOs = habit.getSubHabits().stream()
            .map(s -> new SubHabitDTO(s.getId(), s.getName(), s.getSortOrder()))
            .toList();

        return new HabitResponse(
            habit.getId(),
            habit.getName(),
            habit.getDescription(),
            habit.getHabitType(),
            habit.getRrule(),
            habit.getCurrentStreak(),
            habit.getLongestStreak(),
            habit.isArchived(),
            subHabitDTOs,
            habit.getCreatedAt()
        );
    }

    public List<HabitResponse> toResponseList(List<Habit> habits) {
        return habits.stream().map(this::toResponse).toList();
    }
}
```

---

## Phase 2: Backend API (Spring Boot)

### 2.0 Main Application Class

```java
// HabitTrackerApplication.java
package com.habittracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling     // Required for @Scheduled on ScheduledTasks
public class HabitTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(HabitTrackerApplication.class, args);
    }
}
```

### 2.1 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
    </parent>
    <groupId>com.habittracker</groupId>
    <artifactId>api</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <!-- Web + Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- Data -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
        <!-- Rate Limiting -->
        <dependency>
            <groupId>com.bucket4j</groupId>
            <artifactId>bucket4j-core</artifactId>
            <version>8.10.1</version>
        </dependency>
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
        </dependency>
        <!-- RRULE Parsing -->
        <dependency>
            <groupId>net.fortuna.ical4j</groupId>
            <artifactId>ical4j</artifactId>
            <version>3.2.14</version>
        </dependency>
        <!-- Utilities -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <!-- Structured Logging -->
        <dependency>
            <groupId>net.logstash.logback</groupId>
            <artifactId>logstash-logback-encoder</artifactId>
            <version>8.0</version>
        </dependency>
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2.2 application.yml

```yaml
server:
port:8080
shutdown: graceful

spring:
datasource:
url: ${SPRING_DATASOURCE_URL}
username: ${SPRING_DATASOURCE_USERNAME}
password: ${SPRING_DATASOURCE_PASSWORD}
hikari:
maximum-pool-size:10
minimum-idle:2
connection-timeout:30000
idle-timeout:600000
max-lifetime:1800000
jpa:
hibernate:
ddl-auto: validate
open-in-view:false
properties:
hibernate:
default_schema: habit_tracker
flyway:
schemas: habit_tracker
locations: classpath:db/migration

jwt:
private-key: ${JWT_PRIVATE_KEY_PATH}
public-key: ${JWT_PUBLIC_KEY_PATH}
access-expiry-minutes: ${JWT_ACCESS_EXPIRY_MINUTES:15}
refresh-expiry-days: ${JWT_REFRESH_EXPIRY_DAYS:30}

google:
client-id: ${GOOGLE_CLIENT_ID}
client-secret: ${GOOGLE_CLIENT_SECRET}
token-endpoint: https://oauth2.googleapis.com/token
jwks-uri: https://www.googleapis.com/oauth2/v3/certs

logging:
structured:
format:
console: ecs
```

**application-test.yml** (for CI/Testcontainers):

```yaml
spring:
datasource:
url: ${SPRING_DATASOURCE_URL:jdbc:tc:postgresql:16:///habittracker_test}
flyway:
schemas: habit_tracker

jwt:
private-key: classpath:test-jwt-private.pem
public-key: classpath:test-jwt-public.pem
access-expiry-minutes:15
refresh-expiry-days:30

google:
client-id: test-client-id
client-secret: test-client-secret
token-endpoint: http://localhost:9999/token
jwks-uri: http://localhost:9999/certs

logging:
structured:
format:
console:off
```

### 2.3 Architecture Enforcement Rules (Non-Negotiable)

| Rule | Consequence of Violation |
| --- | --- |
| Controllers contain ZERO business logic | Only `@Valid`, HTTP mapping, delegate to service |
| Services contain 100% business logic | All streak, recurrence, auth, anti-cheat logic lives here |
| Repositories only query data | No business logic inside `@Query` |
| Entities NEVER returned from API | Always map to DTO via HabitMapper before returning |
| Every feature MUST have unit AND integration tests | No merge without both |
| `ddl-auto: validate` always | Flyway owns schema — Hibernate cannot modify it |
| `current_streak` is the ONLY denormalized column | Intentional fast-path cache, reconciled nightly |

### 2.4 API Response Standard

**Base Path:** `/api/v1/`

```json
// Paginated success
{
  "success": true,
  "timestamp": "2026-05-05T10:30:00.000Z",
  "data": [...],
  "page": 0,
  "size": 20,
  "total": 145,
  "hasMore": true
}

// Error (RFC-7807 ProblemDetail)
{
  "type": "about:blank",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Validation failed",
  "instance": "/api/v1/habits",
  "violations": ["name: must not be blank"]
}
```

```java
// shared/dto/PageResponse.java
package com.habittracker.shared.dto;

import java.time.Instant;
import java.util.List;

public record PageResponse<T>(
    boolean success,
    String timestamp,
    List<T> data,
    int page,
    int size,
    long total,
    boolean hasMore
) {
    public static <T> PageResponse<T> of(List<T> data, int page, int size, long total) {
        boolean hasMore = ((long) page * size + data.size()) < total;
        return new PageResponse<>(true, Instant.now().toString(), data, page, size, total, hasMore);
    }

    public static <T> PageResponse<T> single(T item) {
        return new PageResponse<>(true, Instant.now().toString(), List.of(item), 0, 1, 1, false);
    }
}
```

### 2.5 Exception Classes

```java
// shared/exception/ResourceNotFoundException.java
package com.habittracker.shared.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
```

```java
// shared/exception/ClockDriftException.java
package com.habittracker.shared.exception;
public class ClockDriftException extends RuntimeException {
    public ClockDriftException(String message) { super(message); }
}
```

### 2.6 GlobalExceptionHandler

```java
// shared/GlobalExceptionHandler.java
package com.habittracker.shared;

import com.habittracker.shared.exception.ClockDriftException;
import com.habittracker.shared.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ClockDriftException.class)
    public ProblemDetail handleClockDrift(ClockDriftException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        var pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        pd.setProperty("violations", ex.getBindingResult().getFieldErrors()
            .stream().map(e -> e.getField() + ": " + e.getDefaultMessage()).toList());
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception on {}", req.getRequestURI(), ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }
}
```

### 2.7 Security Configuration

```java
// config/SecurityConfig.java
package com.habittracker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtDecoder jwtDecoder,
                                           RateLimitFilter rateLimitFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(c -> c.configurationSource(corsConfigSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder)))
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("tauri://localhost", "https://tauri.localhost"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-ID"));
        config.setMaxAge(3600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${jwt.public-key}") String publicKeyPath) throws Exception {
        String pem = Files.readString(Path.of(publicKeyPath))
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(pem);
        RSAPublicKey publicKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
            .generatePublic(new X509EncodedKeySpec(decoded));
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }
}
```

### 2.8 Rate Limiting

```java
// config/RateLimitFilter.java
package com.habittracker.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final LoadingCache<String, Bucket> buckets = Caffeine.newBuilder()
        .expireAfterAccess(10, TimeUnit.MINUTES)
        .build(ip -> Bucket.builder()
            .addLimit(Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build())
            .build());

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (!req.getRequestURI().startsWith("/api/v1/auth/")) {
            chain.doFilter(req, res);
            return;
        }
        var bucket = buckets.get(req.getRemoteAddr());
        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            log.warn("Rate limit exceeded for IP: {}", req.getRemoteAddr());
            res.setStatus(429);
            res.setContentType("application/problem+json");
            res.getWriter().write("{\"title\":\"Too Many Requests\",\"status\":429}");
        }
    }
}
```

### 2.9 Token Lifecycle Rules

| Token | Format | Lifetime | Storage | Rotation | Revocation |
| --- | --- | --- | --- | --- | --- |
| **Access Token** | Internal RS256 JWT | 15 min | Zustand in-memory only | N/A | Expires naturally |
| **Refresh Token** | Opaque secure random | 30 days | Stronghold (encrypted disk) | Single-use. New on every refresh. | Logout deletes all user hashes |

### 2.10 Auth Controller

```java
// auth/AuthController.java
package com.habittracker.auth;

import com.habittracker.auth.dto.*;
import com.habittracker.auth.repository.RefreshTokenRepository;
import com.habittracker.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenRepository refreshTokenRepository;

    @PostMapping("/exchange")
    public ResponseEntity<PageResponse<AuthResponse>> exchange(@Valid @RequestBody AuthExchangeRequest req) {
        AuthResponse auth = authService.exchange(req.code(), req.codeVerifier());
        return ResponseEntity.ok(PageResponse.single(auth));
    }

    @PostMapping("/refresh")
    public ResponseEntity<PageResponse<RefreshResponse>> refresh(@Valid @RequestBody RefreshRequest req) {
        RefreshResponse tokens = authService.refresh(req.refreshToken());
        return ResponseEntity.ok(PageResponse.single(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt) {
        refreshTokenRepository.revokeAllForUser(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.noContent().build();
    }
}
```

### 2.11 Habit Controller

```java
// habit/HabitController.java
package com.habittracker.habit;

import com.habittracker.habit.dto.*;
import com.habittracker.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Validated
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    // ── Habit CRUD ──────────────────────────────────────────────────────────

    @GetMapping("/habits")
    public ResponseEntity<PageResponse<HabitResponse>> listHabits(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, 100);
        UUID userId = UUID.fromString(jwt.getSubject());
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(habitService.listHabits(userId, pageable));
    }

    @PostMapping("/habits")
    public ResponseEntity<PageResponse<HabitResponse>> createHabit(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody HabitRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.createHabit(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(PageResponse.single(response));
    }

    @PutMapping("/habits/{id}")
    public ResponseEntity<PageResponse<HabitResponse>> updateHabit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody HabitRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.updateHabit(id, userId, req);
        return ResponseEntity.ok(PageResponse.single(response));
    }

    @DeleteMapping("/habits/{id}")
    public ResponseEntity<Void> archiveHabit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        habitService.archiveHabit(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ── Check-in / Completion Log ────────────────────────────────────────────

    @PostMapping("/logs")
    public ResponseEntity<PageResponse<HabitResponse>> logCompletion(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody LogRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitResponse response = habitService.logCompletion(req.habitId(), userId, req);
        return ResponseEntity.ok(PageResponse.single(response));
    }

    @GetMapping("/habits/{id}/logs")
    public ResponseEntity<PageResponse<HabitLogDTO>> getHabitHistory(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(habitService.getHistory(id, userId, page, size));
    }

    // ── Statistics ───────────────────────────────────────────────────────────

    @GetMapping("/habits/{id}/stats")
    public ResponseEntity<PageResponse<HabitStatsDTO>> getStats(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        HabitStatsDTO stats = habitService.getStats(id, userId);
        return ResponseEntity.ok(PageResponse.single(stats));
    }
}
```

Additional DTOs for controller:

```java
// habit/dto/HabitLogDTO.java
package com.habittracker.habit.dto;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
public record HabitLogDTO(UUID id, LocalDate logDate, boolean completed, Instant loggedAt) {}
```

```java
// habit/dto/HabitStatsDTO.java
package com.habittracker.habit.dto;
public record HabitStatsDTO(
    int currentStreak,
    int longestStreak,
    long totalCompletions,
    double completionRate30Days
) {}
```

### 2.12 Auth Service

```java
// auth/AuthService.java
package com.habittracker.auth;

import com.habittracker.auth.dto.*;
import com.habittracker.auth.model.RefreshToken;
import com.habittracker.auth.model.User;
import com.habittracker.auth.repository.RefreshTokenRepository;
import com.habittracker.auth.repository.UserRepository;
import com.habittracker.shared.exception.ResourceNotFoundException;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client-id}")   private String googleClientId;
    @Value("${google.client-secret}") private String googleClientSecret;
    @Value("${google.token-endpoint}") private String googleTokenEndpoint;
    @Value("${jwt.private-key}")    private String jwtPrivateKeyPath;
    @Value("${jwt.access-expiry-minutes:15}") private int accessExpiryMinutes;
    @Value("${jwt.refresh-expiry-days:30}")   private int refreshExpiryDays;

    public AuthResponse exchange(String code, String codeVerifier) {
        // 1. Exchange code at Google's token endpoint
        Map<String, Object> googleTokens = exchangeWithGoogle(code, codeVerifier);
        String idToken = (String) googleTokens.get("id_token");

        // 2. Decode id_token claims (trusted — just base64 decode, signature already verified by Google)
        Map<String, Object> claims = decodeIdTokenClaims(idToken);
        String googleSub = (String) claims.get("sub");
        String email = (String) claims.get("email");
        String name = (String) claims.get("name");

        // 3. Upsert user
        User user = userRepository.findByGoogleSub(googleSub).orElseGet(() -> {
            User u = new User();
            u.setGoogleSub(googleSub);
            u.setEmail(email);
            u.setDisplayName(name);
            return userRepository.save(u);
        });

        // 4. Issue tokens
        String accessToken = issueAccessJwt(user);
        String rawRefreshToken = generateOpaqueToken();
        storeRefreshToken(user.getId(), rawRefreshToken);

        log.info("User authenticated: {}", user.getId());
        return new AuthResponse(accessToken, rawRefreshToken, toUserDTO(user));
    }

    public RefreshResponse refresh(String rawRefreshToken) {
        String hash = sha256Hex(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.revokeAllForUser(stored.getUserId());
            throw new ResourceNotFoundException("Refresh token expired or revoked");
        }

        User user = userRepository.findById(stored.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Rotate: delete old, issue new
        refreshTokenRepository.delete(stored);
        String newAccessToken = issueAccessJwt(user);
        String newRawRefreshToken = generateOpaqueToken();
        storeRefreshToken(user.getId(), newRawRefreshToken);

        return new RefreshResponse(newAccessToken, newRawRefreshToken);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Map<String, Object> exchangeWithGoogle(String code, String codeVerifier) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        var body = new LinkedMultiValueMap<String, String>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("code_verifier", codeVerifier);
        body.add("grant_type", "authorization_code");
        body.add("redirect_uri", "");
        var response = restTemplate.exchange(googleTokenEndpoint,
            HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> decodeIdTokenClaims(String idToken) {
        String[] parts = idToken.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
        // Parse JSON manually using Spring's built-in support
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(payload, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode id_token", e);
        }
    }

    private String issueAccessJwt(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(accessExpiryMinutes, ChronoUnit.MINUTES)))
            .signWith(loadPrivateKey())
            .compact();
    }

    private RSAPrivateKey loadPrivateKey() {
        try {
            String pem = java.nio.file.Files.readString(java.nio.file.Path.of(jwtPrivateKeyPath))
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(pem);
            return (RSAPrivateKey) java.security.KeyFactory.getInstance("RSA")
                .generatePrivate(new java.security.spec.PKCS8EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new RuntimeException("Failed to load JWT private key", e);
        }
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void storeRefreshToken(UUID userId, String rawToken) {
        RefreshToken rt = new RefreshToken();
        rt.setUserId(userId);
        rt.setTokenHash(sha256Hex(rawToken));
        rt.setExpiresAt(Instant.now().plus(refreshExpiryDays, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 failed", e);
        }
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getDisplayName(), user.getTimezone());
    }
}
```

> **Note:** Add `spring-security-oauth2-jose` and `io.jsonwebtoken:jjwt-*` to pom if not already pulled transitively. The `Jwts.builder()` requires jjwt-api + jjwt-impl.
> 
> 
> Add to pom.xml:
> 
> ```xml
> <dependency>
>   <groupId>io.jsonwebtoken</groupId>
>   <artifactId>jjwt-api</artifactId>
>   <version>0.12.6</version>
> </dependency>
> <dependency>
>   <groupId>io.jsonwebtoken</groupId>
>   <artifactId>jjwt-impl</artifactId>
>   <version>0.12.6</version>
>   <scope>runtime</scope>
> </dependency>
> <dependency>
>   <groupId>io.jsonwebtoken</groupId>
>   <artifactId>jjwt-jackson</artifactId>
>   <version>0.12.6</version>
>   <scope>runtime</scope>
> </dependency>
> ```
> 

### 2.13 Nightly Scheduled Tasks (Streak Reconciliation + MV Refresh)

```java
// habit/ScheduledTasks.java
package com.habittracker.habit;

import com.habittracker.auth.repository.RefreshTokenRepository;
import com.habittracker.habit.repository.HabitLogRepository;
import com.habittracker.habit.repository.HabitRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasks {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StreakCalculator streakCalculator;
    private final EntityManager entityManager;

    /**
     * Every night at 3:00 AM UTC:
     * 1.Refresh the streak materialized view
     * 2. Reconcile current_streak on all habits against the view (drift correction)
     * 3. Clean up expired/revoked refresh tokens
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    @Transactional
    public void nightlyMaintenance() {
        log.info("Starting nightly maintenance");

        // 1. Refresh materialized view (CONCURRENTLY = does not lock reads)
        entityManager.createNativeQuery(
            "REFRESH MATERIALIZED VIEW CONCURRENTLY habit_tracker.streak_history_mv"
        ).executeUpdate();
        log.info("Streak materialized view refreshed");

        // 2. Reconcile current_streak for every active habit
        var habits = habitRepository.findAll();
        int reconciled = 0;
        for (var habit : habits) {
            int realStreak = streakCalculator.calculateCurrentStreak(habit.getId());
            if (habit.getCurrentStreak() != realStreak) {
                habit.setCurrentStreak(realStreak);
                if (realStreak > habit.getLongestStreak()) {
                    habit.setLongestStreak(realStreak);
                }
                habitRepository.save(habit);
                reconciled++;
            }
        }
        log.info("Streak reconciliation complete. {} habits corrected.", reconciled);

        // 3. Clean expired/revoked refresh tokens
        refreshTokenRepository.deleteExpiredAndRevoked();
        log.info("Expired refresh tokens purged");
    }
}
```

---

## Phase 3: Recurrence & Streak Engine

### 3.1 Recurrence Engine

```java
// habit/RecurrenceEngine.java
package com.habittracker.habit;

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

    public List<Habit> getDueHabits(UUID userId, LocalDate date) {
        return habitRepository.findActiveByUserId(userId)
            .stream()
            .filter(h -> isDueOnDate(h.getRrule(), date))
            .toList();
    }

    public boolean isDueOnDate(String rrule, LocalDate date) {
        try {
            Recur<?> recur = new Recur<>(rrule);
            Date seed   = toDate(date.minusDays(1));
            Date target = toDate(date);
            Date after  = toDate(date.plusDays(1));
            return !recur.getDates(seed, target, after).isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private Date toDate(LocalDate d) {
        return Date.from(d.atStartOfDay(ZoneOffset.UTC).toInstant());
    }
}
```

### 3.2 Streak Calculator

```java
// habit/StreakCalculator.java
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

    /** Full recalculation from DB — used for nightly reconciliation. */
    public int calculateCurrentStreak(UUID habitId) {
        List<LocalDate> dates = habitLogRepository.findCompletedDatesByHabitIdOrderByDateDesc(habitId);
        if (dates.isEmpty()) return 0;

        int streak = 1;
        LocalDate expected = dates.get(0).minusDays(1);

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
```

### 3.3 Habit Service (Full Implementation)

```java
// habit/HabitService.java
package com.habittracker.habit;

import com.habittracker.habit.dto.*;
import com.habittracker.habit.model.*;
import com.habittracker.habit.repository.*;
import com.habittracker.shared.dto.PageResponse;
import com.habittracker.shared.exception.ClockDriftException;
import com.habittracker.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final SubHabitRepository subHabitRepository;
    private final HabitMapper habitMapper;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public PageResponse<HabitResponse> listHabits(UUID userId, Pageable pageable) {
        var page = habitRepository.findByUserId(userId, pageable);
        return PageResponse.of(
            habitMapper.toResponseList(page.getContent()),
            pageable.getPageNumber(), pageable.getPageSize(), page.getTotalElements()
        );
    }

    public HabitResponse createHabit(UUID userId, HabitRequest req) {
        var habit = new Habit();
        habit.setUserId(userId);
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public HabitResponse updateHabit(UUID id, UUID userId, HabitRequest req) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        habit.setName(req.name());
        habit.setDescription(req.description());
        habit.setHabitType(req.habitType());
        habit.setRrule(req.rrule());
        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public void archiveHabit(UUID id, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        habit.setArchived(true);
        habitRepository.save(habit);
    }

    // ── Completion Logging ────────────────────────────────────────────────────

    public HabitResponse logCompletion(UUID habitId, UUID userId, LogRequest req) {
        validateTimestamp(req.loggedAt());

        var habit = habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        var logEntry = habitLogRepository
            .findByHabitIdAndSubHabitIdAndLogDate(habitId, req.subHabitId(), req.date())
            .orElse(new HabitLog(habitId, req.subHabitId(), req.date()));

        logEntry.setCompleted(req.completed());
        logEntry.setLoggedAt(req.loggedAt());
        habitLogRepository.save(logEntry);

        // For COMPOSITE habits, only update streak when all sub-habits are complete
        boolean shouldCountCompletion = req.completed();
        if (habit.getHabitType() == HabitType.COMPOSITE) {
            shouldCountCompletion = isParentComplete(habitId, req.date());
        }

        updateStreakFastPath(habit, req.date(), shouldCountCompletion);
        return habitMapper.toResponse(habitRepository.save(habit));
    }

    public PageResponse<HabitLogDTO> getHistory(UUID habitId, UUID userId, int page, int size) {
        habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        var logs = habitLogRepository.findByHabitIdOrderByLogDateDesc(habitId);
        var paged = logs.stream()
            .skip((long) page * size)
            .limit(size)
            .map(l -> new HabitLogDTO(l.getId(), l.getLogDate(), l.isCompleted(), l.getLoggedAt()))
            .toList();
        return PageResponse.of(paged, page, size, logs.size());
    }

    public HabitStatsDTO getStats(UUID habitId, UUID userId) {
        var habit = habitRepository.findByIdAndUserId(habitId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        long totalCompletions = habitLogRepository
            .findCompletedDatesByHabitIdOrderByDateDesc(habitId).size();

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long completionsIn30Days = habitLogRepository
            .findCompletedDatesByHabitIdOrderByDateDesc(habitId)
            .stream().filter(d -> !d.isBefore(thirtyDaysAgo)).count();
        double completionRate = (completionsIn30Days / 30.0) * 100;

        return new HabitStatsDTO(
            habit.getCurrentStreak(),
            habit.getLongestStreak(),
            totalCompletions,
            Math.round(completionRate * 10.0) / 10.0
        );
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private void updateStreakFastPath(Habit habit, LocalDate date, boolean completed) {
        LocalDate yesterday = date.minusDays(1);
        boolean prevDayLogged = habitLogRepository
            .existsByHabitIdAndLogDateAndCompleted(habit.getId(), yesterday, true);

        if (completed && prevDayLogged) {
            habit.setCurrentStreak(habit.getCurrentStreak() + 1);
        } else if (completed) {
            habit.setCurrentStreak(1);
        } else {
            habit.setCurrentStreak(0);
        }
        if (habit.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(habit.getCurrentStreak());
        }
    }

    private boolean isParentComplete(UUID parentId, LocalDate date) {
        int total = subHabitRepository.countByParentId(parentId);
        int completed = habitLogRepository.countCompletedSubHabits(parentId, date);
        return total > 0 && completed == total;
    }

    private void validateTimestamp(Instant clientTimestamp) {
        if (clientTimestamp == null) return;
        Instant now = Instant.now();
        if (clientTimestamp.isAfter(now.plusSeconds(60))) {
            throw new ClockDriftException("Timestamp is in the future");
        }
        if (Duration.between(clientTimestamp, now).abs().toHours() > 24) {
            throw new ClockDriftException("Timestamp desync exceeds 24 hours");
        }
    }
}
```

---

## Phase 4: Frontend (Tauri + React)

### 4.1 Scaffolding

```bash
pnpm create tauri-app desktop --template react-ts
cd desktop
pnpm add @tauri-apps/plugin-deep-link \
         @tauri-apps/plugin-store \
         @tauri-apps/plugin-stronghold \
         @tauri-apps/plugin-shell \
         @tauri-apps/plugin-notification \
         zustand \
         axios
```

### 4.2 Zustand Stores (full — unchanged from v4.0, all correct)

(See v4.0 Phase 4.2 for authStore.ts, habitStore.ts, tauriStoreAdapter.ts, offlineStore.ts — all carry forward unchanged.)

### 4.3 API Layer

(See v4.0 Phase 4.3 for authApi.ts, client.ts, habitApi.ts — carry forward unchanged.)

### 4.4 PKCE OAuth Hook

(See v4.0 Phase 4.4 for useOAuth.ts — carry forward unchanged.)

### 4.5 Offline Sync Hook

(See v4.0 Phase 4.5 for useOfflineSync.ts with exponential backoff — carry forward unchanged.)

### 4.6 Notification Hook (FIXED — uses tauri-plugin-notification)

```tsx
// hooks/useNotifications.ts
import { useEffect } from 'react'
import {
  requestPermission,
  sendNotification,
  isPermissionGranted,
} from '@tauri-apps/plugin-notification'
import { useHabitStore } from '@/store/habitStore'

export function useNotifications() {
  const { habits } = useHabitStore()

  useEffect(() => {
    // Request permission once on mount
    const ensurePermission = async () => {
      const granted = await isPermissionGranted()
      if (!granted) {
        const permission = await requestPermission()
        if (permission !== 'granted') return
      }
    }
    ensurePermission()
  }, [])

  useEffect(() => {
    // Check every minute; fire reminder at 9:00 AM local time
    const interval = setInterval(async () => {
      const now = new Date()
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        const incomplete = habits.filter(h => !h.archived && h.currentStreak === 0)
        if (incomplete.length > 0) {
          const granted = await isPermissionGranted()
          if (granted) {
            sendNotification({
              title: 'HabitTracker',
              body: `You have${incomplete.length} habit${incomplete.length === 1 ? '' : 's'} to complete today!`,
            })
          }
        }
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [habits])
}
```

> Add `tauri-plugin-notification = "2"` to `src-tauri/Cargo.toml` and `"notification:default"` to capabilities.
> 

### 4.7 TypeScript Types

```tsx
// types/auth.ts
export interface UserDTO {
  id: string
  email: string
  displayName: string
  timezone: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}
```

```tsx
// types/habit.ts
export type HabitType = 'POSITIVE' | 'NEGATIVE' | 'COMPOSITE'

export interface SubHabitDTO {
  id: string
  name: string
  sortOrder: number
}

export interface HabitResponse {
  id: string
  name: string
  description?: string
  habitType: HabitType
  rrule: string
  currentStreak: number
  longestStreak: number
  archived: boolean
  subHabits: SubHabitDTO[]
  createdAt: string
}

export interface HabitLogDTO {
  id: string
  logDate: string
  completed: boolean
  loggedAt: string
}

export interface HabitStatsDTO {
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  completionRate30Days: number
}

export interface HabitRequest {
  name: string
  description?: string
  habitType: HabitType
  rrule: string
}

export interface LogRequest {
  habitId: string
  subHabitId?: string
  date: string       // YYYY-MM-DD
  completed: boolean
  loggedAt: string   // ISO 8601
}
```

### 4.8 main.tsx (Application Entry Point)

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```tsx
// App.tsx
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { loadRefreshToken } from './lib/stronghold'
import { refreshAccessToken } from './api/authApi'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import { useOfflineSync } from './hooks/useOfflineSync'
import { useNotifications } from './hooks/useNotifications'

export default function App() {
  const { accessToken, setSession, user } = useAuthStore()
  useOfflineSync()
  useNotifications()

  useEffect(() => {
    // Attempt silent re-auth from Stronghold on startup
    const tryRestore = async () => {
      try {
        const token = await loadRefreshToken()
        if (!token) return
        const newAccessToken = await refreshAccessToken()
        // user will be set during refresh — fetch profile if needed
      } catch {
        // Silent fail — user must login
      }
    }
    if (!accessToken) tryRestore()
  }, [])

  if (!accessToken || !user) return <LoginPage />
  return <Dashboard />
}
```

### 4.9 UI Components (Skeletons — complete with shadcn/ui)

```tsx
// components/LoginPage.tsx
import { useOAuth } from '@/hooks/useOAuth'

export default function LoginPage() {
  const { startLogin } = useOAuth()
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6 p-10 border rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">HabitTracker</h1>
        <p className="text-muted-foreground">Build better habits, day by day.</p>
        <button
          onClick={startLogin}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
```

```tsx
// components/Dashboard.tsx
import { useEffect } from 'react'
import { useHabitStore } from '@/store/habitStore'
import { getHabits } from '@/api/habitApi'
import HabitCard from './HabitCard'

export default function Dashboard() {
  const { habits, setHabits } = useHabitStore()

  useEffect(() => {
    getHabits().then(setHabits).catch(console.error)
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Today's Habits</h2>
      {habits.length === 0 && (
        <p className="text-muted-foreground">No habits yet. Create one to get started.</p>
      )}
      <div className="flex flex-col gap-4">
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </div>
  )
}
```

```tsx
// components/HabitCard.tsx
import type { HabitResponse } from '@/types/habit'
import StreakRing from './StreakRing'
import { logHabitCompletion } from '@/api/habitApi'
import { useHabitStore } from '@/store/habitStore'
import { useOfflineStore } from '@/store/offlineStore'

interface Props { habit: HabitResponse }

export default function HabitCard({ habit }: Props) {
  const { updateStreak } = useHabitStore()
  const { enqueue } = useOfflineStore()

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split('T')[0]
    const loggedAt = new Date().toISOString()

    if (navigator.onLine) {
      try {
        const result = await logHabitCompletion({
          habitId: habit.id,
          date: today,
          completed: true,
          loggedAt,
        })
        updateStreak(habit.id, result.currentStreak)
      } catch {
        enqueue({ habitId: habit.id, date: today, completed: true, loggedAt })
      }
    } else {
      enqueue({ habitId: habit.id, date: today, completed: true, loggedAt })
      updateStreak(habit.id, habit.currentStreak + 1) // optimistic
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm">
      <div className="flex items-center gap-4">
        <StreakRing streak={habit.currentStreak} />
        <div>
          <p className="font-semibold">{habit.name}</p>
          {habit.description && (
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Longest: {habit.longestStreak} days
          </p>
        </div>
      </div>
      <button
        onClick={handleCheckIn}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
      >
        ✓ Done
      </button>
    </div>
  )
}
```

```tsx
// components/StreakRing.tsx
interface Props { streak: number }

export default function StreakRing({ streak }: Props) {
  const size = 52
  const radius = 20
  const circumference = 2 * Math.PI * radius
  // Cap visual fill at 30 days
  const progress = Math.min(streak / 30, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="hsl(var(--muted))" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90${size/2}${size/2})`} />
      </svg>
      <span className="absolute text-xs font-bold">{streak}</span>
    </div>
  )
}
```

```tsx
// components/HistoryLog.tsx
import { useEffect, useState } from 'react'
import { apiClient } from '@/api/client'
import type { HabitLogDTO } from '@/types/habit'

interface Props { habitId: string }

export default function HistoryLog({ habitId }: Props) {
  const [logs, setLogs] = useState<HabitLogDTO[]>([])

  useEffect(() => {
    apiClient.get(`/api/v1/habits/${habitId}/logs?size=30`)
      .then(res => setLogs(res.data.data))
      .catch(console.error)
  }, [habitId])

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Last 30 Days</h3>
      <div className="grid grid-cols-7 gap-1">
        {logs.map(log => (
          <div
            key={log.id}
            title={log.logDate}
            className={`w-7 h-7 rounded-sm${log.completed ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.10 Config Files

```tsx
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_'],
})
```

```json
// index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HabitTracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```json
// package.json
{
  "name": "habittracker-desktop",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-deep-link": "^2",
    "@tauri-apps/plugin-notification": "^2",
    "@tauri-apps/plugin-shell": "^2",
    "@tauri-apps/plugin-store": "^2",
    "@tauri-apps/plugin-stronghold": "^2",
    "axios": "^1.7",
    "react": "^18",
    "react-dom": "^18",
    "zustand": "^4"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^5",
    "vitest": "^1",
    "@testing-library/react": "^14"
  }
}
```

---

## Phase 5: Desktop Security & Tauri

### 5.1 Cargo.toml (FIXED — `uuid` crate added)

```toml
[package]
name = "habittracker"
version = "0.1.0"
edition = "2021"

[lib]
name = "habittracker_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = {version = "2",features = [] }

[dependencies]
tauri                     = {version = "2",features = [] }
tauri-plugin-store        = "2"
tauri-plugin-deep-link    = "2"
tauri-plugin-shell        = "2"
tauri-plugin-stronghold   = "2"
tauri-plugin-notification = "2"
serde                     = {version = "1",features = ["derive"] }
serde_json                = "1"
argon2                    = "0.5"
machine-uid               = "0.5"
uuid                      = {version = "1",features = ["v4"] }   # FIXED — was missing
```

### 5.2 tauri.conf.json (unchanged from v4.0)

```json
{
  "identifier": "com.habittracker.app",
  "plugins": {
    "deep-link": {
      "mobile": [],
      "desktop": { "schemes": ["habittracker"] }
    }
  },
  "bundle": {
    "macOS": {
      "infoPlist": {
        "CFBundleURLTypes": [{
          "CFBundleURLSchemes": ["habittracker"],
          "CFBundleURLName": "com.habittracker.app"
        }]
      }
    }
  }
}
```

### 5.3 Capabilities (FIXED — notification permission added)

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Minimum required permissions — principle of least privilege",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "deep-link:default",
    "store:default",
    "notification:default",
    "stronghold:allow-initialize",
    "stronghold:allow-create-client",
    "stronghold:allow-load-client",
    "stronghold:allow-get-store",
    "stronghold:allow-store-insert",
    "stronghold:allow-store-get",
    "stronghold:allow-store-remove",
    "stronghold:allow-save"
  ]
}
```

### 5.4 lib.rs (unchanged from v4.0 — correct)

```rust
use tauri::Manager;
use tauri_plugin_stronghold::Builder as StrongholdBuilder;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            StrongholdBuilder::new(|password| {
                use argon2::Argon2;
                let machine_id = get_machine_id();
                let salt = machine_id.as_bytes();
                let argon2 = Argon2::default();
                let mut key = vec![0u8; 32];
                argon2
                    .hash_password_into(password.as_bytes(), salt, &mut key)
                    .expect("Argon2 key derivation failed");
                key
            })
            .build(),
        )
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_machine_id() -> String {
    machine_uid::get().unwrap_or_else(|_| uuid::Uuid::new_v4().to_string())
}
```

### 5.5 Stronghold Wrapper (unchanged from v4.0 — correct)

(See v4.0 Phase 5.5 for stronghold.ts — carries forward unchanged.)

### 5.6 Local Storage Segregation Rules

| Storage | Use For | NEVER Use For |
| --- | --- | --- |
| Tauri Store | Offline queue, user prefs | Secrets, tokens |
| Tauri Stronghold | Refresh token ONLY | Large data |
| Zustand (memory) | Access token, habit list, UI state | Persistent data |

---

## Phase 6: VPS Deployment

### 6.1 Dockerfile (unchanged from v4.0)

```docker
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]
```

### 6.2 docker-compose.yml

```yaml
version:"3.9"

networks:
internal:
driver: bridge

volumes:
db_data:

services:

db:
image: postgres:16-alpine
restart: unless-stopped
env_file: .env
volumes:
- db_data:/var/lib/postgresql/data
networks:[internal]
healthcheck:
test:["CMD-SHELL","pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
interval: 10s
retries:5
    # Port 5432 intentionally NOT exposed to host

backend:
build:
context: ../services/api
dockerfile: Dockerfile
restart: unless-stopped
env_file: .env
depends_on:
db:
condition: service_healthy
networks:[internal]
secrets:
- jwt_private
- jwt_public
    # Port 8080 intentionally NOT exposed to host

webserver:
image: nginx:1.25-alpine
restart: unless-stopped
ports:
-"80:80"
-"443:443"
volumes:
- ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
- ./success.html:/usr/share/nginx/html/success.html:ro
- /etc/letsencrypt:/etc/letsencrypt:ro
depends_on:[backend]
networks:[internal]

secrets:
jwt_private:
file: ./secrets/jwt_private.pem
jwt_public:
file: ./secrets/jwt_public.pem
```

### 6.3 nginx.conf

```
server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name _;
    http2 on;

    ssl_certificate     /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /success.html {
        root /usr/share/nginx/html;
    }

    location /api/ {
        proxy_pass         http://backend:8080;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }
}
```

### 6.4 VPS Setup Commands

```bash
# 1. Install Docker & certbot
sudo apt update && sudo apt install -y docker.io docker-compose-plugin certbot

# 2. Clone repo
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker/infra

# 3. Configure environment
cp .env.example .env
nano .env   # Set POSTGRES_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 4. Add secrets directory
mkdir -p secrets
# Copy your jwt_private.pem and jwt_public.pem into secrets/
chmod 600 secrets/*.pem

# 5. Get SSL certificate
sudo certbot certonly --standalone -d YOUR_DOMAIN --email YOUR_EMAIL --agree-tos --no-eff-email

# 6. Update nginx.conf with your domain
sed -i 's/YOUR_DOMAIN/your-actual-domain.com/g' nginx.conf

# 7. Start stack
docker compose up -d

# 8. Smoke test
curl https://your-domain.com/actuator/health
# Expected: {"status":"UP"}
```

### 6.5 Database Backup (Host OS Cron — no S3 needed)

```bash
# Create backup directory
sudo mkdir -p /backups && sudo chmod 777 /backups

# Add to crontab: sudo crontab -e
# Daily at 3 AM — keep last 7 days
0 3 * * * docker exec $(docker ps -qf "name=habit-tracker-db") pg_dump -U ht_user habittracker | gzip > /backups/habittracker_$(date +\%Y\%m\%d).sql.gz && find /backups -name "*.sql.gz" -mtime +7 -delete
```

### 6.6 Update Deployment

```bash
cd ~/habit-tracker
git pull
cd infra
docker compose down
docker compose up --build -d
docker compose logs -f backend  # Verify Flyway migrations ran cleanly
```

### 6.7 SSL Auto-Renewal (Host Cron)

```bash
# sudo crontab -e
0 0,12 * * * certbot renew --quiet && docker exec $(docker ps -qf "name=habit-tracker-webserver") nginx -s reload
```

---

## Phase 7: CI/CD & Testing

### 7.1 GitHub Actions (ci.yml — unchanged from v4.0, correct)

```yaml
name: CI

on:[push, pull_request]

jobs:
backend-unit:
runs-on: ubuntu-latest
steps:
-uses: actions/checkout@v4
-uses: actions/setup-java@v4
with:{java-version:'21',distribution:'temurin'}
-run: mvn test
working-directory: services/api

backend-integration:
runs-on: ubuntu-latest
services:
postgres:
image: postgres:16-alpine
env:
POSTGRES_PASSWORD: test
POSTGRES_DB: habittracker_test
POSTGRES_USER: ht_test_user
        options:>-
          --health-cmd pg_isready
          --health-interval 10s
          --health-retries 5
steps:
-uses: actions/checkout@v4
-uses: actions/setup-java@v4
with:{java-version:'21',distribution:'temurin'}
-run: mvn verify
working-directory: services/api
env:
SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/habittracker_test
SPRING_DATASOURCE_USERNAME: ht_test_user
SPRING_DATASOURCE_PASSWORD: test
JWT_PRIVATE_KEY_PATH: src/test/resources/test-jwt-private.pem
JWT_PUBLIC_KEY_PATH: src/test/resources/test-jwt-public.pem
GOOGLE_CLIENT_ID: test
GOOGLE_CLIENT_SECRET: test

frontend:
runs-on: ubuntu-latest
steps:
-uses: actions/checkout@v4
-uses: pnpm/action-setup@v3
with:{version:9}
-uses: actions/setup-node@v4
with:{node-version:20}
-run: pnpm install && pnpm test
working-directory: apps/desktop

docker-build:
needs:[backend-unit, backend-integration, frontend]
if: github.ref == 'refs/heads/main'
runs-on: ubuntu-latest
steps:
-uses: actions/checkout@v4
-run: docker build services/api -t habittracker/api:${{ github.sha }}

tauri-build:
needs:[frontend]
if: startsWith(github.ref, 'refs/tags/v')
strategy:
matrix:
platform:[macos-latest, windows-latest, ubuntu-latest]
runs-on: ${{ matrix.platform }}
steps:
-uses: actions/checkout@v4
-uses: pnpm/action-setup@v3
with:{version:9}
-uses: actions/setup-node@v4
with:{node-version:20}
-uses: dtolnay/rust-toolchain@stable
-run: pnpm install
working-directory: apps/desktop
-uses: tauri-apps/tauri-action@v0
env:
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
tagName: ${{ github.ref_name }}
releaseName:'HabitTracker ${{ github.ref_name }}'
releaseBody:'See the assets to download and install this version.'
releaseDraft:true
prerelease:false
```

### 7.2 Test Setup — RSA Keypair for Tests

```bash
# Generate test-only keypair (never use in production)
cd services/api/src/test/resources
openssl genrsa -out test-jwt-private.pem 2048
openssl rsa -in test-jwt-private.pem -pubout -out test-jwt-public.pem
```

### 7.3 Unit Tests

```java
// test/unit/StreakCalculatorTest.java
package com.habittracker.unit;

import com.habittracker.habit.StreakCalculator;
import com.habittracker.habit.repository.HabitLogRepository;
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
}
```

```java
// test/unit/RecurrenceEngineTest.java
package com.habittracker.unit;

import com.habittracker.habit.RecurrenceEngine;
import com.habittracker.habit.HabitRepository;
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
}
```

### 7.4 Integration Tests

```java
// test/integration/AuthFlowTest.java
package com.habittracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired MockMvc mockMvc;

    @Test
    void exchange_missingCode_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/exchange")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"codeVerifier\":\"verifier\"}"))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.violations").isArray());
    }

    @Test
    void refresh_invalidToken_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"refreshToken\":\"invalid-token\"}"))
            .andExpect(status().isNotFound());
    }
}
```

```java
// test/integration/HabitApiTest.java
package com.habittracker.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HabitApiTest {

    @Autowired MockMvc mockMvc;

    @Test
    void listHabits_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/habits"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createHabit_missingName_returns422() throws Exception {
        // Would need a valid JWT fixture — wire up with @WithMockUser in real impl
        mockMvc.perform(post("/api/v1/habits")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"habitType\":\"POSITIVE\",\"rrule\":\"FREQ=DAILY\"}"))
            .andExpect(status().isUnauthorized()); // 401 before validation
    }
}
```

### 7.5 Testing Strategy

| Layer | Tool | What’s Tested |
| --- | --- | --- |
| Backend Unit | JUnit 5 + Mockito | StreakCalculator, RecurrenceEngine, ClockDrift validation |
| Backend Integration | @SpringBootTest + Testcontainers | Auth flow, habit CRUD, log endpoints, Flyway migrations |
| React Unit | Vitest + Testing Library | Zustand store mutations, PKCE helpers, offline queue |
| Tauri E2E | Playwright (optional) | Login → log habit → verify streak (mocked backend) |

**Structured Logging Rules:**
- ECS format in production via `logstash-logback-encoder`
- Inject userId into MDC on every authenticated request
- Log all auth attempts (success and failure)
- Log all token rotations

---

## Phase 8: Execution Timeline

| Day | Deliverable | Done When |
| --- | --- | --- |
| **1** | Phase 0: Repo, toolchain, Google OAuth app, RSA keypairs, `.env`, success.html on VPS | `curl /actuator/health` returns UP locally |
| **2–3** | Phase 1: DB schema V1+V2 verified, Flyway migrations run cleanly, indexes confirmed | `psql -c "\d habits"` shows all columns |
| **4–6** | Phase 2: Spring Boot boots, auth exchange + refresh + logout working, ProblemDetail errors, rate limiter active | Auth flow works end-to-end with Postman |
| **7–8** | Phase 3: RecurrenceEngine + StreakCalculator unit tests pass, ScheduledTasks wired | `mvn test` green |
| **9–10** | Phase 2 cont: HabitController CRUD + logs endpoint + stats endpoint working | All habit API endpoints return correct JSON envelopes |
| **11–12** | Phase 4: Tauri scaffolded, Stronghold + Store + deep-link + notification plugins wired, PKCE login end-to-end | Login works, access token in Zustand memory, refresh token in Stronghold |
| **13–14** | Phase 4 cont: Dashboard renders habits, check-in works, StreakRing updates, offline queue tested by toggling network | Offline logs sync on reconnect |
| **15** | Phase 6: Docker Compose on VPS, Nginx + Let’s Encrypt live, HTTPS working | `curl https://your-domain/actuator/health` returns UP |
| **16** | Integration tests pass on CI, Tauri builds cross-platform on tag push | CI green on all jobs |
| **17** | Production deploy, smoke test all flows, monitor structured logs | All 7 core features verified manually |

---

## Appendix A: Security Checklist Pre-Go-Live

- [ ]  `GOOGLE_CLIENT_SECRET` never in frontend bundle — server-side only
- [ ]  JWT access tokens expire in 15 minutes
- [ ]  Refresh tokens rotate on every use — old hash deleted immediately
- [ ]  Port 5432 NOT exposed in Docker Compose
- [ ]  Port 8080 NOT exposed in Docker Compose (Nginx proxies only)
- [ ]  HSTS header present in all Nginx HTTPS responses
- [ ]  Rate limiter returns 429 after 10 requests/minute on `/api/v1/auth/*`
- [ ]  Stronghold vault never stored in Tauri Store or `localStorage`
- [ ]  PKCE state parameter verified before code exchange (CSRF protection)
- [ ]  `ddl-auto: validate` — Flyway owns schema, Hibernate cannot drop tables
- [ ]  All inputs validated with Jakarta Bean Validation `@NotBlank`, `@Size`, `@NotNull`
- [ ]  Docker secrets (not env vars) for PEM files in production
- [ ]  Clock drift validation rejects future timestamps and >24h desync with 422
- [ ]  Materialized view has UNIQUE index for `REFRESH CONCURRENTLY`
- [ ]  Argon2 salt is per-machine via `machine-uid` crate
- [ ]  `uuid` crate in Cargo.toml for machine-id fallback
- [ ]  Deep link middleman has manual fallback link with 2s delay
- [ ]  Offline sync has exponential backoff with max 5 retries
- [ ]  Zustand `offlineStore` persist adapter uses Tauri Store (NOT localStorage)
- [ ]  Both partial unique indexes on `habit_logs` created and verified
- [ ]  Spring Boot version >= 3.4 in parent pom
- [ ]  `@EnableScheduling` on main application class
- [ ]  `tauri-plugin-notification` added to Cargo.toml and capabilities
- [ ]  Test RSA keypair in `src/test/resources` (never used in production)
- [ ]  Nightly `ScheduledTasks` verified: MV refresh + streak reconciliation + token cleanup

---

## Appendix B: Environment Variable Manifest

| Variable | Used By | Sensitivity | Notes |
| --- | --- | --- | --- |
| `POSTGRES_DB` | DB, Backend | Low | Database name |
| `POSTGRES_USER` | DB, Backend | Medium | DB username |
| `POSTGRES_PASSWORD` | DB, Backend | **High** | Use a strong random value |
| `SPRING_DATASOURCE_URL` | Backend | Low | `jdbc:postgresql://db:5432/habittracker` |
| `SPRING_DATASOURCE_USERNAME` | Backend | Medium | Same as `POSTGRES_USER` |
| `SPRING_DATASOURCE_PASSWORD` | Backend | **High** | Same as `POSTGRES_PASSWORD` |
| `JWT_PRIVATE_KEY_PATH` | Backend | **Critical** | `/run/secrets/jwt_private.pem` (Docker secret) |
| `JWT_PUBLIC_KEY_PATH` | Backend | High | `/run/secrets/jwt_public.pem` (Docker secret) |
| `JWT_ACCESS_EXPIRY_MINUTES` | Backend | Low | Default: 15 |
| `JWT_REFRESH_EXPIRY_DAYS` | Backend | Low | Default: 30 |
| `GOOGLE_CLIENT_ID` | Backend + Frontend | Medium | Public — safe in frontend bundle |
| `GOOGLE_CLIENT_SECRET` | Backend ONLY | **Critical** | NEVER in frontend bundle |
| `VITE_API_BASE_URL` | Frontend | Low | `https://your-vps-domain` |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Medium | Same as `GOOGLE_CLIENT_ID` |
| `VITE_REDIRECT_URI` | Frontend | Low | `https://your-vps-domain/success.html` |
| `VITE_DEEP_LINK_SCHEME` | Frontend | Low | `habittracker` |

---

## Appendix C: Complete File Tree

```
habit-tracker/
├── apps/
│   └── desktop/
│       ├── src/
│       │   ├── api/
│       │   │   ├── authApi.ts           ← exchangeCode(), refreshAccessToken()
│       │   │   ├── habitApi.ts          ← getHabits(), logHabitCompletion()
│       │   │   └── client.ts            ← axios + interceptors + 401 refresh
│       │   ├── components/
│       │   │   ├── ui/                  ← shadcn/ui primitives
│       │   │   ├── LoginPage.tsx        ← Google OAuth button
│       │   │   ├── Dashboard.tsx        ← habit list
│       │   │   ├── HabitCard.tsx        ← card + check-in button
│       │   │   ├── StreakRing.tsx       ← SVG ring progress
│       │   │   └── HistoryLog.tsx       ← 30-day calendar grid
│       │   ├── hooks/
│       │   │   ├── useOAuth.ts          ← PKCE login flow
│       │   │   ├── useOfflineSync.ts    ← exponential backoff sync
│       │   │   └── useNotifications.ts  ← tauri-plugin-notification
│       │   ├── store/
│       │   │   ├── authStore.ts         ← access token in memory
│       │   │   ├── habitStore.ts        ← habit list
│       │   │   └── offlineStore.ts      ← persisted via Tauri Store
│       │   ├── lib/
│       │   │   ├── stronghold.ts        ← refresh token vault
│       │   │   └── tauriStoreAdapter.ts ← Zustand persist adapter
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   └── habit.ts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── src-tauri/
│       │   ├── capabilities/default.json
│       │   ├── src/lib.rs
│       │   ├── Cargo.toml               ← includes uuid crate + notification plugin
│       │   └── tauri.conf.json
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
├── services/
│   └── api/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/habittracker/
│       │   │   │   ├── HabitTrackerApplication.java   ← @EnableScheduling
│       │   │   │   ├── auth/
│       │   │   │   │   ├── AuthController.java
│       │   │   │   │   ├── AuthService.java           ← Google exchange, JWT, rotation
│       │   │   │   │   ├── dto/
│       │   │   │   │   │   ├── AuthExchangeRequest.java
│       │   │   │   │   │   ├── AuthResponse.java
│       │   │   │   │   │   ├── RefreshRequest.java
│       │   │   │   │   │   ├── RefreshResponse.java
│       │   │   │   │   │   └── UserDTO.java
│       │   │   │   │   ├── model/
│       │   │   │   │   │   ├── User.java
│       │   │   │   │   │   └── RefreshToken.java
│       │   │   │   │   └── repository/
│       │   │   │   │       ├── UserRepository.java
│       │   │   │   │       └── RefreshTokenRepository.java
│       │   │   │   ├── habit/
│       │   │   │   │   ├── HabitController.java       ← full CRUD + logs + stats
│       │   │   │   │   ├── HabitService.java          ← all business logic
│       │   │   │   │   ├── RecurrenceEngine.java      ← ical4j RRULE parsing
│       │   │   │   │   ├── StreakCalculator.java       ← full recalculation
│       │   │   │   │   ├── HabitMapper.java            ← manual DTO mapper
│       │   │   │   │   ├── ScheduledTasks.java         ← nightly MV refresh + reconcile
│       │   │   │   │   ├── HabitRepository.java
│       │   │   │   │   ├── dto/
│       │   │   │   │   │   ├── HabitRequest.java
│       │   │   │   │   │   ├── HabitResponse.java
│       │   │   │   │   │   ├── SubHabitDTO.java
│       │   │   │   │   │   ├── LogRequest.java
│       │   │   │   │   │   ├── HabitLogDTO.java
│       │   │   │   │   │   └── HabitStatsDTO.java
│       │   │   │   │   ├── model/
│       │   │   │   │   │   ├── Habit.java
│       │   │   │   │   │   ├── HabitLog.java
│       │   │   │   │   │   ├── HabitType.java
│       │   │   │   │   │   └── SubHabit.java
│       │   │   │   │   └── repository/
│       │   │   │   │       ├── HabitRepository.java
│       │   │   │   │       ├── HabitLogRepository.java
│       │   │   │   │       └── SubHabitRepository.java
│       │   │   │   ├── shared/
│       │   │   │   │   ├── dto/PageResponse.java
│       │   │   │   │   ├── exception/
│       │   │   │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   │   │   └── ClockDriftException.java
│       │   │   │   │   └── GlobalExceptionHandler.java
│       │   │   │   └── config/
│       │   │   │       ├── SecurityConfig.java
│       │   │   │       └── RateLimitFilter.java
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       └── db/migration/
│       │   │           ├── V1__init_schema.sql
│       │   │           └── V2__streak_materialized_view.sql
│       │   └── test/
│       │       ├── java/com/habittracker/
│       │       │   ├── unit/
│       │       │   │   ├── StreakCalculatorTest.java
│       │       │   │   └── RecurrenceEngineTest.java
│       │       │   └── integration/
│       │       │       ├── AuthFlowTest.java
│       │       │       └── HabitApiTest.java
│       │       └── resources/
│       │           ├── application-test.yml
│       │           ├── test-jwt-private.pem   ← generate locally, never in prod
│       │           └── test-jwt-public.pem
│       ├── pom.xml
│       └── Dockerfile
├── infra/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── success.html
│   ├── secrets/              ← .gitignored
│   │   ├── jwt_private.pem
│   │   └── jwt_public.pem
│   └── .env.example
├── .github/
│   └── workflows/ci.yml
└── README.md
```