# 🚀 Semantic Versioning & CI/CD Architecture

This project utilizes a fully automated, tag-based Semantic Versioning (SemVer) pipeline powered by GitHub Actions and `semantic-release`. The system is designed to eliminate manual versioning errors, automatically generate changelogs, and maintain perfect Git history synchronization across all environments.

---

## 🌿 Branch Architecture

We maintain a strict three-tier branch structure to handle pre-releases and production deployments:

- **`main` (Production):** Protected branch. Generates stable releases (e.g., `v2.0.2`).
- **`preview` (Staging/Beta):** Pre-release environment. Generates beta candidate tags (e.g., `v2.0.2-beta.1`).
- **`Dev` (Development):** Integration branch. Receives synchronized history but does not trigger independent releases.

---

## ⚙️ Pipeline Design & Flow

Our `.github/workflows/release.yml` pipeline operates in two sequential jobs to ensure environment stability.

### Job 1: Semantic Release Calculation

1. **Commit Analysis**  
   The bot analyzes the Git tree since the last official tag using the Conventional Commits standard.

2. **Version Math**  
   Determines if the changes warrant a Major, Minor, or Patch bump.

3. **Elevated Authentication**  
   Utilizes a dedicated `GH_PAT` (Personal Access Token) injected directly into the `actions/checkout` step and the Node.js environment. This allows the bot to safely bypass strict branch protection rules to push updated `package.json` files and new Git tags.

---

### Jobs 2-4: Artifact Publishing (Docker & Tauri)

When a release is created (`released == 'true'`), three parallel publishing jobs execute:

**Job 2: Docker Publishing (`docker-publish`)**
- Builds and publishes backend Docker image to Docker Hub
- Applies version-specific and branch-conditional tags:
  - `main` → `isle:X.Y.Z`, `isle:latest`
  - `preview` → `isle:X.Y.Z-betaN`, `isle:beta`

**Job 3: Tauri Desktop Publishing (`tauri-publish`)**
- Cross-platform build: macOS, Windows, Linux
- Publishes binary artifacts to GitHub Releases
- Automatically sets prerelease flag based on tag (beta tags marked as pre-release)

**Job 4: State Synchronization (Back-Merge)**

To prevent **Post-Release Amnesia** (where lower branches lose track of production tags), the pipeline performs an automated history synchronization immediately following release and artifact publishing.

#### If released on `main`

The bot performs a clean `git merge` of `main` downwards into both `preview` and `dev`.

#### If released on `preview`

The bot merges `preview` downwards into `dev`.

#### Merge Mechanism

Uses the `-X theirs` merge strategy flag to resolve conflicts in favor of the higher environment, ensuring the official release tags become a permanent part of the lower branches' history.

---

## 📝 Commit Message Convention

To trigger automated releases, PR titles and commit messages must strictly follow the Conventional Commits specification.

| Commit Prefix              | Trigger Type  | Generated Version Bump |
| -------------------------- | ------------- | ---------------------- |
| `fix:`                     | Patch Release | `v1.0.0` → `v1.0.1` |
| `perf:` / `refactor:`      | Patch Release | `v1.0.0` → `v1.0.1` |
| `feat:`                    | Minor Release | `v1.0.0` → `v1.1.0` |
| `BREAKING CHANGE:`         | Major Release | `v1.0.0` → `v2.0.0` |
| `chore:` / `ci:` / `docs:` | No Release    | N/A |

---

## 🔄 Release Lifecycle Example

```text
Dev
 └── preview
      └── main
```

### Example Flow

1. Developer merges a feature into `preview`
2. `semantic-release` creates:
   ```bash
   v2.1.0-beta.1
   ```
3. After validation, `preview` is merged into `main`
4. Production release generated:
   ```bash
   v2.1.0
   ```
5. Pipeline automatically back-merges:
   - `main` → `preview`
   - `main` → `Dev`

---

## � Docker Image Publishing

Isle publishes backend Docker images to Docker Hub automatically on every release:

| Branch | Image Tag Pattern | Example |
| --- | --- | --- |
| `main` | `<version>`, `latest` | `<username>/isle:1.4.0`, `<username>/isle:latest` |
| `preview` | `<version>`, `beta` | `<username>/isle:1.4.0-beta.1`, `<username>/isle:beta` |

The `docker-publish` job runs after `semantic-release` completes successfully and only when a new version is created. Images are pushed to the namespace specified in `DOCKERHUB_USERNAME` secret.

---

## �🔐 Required Secrets

The following GitHub repository secrets must be configured:

| Secret Name | Purpose |
| --- | --- |
| `GH_PAT` | Personal Access Token used for authenticated pushes and protected branch operations |
| `DOCKERHUB_USERNAME` | Docker Hub namespace/username for image publishing |
| `DOCKERHUB_TOKEN` | Docker Hub access token for authenticated image push |
| `NPM_TOKEN` *(optional)* | Required only if publishing packages to npm |

---

## 🧩 Core Technologies

- GitHub Actions
- semantic-release
- Conventional Commits
- Node.js
- Git Tags
- Protected Branch Workflows
- Docker Hub
- Tauri (cross-platform desktop)

---

## ✅ Benefits of This Architecture

- Fully automated versioning
- Zero manual tagging
- Automated changelog generation
- Consistent Git history across environments
- Safe protected-branch automation
- Predictable release lifecycle
- Production-grade CI/CD workflow
- Automated multi-platform Tauri binary publishing
- Automated backend Docker image publishing

---