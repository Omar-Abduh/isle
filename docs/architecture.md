<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# Architecture

Isle is built using a decoupled client-server architecture within a pnpm monorepo:

```mermaid
graph TD
    subgraph Frontend [Isle Apps]
        Shared[packages/shared<br/>Types · Stores · Hooks · UI]
        Web[apps/web<br/>Vercel · Vite + React]
        Desktop[apps/desktop<br/>Tauri v2 · Rust + React]
        Mobile[apps/mobile<br/>Tauri v2 · Android]

        Shared --- Web
        Shared --- Desktop
        Shared --- Mobile
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

- **Frontend**: React 18 with Tailwind CSS, state management via Zustand and React Query. Three variants:
  - **Web** (`apps/web/`) — deployed on Vercel, no native runtime
  - **Desktop** (`apps/desktop/`) — Tauri v2 native app, Rust backend
  - **Mobile** (`apps/mobile/`) — Tauri v2 Android app, shared Rust backend
- **Shared Package** (`packages/shared/`) — `@isle/shared` workspace package with cross-platform types, Zustand stores, React hooks, and shadcn/ui components consumed by all apps
- **Backend**: Spring Boot API with OAuth PKCE authentication and recurrence engine
- **Database**: PostgreSQL 16 with strict foreign key constraints and UUID primary keys

## Workspace Dependency Graph

```mermaid
graph LR
    subgraph Applications
        Web
        Desktop
        Mobile
    end

    subgraph Libraries
        Shared[packages/shared]
        TauriRust[apps/desktop/src-tauri]
    end

    Web --> Shared
    Desktop --> Shared
    Desktop --> TauriRust
    Mobile --> Shared
    Mobile --> TauriRust
```

## Folder Structure

```
isle/
├── apps/
│   ├── web/              # @isle/web — Vercel-deployed React app
│   ├── desktop/          # @isle/desktop — Tauri v2 desktop app
│   └── mobile/           # @isle/mobile — Tauri v2 mobile app
├── packages/
│   └── shared/           # @isle/shared — shared code
├── services/
│   └── api/              # Spring Boot REST API
└── infra/                # Docker, Nginx, deployment configs
```
