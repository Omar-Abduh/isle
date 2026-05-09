---
name: dev-workflow
description: Common development tasks for the isle monorepo — build, test, lint, typecheck, and deploy commands organized by project area
metadata:
  monorepo-root: /Users/omarabduh/Projects/isle
---

## Project Layout

```
isle/
  apps/
    web/            — Web SPA (Vite + React + TypeScript)
    desktop/        — Desktop app (Tauri v2 + React frontend + Rust shell)
  packages/
    shared/         — Shared UI components, hooks, types
  services/
    api/            — REST API (Spring Boot / Java 21 / Maven)
  infra/            — Docker Compose, Nginx, configs
  scripts/          — Version sync & semantic-release runner
```

## Frontend (web)

```bash
# Install dependencies (always use pnpm)
pnpm install

# Type checking
pnpm typecheck          # runs tsc in web + desktop + shared

# Build
pnpm build              # builds web app

# Dev server
pnpm dev                # starts Vite dev server
```

All commands are run from the app directory (`apps/web/`) or the root with `--filter`.

## Frontend (desktop)

```bash
# Same pnpm commands apply in apps/desktop/
pnpm typecheck
pnpm build

# Tauri Rust shell
cargo check             # run from apps/desktop/src-tauri/
cargo build
cargo clippy
```

## Frontend (mobile)

Mobile app is coming — the workspace structure may expand. When a mobile app directory appears under `apps/`, apply the same pattterns. Update this skill when the directory is created.

## Backend (API)

```bash
# Run tests
mvn test                # unit tests
mvn verify              # includes integration tests (Testcontainers)

# Build
mvn package             # produces JAR

# Run locally (requires Docker for PostgreSQL)
cd infra && docker compose up -d db
cd services/api && mvn spring-boot:run
```

All Maven commands are run from `services/api/`.

## Infrastructure

```bash
# Start full stack locally
cd infra && docker compose up -d

# View logs
docker compose logs -f

# Health check
./infra/check.sh

# Stop
docker compose down
```

## CI/CD

Two GitHub Actions workflows in `.github/workflows/`:
- **ci.yml** — Runs on push/PR: backend tests, frontend typecheck, Docker smoke test, Rust check
- **release.yml** — Runs on push to `main`/`preview`: semantic-release → docker publish → Tauri publish → back-merge

## Note

This monorepo structure is evolving. If directories change or new apps are added, update this skill to reflect the current layout.
