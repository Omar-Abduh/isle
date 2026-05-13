<div align="center">

![Isle Logo](../apps/desktop/public/Isle-logo-blue.svg)

</div>

# CI/CD Pipeline

This document describes the complete CI/CD pipeline for the Isle monorepo — from push to production. Two GitHub Actions workflows orchestrate every stage: **CI** (quality gates on every push/PR) and **Release** (automated versioning, publishing, and environment sync).

---

## Pipeline Overview

```mermaid
flowchart LR
    subgraph Developer
        Push[git push]
        PR[Pull Request]
    end

    subgraph CI[Continuous Integration]
        Unit[Backend Unit Tests]
        Integration[Backend Integration Tests]
        WebTC[Web TypeScript Check]
        DesktopTC[Desktop TypeScript Check]
        MobileTC[Mobile TypeScript Check]
        DockerTest[Docker Smoke Test]
        RustCheck[Tauri Rust Check]
        AndroidRust[Tauri Android Rust Check]
    end

    subgraph CD[Continuous Delivery]
        SR[semantic-release]
        Docker[Docker Image Build & Push]
        Tauri[Tauri Native Builds]
        BackMerge[Back-Merge]
    end

    subgraph Registry[Artifact Registry]
        DockerHub[(Docker Hub)]
        GHReleases[GitHub Releases]
    end

    Push --> CI
    PR --> CI

    CI --> CD

    CD --> SR
    SR --> Docker
    SR --> Tauri
    SR --> BackMerge

    Docker --> DockerHub
    Tauri --> GHReleases
```

---

## 1. CI Workflow — Quality Gates

**Trigger:** `push` or `pull_request` on any branch.

**File:** `.github/workflows/ci.yml`

```mermaid
flowchart TD
    A[Push / PR] --> B{Run all jobs in parallel}

    B --> C1[backend-unit<br/>mvn test]
    B --> C2[backend-integration<br/>mvn verify + Postgres]
    B --> C3[web-frontend<br/>pnpm install + typecheck]
    B --> C4[desktop-frontend<br/>pnpm install + typecheck]
    B --> C5[mobile-frontend<br/>pnpm install + build]
    B --> C6[tauri-rust-check<br/>cargo check desktop]
    B --> C7[tauri-android-check<br/>cargo check Android]

    C1 --> D1{Pass?}
    C2 --> D2{Pass?}
    C3 --> D3{Pass?}
    C4 --> D4{Pass?}
    C5 --> D5{Pass?}
    C6 --> D6{Pass?}
    C7 --> D7{Pass?}

    D1 -- Yes --> E[docker-smoke-test]
    D2 -- Yes --> E

    D1 -- No --> F[❌ Pipeline Fails]
    D2 -- No --> F
    D3 -- No --> F
    D4 -- No --> F
    D5 -- No --> F
    D6 -- No --> F
    D7 -- No --> F

    E --> G[Start Docker Compose]
    G --> H[Run infra/check.sh]
    H --> I{Healthy?}
    I -- Yes --> J[✅ Pipeline Passes]
    I -- No --> F
```

### Jobs

| Job | Runner | Command | Dependencies |
|-----|--------|---------|-------------|
| `backend-unit` | ubuntu-latest | `mvn test` | — |
| `backend-integration` | ubuntu-latest | `mvn verify` + PostgreSQL 16 | — |
| `web-frontend` | ubuntu-latest | `pnpm install && pnpm typecheck` | — |
| `desktop-frontend` | ubuntu-latest | `pnpm install && pnpm typecheck` | — |
| `mobile-frontend` | ubuntu-latest | `pnpm install && pnpm --filter @isle/mobile build` | — |
| `docker-smoke-test` | ubuntu-latest | `docker compose up -d && check.sh` | `backend-unit`, `backend-integration` |
| `tauri-rust-check` | ubuntu-latest | `cargo check` (desktop) | `desktop-frontend` |
| `tauri-android-check` | ubuntu-latest | `cargo check --target aarch64-linux-android` | `desktop-frontend` |

### Docker Smoke Test Detail

The `docker-smoke-test` job is the integration safety net. It:

