<div align="center">

![Isle Logo](public/Isle-logo-blue.svg)

</div>

# Isle — Desktop Frontend (Tauri)

The native desktop variant of the Isle frontend, built with Tauri v2 (Rust). Runs as a standalone `.dmg` (macOS), `.exe` (Windows), or `.AppImage` (Linux).

Part of the `@isle` monorepo — depends on `@isle/shared` for shared types, stores, hooks, and UI components.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Desktop Runtime**: Tauri v2 (Rust)
- **Styling**: Tailwind CSS + Framer Motion (for animations)
- **State Management**: Zustand (routing via navStore, not wouter)
- **Data Fetching**: React Query (TanStack Query v5)
- **Routing**: zustand navStore (state-based, no hash routing)

## Folder Structure

```
apps/desktop/
├── src/
│   ├── api/            # API integration, interceptors, X-Timezone injection
│   ├── components/     # App-specific UI components (layout, HabitCard overlay)
│   ├── hooks/          # useOfflineSync, useNotifications, useStronghold
│   ├── lib/            # stronghold.ts, api-client.ts
│   ├── pages/          # Full page views (Dashboard, History, Settings)
│   ├── store/          # navStore (state-based routing)
│   └── shared-src → ../../packages/shared/src/  # Symlink for Tailwind scanning
└── src-tauri/          # Tauri Rust workspace (shared with mobile)
    ├── src/lib.rs      # Native window logic, OAuth local server, deep linking, Stronghold vault
    ├── src/main.rs     # Entry point
    └── tauri.conf.json # Tauri configuration & permissions
```

> Shared components, hooks, and stores are imported from `@isle/shared` — see [packages/shared/README.md](../../packages/shared/README.md).

## Running Locally

### Prerequisites
Make sure your backend is running, or set `VITE_API_BASE_URL` to the production backend in a `.env.local` file.

```bash
pnpm install
```

### 1. Vite Dev Server (Fastest for UI Dev)
Run the React app in the browser without Tauri. Deep-linking and native features are bypassed.

```bash
pnpm dev
```
Open `http://localhost:1420`.

### 2. Tauri Desktop (with hot-reload)
Run the application inside the Tauri native OS window. Hot-reloading is still active for React changes.

```bash
pnpm tauri dev
```

## Authentication Flow

Isle uses a strict Google OAuth 2.0 PKCE flow. In the desktop variant:

1. User clicks "Sign in with Google"
2. The app starts a local HTTP server on `127.0.0.1:1421` and opens the system browser to Google's consent page, with `redirect_uri=http://127.0.0.1:1421/callback`
3. Google redirects to the local HTTP server; the Rust backend extracts the OAuth code and emits a Tauri event to the webview
4. The frontend exchanges the code for JWT tokens
5. Refresh token is stored in the Tauri Stronghold (encrypted native vault)

In production builds, deep-links (`isle://auth/callback`) are used instead of the local HTTP server, since the bundled `.app` can register with macOS for the `isle://` URL scheme.

## Local API Mocking

The frontend contains offline capabilities via an `offlineStore` queue. If the internet connection drops, habit check-ins are queued locally and automatically synced to the Spring Boot backend once connectivity is restored.
