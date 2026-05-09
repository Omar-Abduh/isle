# Tauri Mobile Support — Search & Implementation Plan

## Objective
Add `apps/mobile/` (Android) to the Isle monorepo, sharing the Rust backend and frontend code without breaking existing `apps/web/` or `apps/desktop/`.

---

## Phase 0: Completed Work (Pre-Mobile)

Before mobile work begins, the following monorepo restructuring has been completed:

### ✅ pnpm Workspace Setup
- Created `pnpm-workspace.yaml` with `apps/*` and `packages/*` as workspace globs
- Renamed packages to `@isle/web`, `@isle/desktop`, `@isle/shared` (scoped naming)
- Installed all dependencies from single root `pnpm-lock.yaml`
- Removed stale nested lockfiles (`apps/web/pnpm-lock.yaml`, `apps/web/package-lock.json`, etc.)

### ✅ Shared Package (`packages/shared/`)
- Scaffolded `@isle/shared` with TypeScript, tsconfig, package.json
- Extracted ~85 shared files from both apps:
  - **Types**: `auth.ts`, `habit.ts`
  - **Libraries**: `cn.ts`, `tauriStoreAdapter.ts`
  - **Stores**: `authStore.ts`, `habitStore.ts`, `offlineStore.ts`
  - **Hooks**: `useOAuth.ts`, useNavigate pattern
  - **Components**: 55 shadcn/ui primitives, habit components (`HabitCard`, `StreakRing`, `Dashboard`, `HistoryLog`)
  - **Shared components**: `LoadingScreen`, `ErrorBoundary`, etc.

### ✅ App-Specific Code (Kept in Apps)
- `apps/web/src/api/` — `api-client.ts` (web-specific interceptors)
- `apps/desktop/src/hooks/` — `useOfflineSync.ts`, `useNotifications.ts`, `useStronghold.ts`
- `apps/desktop/src/lib/` — `stronghold.ts` (Tauri native integration)
- `apps/desktop/src/store/` — `navStore.ts` (replaces wouter)
- `apps/desktop/src-tauri/` — Rust backend (`lib.rs`, `Cargo.toml`, `tauri.conf.json`)

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
- `apps/web/` deployed on Vercel with:
  - `pnpm-lock.yaml` symlink → `../../pnpm-lock.yaml` (for pnpm detection)
  - `vercel.json` with `installCommand: "pnpm install"` (to bypass frozen-lockfile issue)
  - `packageManager` field removed (was causing confusion with pnpm v10 vs v11)
- Build verified: web app deploys successfully

### ✅ Git Branch
- Feature branch: `feat/mobile-support`
- 7 commits with Conventional Commits format
- Pushed to `origin`

---

## Phase 1: Research (Topics to Investigate)

### 1.1 Tauri 2.0 Mobile Architecture
- [ ] How does `tauri android init` work? What files does it generate?
- [ ] Can we run `tauri android init` inside `apps/mobile/` with an existing `src-tauri/` reference?
- [ ] What's the `#[cfg_attr(mobile, tauri::mobile_entry_point)]` annotation pattern?
- [ ] How does Tauri share a single `src-tauri/` between desktop and mobile? (vs. separate)
- [ ] Project structure docs: https://v2.tauri.app/start/project-structure/

### 1.2 Android Prerequisites (local environment audit)
- [ ] Is Android Studio installed? (`JAVA_HOME`)
- [ ] Are `ANDROID_HOME` and `NDK_HOME` set?
- [ ] Android SDK Platform / Build-Tools / Platform-Tools installed?
- [ ] NDK (side-by-side) version?
- [ ] Rust Android targets added? (`rustup target list --installed`):
  - `aarch64-linux-android`, `armv7-linux-androideabi`
  - `i686-linux-android`, `x86_64-linux-android`
- [ ] Vite config needs `TAURI_DEV_HOST` for mobile dev server
- [ ] Prerequisites docs: https://v2.tauri.app/start/prerequisites/

### 1.3 Shared `src-tauri/` Strategy
- [ ] Option A: **Symlink** `apps/mobile/src-tauri/` → `../desktop/src-tauri/`
  - Single Rust source, one Cargo.toml
  - Tauri config (`tauri.conf.json`) must differ (mobile has no windows)
  - `tauri android init` might overwrite gen/ folder — need to test
- [ ] Option B: **Separate** `apps/mobile/src-tauri/` with shared Rust lib
  - Copy `apps/desktop/src-tauri/`, extract shared logic into a workspace crate
  - More flexible but more duplication
- [ ] Option C: **Refactor desktop** `src-tauri/` to be mobile-aware
  - Add `#[cfg(mobile)]` / `#[cfg(desktop)]` conditionals
  - Single `src-tauri/` directory shared by both
- [ ] Key docs: https://v2.tauri.app/concept/architecture/

### 1.4 Mobile-Specific Rust Platform Gating
- [ ] `#[cfg(target_os = "android")]` vs `#[cfg(mobile)]` patterns
- [ ] Desktop code that can't run on mobile:
  - `tiny_http` embedded OAuth server → mobile needs custom tabs / ASWebAuthenticationSession
  - `tauri-plugin-deep-link` works on mobile (custom URI scheme)
  - `tauri-plugin-stronghold` works on mobile ✓
  - `tauri-plugin-store` works on mobile ✓
  - `tauri-plugin-notification` works on mobile ✓
  - `tauri-plugin-shell` works on mobile (partial)
