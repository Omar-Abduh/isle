# Isle Monorepo

Monorepo with React frontend (web + Tauri desktop), Spring Boot API, and Docker Compose infra.

## Skills

Load these skills as needed:

- `verification-before-completion` — **Always load before claiming work is done.** Run typecheck, tests, lint, and build before asserting success.
- `systematic-debugging` — **Load when investigating bugs or test failures.** Follow structured root-cause analysis.
- `planning` — Load for complex multi-step tasks or architectural changes. Research first, present a plan.
- `official-docs` — Load when working with APIs or frameworks you're unsure about. Fetch official docs before coding.
- `code-review` — Load when reviewing diffs or PRs.
- `dev-workflow` — Load for project-specific build/test/deploy commands.
- `documentation` — Load when writing or updating docs.
- `commit-conventions` — Load when writing commit messages.
- `release-notes` — Load when generating changelogs or release notes.

### UI/UX Skills

When the user mentions "ui/ux" or asks for UI/UX work, you MUST load EVERY skill listed below without filtering:
- `a11y-accessibility`
- `responsive-design`
- `form-ux`
- `animation-ux`
- `design-system`
- `testing-ui`

## Commands

- **TypeScript check** — `pnpm typecheck` from app dir (`apps/web/`, `apps/desktop/`)
- **Build** — `pnpm build`
- **Backend tests** — `mvn test` or `mvn verify` from `services/api/`
- **Rust check** — `cargo check` from `apps/desktop/src-tauri/`
- **Docker** — `docker compose up -d` from `infra/`
- **Health check** — `infra/check.sh`
