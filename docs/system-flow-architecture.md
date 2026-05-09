<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# System Flow & Architecture

This document explains how Isle is structured and how data moves across the system at runtime.

## 1. High-Level Architecture

```mermaid
graph LR
    subgraph Client[Client Layer]
        Shared[packages/shared\nTypes · Stores · Hooks · UI]
        Web[Web App\nVite + React]
        Desktop[Desktop App\nTauri v2 + React]
        Mobile[Mobile App\nTauri v2 + Android]
        Web --- Shared
        Desktop --- Shared
        Mobile --- Shared
    end

    subgraph API[Backend Layer]
        Gateway[Spring Boot REST API]
        Auth[OAuth PKCE + JWT]
        Recurrence[Recurrence Engine\nRRULE evaluator]
        Sync[Offline Sync Processor]
    end

    subgraph Data[Data Layer]
        PG[(PostgreSQL 16)]
        Vault[Tauri Stronghold\nEncrypted refresh token storage]
    end

    Web --> Gateway
    Desktop --> Gateway
    Mobile --> Gateway
    Desktop --> Vault
    Mobile --> Vault
    Gateway --> Auth
    Gateway --> Recurrence
    Gateway --> Sync
    Gateway --> PG
```

## 2. Authentication Flow (OAuth PKCE)

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant App as Isle Client (Web/Desktop)
    participant Google as Google OAuth
    participant API as Isle API
    participant DB as PostgreSQL

    User->>App: Click "Sign in with Google"
    App->>Google: Start OAuth with PKCE challenge
    Google-->>App: Redirect with authorization code
    App->>API: POST /auth/google/exchange\n(code + verifier)
    API->>Google: Verify code + PKCE
    Google-->>API: User identity + tokens
    API->>DB: Upsert user + refresh token record
    API-->>App: Access JWT + refresh token reference
    App->>App: Store refresh token securely\n(Tauri Stronghold on desktop)
```

## 3. Habit Check-In Flow (Online)

```mermaid
sequenceDiagram
    autonumber
    participant UI as Dashboard UI
    participant Client as API Client
    participant API as Spring Boot API
    participant RR as Recurrence Engine
    participant DB as PostgreSQL

    UI->>Client: Mark habit complete
    Client->>API: POST /habits/{id}/logs\n+ X-Timezone header
    API->>RR: Validate due status for local date
    RR-->>API: Due/Not due result
    API->>DB: Insert habit_log
    API->>DB: Recompute current_streak + longest_streak
    API-->>Client: Updated habit DTO
    Client-->>UI: Render new streak + analytics
```

## 4. Offline Sync Flow (Desktop/Web)

```mermaid
flowchart TD
    A[User checks in habit] --> B{Network available?}
    B -- Yes --> C[Send request to API]
    C --> D[Persist to DB]
    D --> E[Return updated habit state]
    B -- No --> F[Queue action in offline store]
    F --> G[Show optimistic UI state]
    G --> H[Background connectivity watcher]
    H --> I{Connection restored?}
    I -- No --> H
    I -- Yes --> J[Replay queued actions in order]
    J --> K[Resolve conflicts + refresh state]
    K --> L[Clear synced queue items]
```

## 5. Streak Calculation Logic Flow

```mermaid
flowchart LR
    A[Habit + RRULE + User timezone] --> B[Generate due dates window]
    B --> C[Fetch logged dates]
    C --> D[Intersect due dates with completed logs]
    D --> E{Any missed due date in sequence?}
    E -- Yes --> F[Reset current_streak to 0 at miss point]
    E -- No --> G[Increment current_streak]
    F --> H[Update longest_streak if needed]
    G --> H
    H --> I[Persist streak values]
```

## 6. Request Boundaries and Timezone Integrity

- The client injects `X-Timezone` in time-sensitive requests.
- The API computes "today" and due-date boundaries using the client timezone.
- Streak integrity is based on local-date boundaries, not server UTC time.

## 7. Deployment Runtime Topology

```mermaid
graph TD
    User[User Device] --> FE[Vercel Frontend\nWeb App]
    User --> TA[Tauri Desktop App]
    User --> MA[Tauri Mobile App\nAndroid APK]
    FE --> N[Nginx Reverse Proxy\nVPS]
    TA --> N
    MA --> N
    N --> BE[Spring Boot API\nDocker]
    BE --> DB[(PostgreSQL 16\nDocker)]
    TA --> SH[Stronghold Vault\nEncrypted local storage]
    MA --> SH
```

## 8. Operational Notes

- Release automation is documented in `docs/semantic-release.md`.
- Backend module details are in `services/api/README.md`.
- Web frontend details are in `apps/web/README.md`.
- Desktop frontend details are in `apps/desktop/README.md`.
- Shared package details are in `packages/shared/README.md`.