1. Creates a `.env` file with test credentials
2. Generates temporary JWT RSA key pair
3. Starts the full Docker Compose stack (`docker compose up -d --build`)
4. Runs `infra/check.sh` to verify all services respond correctly
5. Tears down the stack on completion (always, even on failure)

---

## 2. Release Workflow — Automated CD

**Trigger:** `push` to `main` or `preview` branches only.

**File:** `.github/workflows/release.yml`

```mermaid
flowchart TD
    A[Push to main / preview] --> B[Checkout with GH_PAT]
    B --> C[Install release deps]
    C --> D[Run semantic-release]

    D --> E{Release created?}
    E -- No --> F[❌ No version bump needed]

    E -- Yes --> G{What branch?}

    G -- main --> H1[Create stable tag<br/>vX.Y.Z]
    G -- preview --> H2[Create beta tag<br/>vX.Y.Z-beta.N]

    H1 --> I1[Sync versions]
    H2 --> I2[Sync versions]

    I1 --> J1[Publish Docker image<br/>version + latest]
    I2 --> J2[Publish Docker image<br/>version + beta]

    J1 --> K1[Build Tauri macOS]
    J1 --> K2[Build Tauri Windows]
    J1 --> K3[Build Tauri Linux]
    J1 --> K4[Build Tauri Android]

    J2 --> K1
    J2 --> K2
    J2 --> K3
    J2 --> K4

    K1 --> L[Upload artifacts<br/>to GitHub Release]
    K2 --> L
    K3 --> L
    K4 --> L

    L --> M1[Back-merge main → preview]
    L --> M2[Back-merge main → dev]
    L --> M3[Back-merge preview → dev]
```

### Jobs

| Job | Trigger | Dependencies | Purpose |
|-----|---------|-------------|---------|
| `semantic-release` | Always | — | Analyze commits, compute version, update files, create tag |
| `docker-publish` | `released == true` | `semantic-release` | Build and push backend Docker image to Docker Hub |
| `tauri-publish` | `released == true` | `semantic-release` | Build native binaries (macOS/Windows/Linux/Android) and upload to GitHub Release |
| `back-merge` | `released == true` | `semantic-release` | Sync release branch downstream |

---

## 3. Branch Flow & Environment Promotion

```mermaid
graph LR
    subgraph Dev[Development]
        dev[dev branch]
        feat[Feature Branches]
        feat -- PR/Squash --> dev
    end

    subgraph Stage[Staging]
        preview[preview branch]
        dev -- PR/Squash --> preview
    end

    subgraph Prod[Production]
        main[main branch]
        preview -- PR/Squash --> main
    end

    subgraph Downstream[Post-Release]
        main -- back-merge --> preview
        preview -- back-merge --> dev
    end

    Dev --> Stage --> Prod --> Downstream
```

### Release Types by Branch

| Branch | Release Type | Docker Tags | Tauri Binaries | Back-merge Target |
|--------|-------------|-------------|----------------|-------------------|
| `main` | Stable (`vX.Y.Z`) | `isle:X.Y.Z`, `isle:latest` | Final release (macOS, Windows, Linux) | `preview` → `dev` |
| `preview` | Beta (`vX.Y.Z-beta.N`) | `isle:X.Y.Z-beta.N`, `isle:beta` | Pre-release (macOS, Windows, Linux, Android) | `dev` |
| `dev` | None | N/A | N/A | N/A |

---

## 4. Version Sync Flow

When a release is created, semantic-release updates version strings across all apps to keep them in sync:

```mermaid
flowchart LR
    A[semantic-release] --> B[Compute next version]
    B --> C[Update apps/web/package.json]
    B --> D[Update apps/desktop/package.json]
    B --> E[Update apps/desktop/src-tauri/tauri.conf.json]
    B --> F[Update services/api/pom.xml]
    B --> G[Generate CHANGELOG.md]
    B --> H[Create Git tag vX.Y.Z]
    B --> I[Create GitHub Release]
```

---

## 5. Commit-to-Version Rules

