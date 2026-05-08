# Contributing

Thank you for contributing to Isle.

## Commit Message Convention

This repository uses Conventional Commits to drive automated semantic versioning.

### Allowed prefixes

- `feat:`: new feature (minor release)
- `fix:`: bug fix (patch release)
- `perf:`: performance improvement (patch release)
- `refactor:`: code change without behavior change (patch release)
- `docs:`: documentation only (no release by default)
- `chore:`: tooling or maintenance only (no release by default)
- `ci:`: CI changes only (no release by default)

### Breaking changes

Use either:

- `feat!: message`
- or include `BREAKING CHANGE:` in the commit body

Both trigger a major release.

## Examples

- `feat: add recurrence presets to habit form`
- `fix: correct timezone boundary on daily streak`
- `refactor: simplify OAuth callback handling`
- `feat!: replace old token endpoint with PKCE exchange`

## Branching

- `main`: stable production releases
- `preview`: beta releases
- `Dev` or `dev`: integration branch (no direct release)

## Pull Requests

- Keep PRs focused and small.
- Include tests for behavior changes.
- Ensure CI passes before merge.
- Use clear PR titles following Conventional Commits when possible.
