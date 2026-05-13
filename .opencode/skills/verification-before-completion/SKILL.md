---
name: verification-before-completion
description: Run verification commands and confirm output before claiming work is complete, fixed, or ready for commit/PR
---

## Rule

Never assert that work is done, a bug is fixed, or a feature is complete without first running the applicable verification commands and confirming they pass.

## Verification Checklist

- **TypeScript type checking** — `pnpm typecheck` in the affected app directory
- **Build** — `pnpm build` in the affected app directory
- **Tests** — Backend: `mvn test` or `mvn verify`. Frontend: relevant test runner if present
- **Linting** — Run the project's linter if configured
- **Cargo check** — If Tauri desktop changes were made: `cargo check` in `apps/desktop/src-tauri/`
- **Docker smoke test** — If infra changes: `docker compose up -d` from `infra/` + `infra/check.sh`

## Principles

- **Evidence before assertions** — Show the command output, don't just say "it works"
- **Don't skip** — Even small changes can break type checks or tests
- **Fix forward** — If verification fails, fix the issue rather than lowering the bar