| Commit Prefix | Version Bump | Example |
|--------------|-------------|---------|
| `fix:`, `perf:`, `refactor:` | Patch | `v1.0.0` → `v1.0.1` |
| `feat:` | Minor | `v1.0.0` → `v1.1.0` |
| `feat!:`, `BREAKING CHANGE:` | Major | `v1.0.0` → `v2.0.0` |
| `docs:`, `chore:`, `ci:` | None | N/A |

---

## 6. Docker Image Publishing

```mermaid
flowchart LR
    A[semantic-release] --> B[released = true]
    B --> C[Set up Docker Buildx]
    C --> D[Login to Docker Hub]
    D --> E[Compute tags]
    E --> F{Source branch?}

    F -- main --> G1[Tag: version + latest]
    F -- preview --> G2[Tag: version + beta]

    G1 --> H[Build & push API image]
    G2 --> H
```

### Image Tags

| Branch | Tags Published | Example |
|--------|---------------|---------|
| `main` | `<version>`, `latest` | `<username>/isle:1.4.0`, `<username>/isle:latest` |
| `preview` | `<version>`, `beta` | `<username>/isle:1.4.0-beta.1`, `<username>/isle:beta` |

---

## 7. Tauri Native Build Matrix

The `tauri-publish` job builds and uploads native binaries for every platform:

| OS | Build Target | Artifacts | Rust Target |
|----|-------------|-----------|-------------|
| macOS (macos-latest) | Desktop | `.dmg` | `x86_64-apple-darwin` |
| Windows (windows-latest) | Desktop | `.exe`, `.msi` | `x86_64-pc-windows-msvc` |
| Ubuntu (ubuntu-latest) | Desktop | `.AppImage`, `.deb` | `x86_64-unknown-linux-gnu` |
| Ubuntu (ubuntu-latest) | Android | `.apk`, `.aab` | `aarch64-linux-android` |

---

## 8. Back-Merge Strategy

To prevent post-release drift, each release triggers an automated back-merge to downstream branches:

```mermaid
sequenceDiagram
    participant Main as main
    participant Preview as preview
    participant Dev as dev
    participant Bot as release-bot

    Note over Main,Dev: Stable release on main
    Bot->>Main: Create tag vX.Y.Z
    Bot->>Main: Push release commit
    Bot->>Preview: git merge main -X theirs
    Bot->>Dev: git merge main -X theirs

    Note over Main,Dev: Beta release on preview
    Bot->>Preview: Create tag vX.Y.Z-beta.N
    Bot->>Preview: Push release commit
    Bot->>Dev: git merge preview -X theirs
```

The `-X theirs` flag auto-resolves conflicts in favor of the higher environment (release source).

---

## 9. Required Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `GH_PAT` | All release jobs | Authenticated checkout/push through branch protection |
| `DOCKERHUB_USERNAME` | `docker-publish` | Docker Hub namespace for image publishing |
| `DOCKERHUB_TOKEN` | `docker-publish` | Docker Hub access token for authenticated pushes |
| `VITE_API_BASE_URL` | `tauri-publish` | Backend API endpoint for Tauri builds |
| `VITE_GOOGLE_CLIENT_ID` | `tauri-publish` | Google OAuth client ID for Tauri builds |
| `VITE_REDIRECT_URI` | `tauri-publish` | OAuth callback URI for Tauri builds |

---

## 10. Workflow Files

| File | Path | Purpose |
|------|------|---------|
| CI | `.github/workflows/ci.yml` | Build, test, type-check on every push/PR |
| Release | `.github/workflows/release.yml` | Version, publish, and back-merge on main/preview |

---

## 11. Failure Modes & Recovery

| Failure | Cause | Recovery |
|---------|-------|----------|
| CI job fails | Test/type/build error | Fix code, push again |
| `docker-smoke-test` fails | Docker Compose or smoke check | Check `infra/check.sh` and Docker config |
| `semantic-release` fails | Commit message format or GH_PAT | Inspect logs, fix commits or credentials |
| `docker-publish` fails | Docker Hub auth or build | Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` |
| `tauri-publish` fails | Missing system deps or Rust errors | Check runner setup and Rust compilation |
| `back-merge` fails | Branch divergence | Manually resolve and push from release branch head |
