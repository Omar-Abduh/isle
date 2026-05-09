<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# Architecture

Isle is built using a decoupled client-server architecture:

```mermaid
graph TD
    subgraph Frontend [Isle Desktop & Web]
        UI[React 18 + Tailwind]
        State[Zustand + React Query]
        Tauri[Tauri Core / Rust]
        UI <--> State
        State <--> Tauri
    end

    subgraph Backend [Isle API / Spring Boot]
        Auth[OAuth PKCE + JWT]
        Recurrence[RecurrenceEngine]
        API[REST Controllers]
        Auth <--> API
        Recurrence <--> API
    end

    subgraph Database [Storage]
        PG[(PostgreSQL 16)]
    end

    Frontend -- "HTTPS / JSON\n(X-Timezone injected)" --> Backend
    Backend -- "JDBC" --> PG
```

## Components

- **Frontend**: React 18 with Tailwind CSS, state management via Zustand and React Query. Two variants: **web** (`apps/web/`, deployed on Vercel) and **desktop** (`apps/desktop/`, Tauri v2 native app)
- **Backend**: Spring Boot API with OAuth PKCE authentication and recurrence engine
- **Database**: PostgreSQL 16 with strict foreign key constraints and UUID primary keys
