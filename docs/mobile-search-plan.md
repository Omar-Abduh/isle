# Tauri Mobile Support — Research & Status

**Status: PAUSED** — Monorepo restructuring and Vercel deployment are complete. Mobile app implementation is deferred.

## Objective
Add `apps/mobile/` (Android) to the Isle monorepo, sharing the Rust backend and frontend code without breaking existing `apps/web/` or `apps/desktop/`.

---

## Completed Work

### ✅ Monorepo Restructuring
| Area | Detail |
|------|--------|
| `pnpm-workspace.yaml` | Glob patterns `apps/*` and `packages/*` at repo root |
| Package scoping | `@isle/web`, `@isle/desktop`, `@isle/shared` |
| Lockfile | Single root `pnpm-lock.yaml`, no nested lockfiles |
| `apps/web/pnpm-workspace.yaml` | Removed — was an experiment for Vercel `apps/web` root directory approach (abandoned) |
| Stale files removed | `apps/web/pnpm-lock.yaml` symlink, `apps/web/vercel.json`, `apps/web/package-lock.json` |

### ✅ Shared Package (`packages/shared/`)
- Scaffolded `@isle/shared` with TypeScript, tsconfig, package.json
- Extracted ~85 shared files from both apps:
  - **Types**: `auth.ts`, `habit.ts`
  - **Libraries**: `cn.ts`, `tauriStoreAdapter.ts`
  - **Stores**: `authStore.ts`, `habitStore.ts`, `offlineStore.ts`
  - **Hooks**: `useOAuth.ts`, useNavigate pattern
  - **Components**: 55 shadcn/ui primitives, habit components (`HabitCard`, `StreakRing`, `Dashboard`, `HistoryLog`)
  - **Shared components**: `LoadingScreen`, `ErrorBoundary`, etc.
- Added `@tauri-apps/plugin-store` as devDependency (used by `tauriStoreAdapter.ts`)

### ✅ Tailwind CSS Scanning via Symlinks
Both apps have `src/shared-src` symlinks pointing to `../../packages/shared/src/`:
- `apps/web/src/shared-src` → `../../packages/shared/src`
- `apps/desktop/src/shared-src` → `../../packages/shared/src`
- CSS output restored to 128KB (matching pre-extraction baseline)
- `@source` CSS directive was tested but silently ignored by `@tailwindcss/vite@4.2.4`

### ✅ Type Conflicts Resolved
- Unified `HabitLogEntry` import — was imported from wrong path in some files
- Barrel exports (`index.ts`) properly re-export all shared symbols
- Both apps typecheck and build successfully

### ✅ Vercel Deployment (Web)

**Final configuration (working):**
- **Root Directory**: `.` (repo root) — set in Vercel dashboard
- `vercel.json` at repo root:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ],
    "buildCommand": "pnpm --filter @isle/web build",
    "outputDirectory": "apps/web/dist",
    "installCommand": "pnpm install --frozen-lockfile"
  }
  ```
- Root `pnpm-workspace.yaml` resolves all packages (`@isle/shared` via `packages/*` glob)
- No symlinks or special config needed in `apps/web/`

**Rejected approaches:**
1. `pnpm --dir ../../ install` — `../../` from Vercel CWD resolves to filesystem root, not repo root
2. `pnpm-workspace.yaml` in `apps/web/` with `../../packages/*` glob — pnpm workspace globs can't escape the workspace root directory; Vercel's Root Directory also restricts filesystem access to `apps/web/`

### ✅ Git Branch
- Feature branch: `feat/mobile-support`
- 10 commits with Conventional Commits format
- Pushed to `origin`

---

## Deferred: Mobile App (apps/mobile/)

The following research and implementation steps are deferred. This section serves as a reference when mobile work resumes.

### Research Topics

| Topic | Key Questions | Reference |
|-------|--------------|-----------|
| Tauri mobile architecture | `tauri android init` output, `mobile_entry_point`, shared src-tauri | https://v2.tauri.app/start/project-structure/ |
| Android prerequisites | Android Studio, `ANDROID_HOME`, NDK, Rust targets | https://v2.tauri.app/start/prerequisites/ |
| Shared src-tauri strategy | Symlink vs separate vs refactor | https://v2.tauri.app/concept/architecture/ |
| Platform gating | `#[cfg(mobile)]`, OAuth redesign, Stronghold fallback | — |
| Tauri mobile config | `bundle.android`, deep-link, manifest | — |
| Mobile frontend | Vite config, Tailwind scanning, responsive UI | — |
| Android build/test | `tauri android dev`, emulator, APK | https://v2.tauri.app/develop/ |

### Key Decisions (Recorded for When Work Resumes)

| Decision | Recommendation |
|----------|---------------|
| `src-tauri/` strategy | **Symlink** — single source of truth, less maintenance |
| App identifier | **`com.isle.desktop`** — Tauri shared identifier for all platforms |
| OAuth on mobile | **Deep-link custom scheme** (`isle://`) — standard mobile pattern |
| Platform priority | **Android only** — no Mac for iOS dev |
| Project location | **`apps/mobile/`** — isolation, no risk to existing apps |

### Known Blockers
1. `machine-uid` crate may not work on Android — need fallback (e.g., `android_id` via JNI)
2. `tiny_http` embedded OAuth server won't work on mobile — requires full OAuth redesign
3. Deep-link plugin on Android needs custom URI scheme registration in `gen/android/`
4. Tailwind CSS scanning via symlink must be verified for mobile (same pattern as desktop)
5. Android emulator performance on this Mac

## Reference Links
- Tauri mobile prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri develop mobile: https://v2.tauri.app/develop/
- Tauri Google Play distribution: https://v2.tauri.app/distribute/google-play/
- Deep-linking plugin: https://v2.tauri.app/plugin/deep-linking/
- Stronghold plugin (mobile): https://v2.tauri.app/plugin/stronghold/
- Mobile capabilities: https://v2.tauri.app/learn/security/capabilities-for-windows-and-platforms/
- Mobile multi-window: https://v2.tauri.app/learn/mobile-multiwindow/
