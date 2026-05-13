---
name: commit-conventions
description: Write commit messages following the Conventional Commits format used by semantic-release in this monorepo
metadata:
  preset: conventionalcommits
---

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types

| Type | Release | Description |
|------|---------|-------------|
| `feat` | minor | A new feature |
| `fix` | patch | A bug fix |
| `chore` | — | Maintenance, tooling, deps |
| `docs` | — | Documentation only |
| `style` | — | Formatting, whitespace (no logic change) |
| `refactor` | — | Code change with no feature/fix |
| `perf` | — | Performance improvement |
| `test` | — | Adding/fixing tests |
| `build` | — | Build system or dependencies |
| `ci` | — | CI config or scripts |

**BREAKING CHANGE** in the footer (or `!` after type/scope) triggers a **major** release.

## Scopes

Use a scope that matches the area of change:
- `web` — frontend web app
- `desktop` — frontend desktop app
- `api` — backend Spring Boot service
- `shared` — shared package
- `infra` — Docker, Nginx, deployment configs
- `ci` — GitHub Actions workflows
- `deps` — dependency updates

## Examples

```
feat(api): add habit recurrence endpoint

fix(web): handle empty habit list on dashboard

feat(desktop)!: drop support for macOS 12

BREAKING CHANGE: macOS 12 is no longer supported.

chore(deps): upgrade Spring Boot to 3.4.1
```

## Important

- The **first line must be 72 characters or fewer**
- Use the imperative mood ("add" not "added" or "adds")
- Don't end the summary line with a period
- Reference issues/PRs in the footer with `Closes #123` or `Refs #456`
