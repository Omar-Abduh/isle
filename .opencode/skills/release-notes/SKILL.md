---
name: release-notes
description: Generate changelogs and release notes from git history using Conventional Commits and the semantic-release setup used by this monorepo
metadata:
  workflow: release.yml
---

## Context

This monorepo uses **semantic-release** with the `conventionalcommits` preset. The release pipeline is in `.github/workflows/release.yml` and runs on push to `main` or `preview` branches.

The pipeline:
1. `semantic-release` — analyzes commits, bumps version, generates changelog, creates git tag
2. `docker-publish` — builds and pushes Docker image to Docker Hub
3. `tauri-publish` — cross-platform desktop builds uploaded to GitHub Release
4. `back-merge` — auto-merges `main` into `preview` and `dev`

Version sync is handled by `scripts/sync-version.mjs` across: root `package.json`, `apps/web/package.json`, `apps/desktop/package.json`, `apps/desktop/src-tauri/tauri.conf.json`, `services/api/pom.xml`.

## Generating Release Notes

### From git log

```bash
git log --oneline --no-decorate <last-tag>..HEAD
```

Group commits by type:
- **Features** — `feat:` commits
- **Bug Fixes** — `fix:` commits
- **Performance** — `perf:` commits
- **Documentation** — `docs:` commits
- **Maintenance** — `chore:`, `refactor:`, `build:`, `ci:` commits

### Format

```markdown
## [x.y.z] - YYYY-MM-DD

### Features
- Brief description (PR #123)

### Bug Fixes
- Brief description (PR #456)

### Maintenance
- Brief description (PR #789)
```

## Notes

- Include the PR number and an @mention of the contributor when applicable
- Breaking changes should be called out prominently at the top
- Describe the user-facing impact, not just the implementation detail