- [ ] OAuth flow redesign: replace embedded HTTP server with deep-link + custom tab
- [ ] Stronghold key derivation: `machine-uid` may not work on mobile — need fallback

### 1.5 Tauri Config for Mobile
- [ ] `tauri.conf.json` mobile sections:
  - `bundle.android` — versionCode, minSdkVersion, icons
  - `plugins.deep-link.mobile` — custom URI schemes
  - `app.security` — CSP may differ on mobile
- [ ] Identifier must match across platforms (`com.isle.mobile` or keep `com.isle.desktop`?)
- [ ] Android-specific: `AndroidManifest.xml` in `gen/android/`
- [ ] Icons: `pnpm tauri icon` generates mobile icons too

### 1.6 Frontend for Mobile (`apps/mobile/`)
- [ ] Vite config for mobile (port 1420, TAURI_DEV_HOST)
- [ ] How to use `@isle/shared` from mobile app
- [ ] Mobile-specific components vs. shared components
- [ ] Tailwind CSS scanning via symlink (`src/shared-src` pattern from desktop)
- [ ] Responsive UI: mobile needs touch-friendly layout
- [ ] `useNotifications.ts` — mobile notifications via `tauri-plugin-notification`
- [ ] `useOfflineSync.ts` — same logic, works on mobile
- [ ] `api-client.ts` — same API base URL, works on mobile

### 1.7 Building & Testing Android
- [ ] `pnpm tauri android dev` — development on emulator
- [ ] `pnpm tauri android build --apk` — release APK
- [ ] Android emulator setup (AVD)
- [ ] Debugging: `chrome://inspect` for WebView
- [ ] Deep-link testing: `adb shell am start -d "isle://..."`

---

## Phase 2: Implementation Steps

### Step 1: Audit Local Environment
```bash
# Check Java
echo $JAVA_HOME
java --version

# Check Android SDK
echo $ANDROID_HOME
ls $ANDROID_HOME/platforms/
ls $ANDROID_HOME/ndk/

# Check Rust targets
rustup target list --installed | grep android

# Install missing targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### Step 2: Create `apps/mobile/` Scaffold
- Copy `apps/desktop/` structure as starting point
- Remove app-specific files (HabitCard, pages, layout)
- Set up `@isle/shared` dependency

### Step 3: Initialize Android Target
```bash
cd apps/mobile
pnpm tauri android init
```
- This creates `gen/android/` with Gradle project
- Generates `AndroidManifest.xml`, build configs

### Step 4: Configure Shared `src-tauri/`
**Preferred approach: Symlink** (Option A)
```bash
# Remove auto-generated src-tauri in mobile
rm -rf apps/mobile/src-tauri
# Symlink to desktop's src-tauri
ln -s ../desktop/src-tauri apps/mobile/src-tauri
```
- Update `tauri.conf.json` inside the shared `src-tauri/` to include mobile config
- Add `bundle.android` section
- Add `plugins.deep-link.mobile` section
- Platform-gate desktop-only Rust code with `#[cfg(desktop)]`

### Step 5: Platform-Gate Rust Code
In `apps/desktop/src-tauri/src/lib.rs`:
- `#[cfg(desktop)]` on `start_oauth_server` (tiny_http can't run on mobile)
- `#[cfg(desktop)]` on `get_machine_id_cmd` (if machine-uid doesn't work on mobile)
- Add `#[cfg_attr(mobile, tauri::mobile_entry_point)]` to `run()`
- On mobile, OAuth redirect uses deep-link instead of embedded server

### Step 6: Configure Mobile Vite
```ts
// apps/mobile/vite.config.ts
import { defineConfig } from "vite";
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  envDir: path.resolve(__dirname, "../../infra"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
  },
});
```

### Step 7: Wire Up Shared Code
- Add `@isle/shared` dependency in `apps/mobile/package.json`
- Create `apps/mobile/src/shared-src` symlink → `../../packages/shared/src/` (for Tailwind)
- Import components, stores, hooks from `@isle/shared`
- Set up mobile-specific routing (if different from desktop)

### Step 8: Mobile-Specific Frontend
- Responsive layout for small screens
- Touch-friendly interactions
- Mobile-adaptive navigation (bottom tabs vs sidebar)

### Step 9: Build & Test
```bash
# Development
cd apps/mobile && pnpm tauri android dev

# Build APK
pnpm tauri android build --apk
```

---

## Key Decisions to Make

| Decision | Options | Recommendation |
|---|---|---|
| `src-tauri/` strategy | Symlink vs Separate | **Symlink** — single source of truth, less maintenance |
| App identifier | `com.isle.desktop` vs `com.isle.mobile` | **`com.isle.desktop`** — Tauri shared identifier for all platforms |
| OAuth on mobile | Custom tab vs embedded server | **Deep-link custom scheme** (`isle://`) — standard mobile pattern |
| Android first or both | Android only vs Android+iOS | **Android only** — user preference (no Mac for iOS dev) |
| `apps/mobile/` or refactor desktop | New dir vs refactor | **`apps/mobile/`** — isolation, no risk to existing apps |

## Risks & Blockers
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
