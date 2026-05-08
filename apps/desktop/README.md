<div align="center">

![Isle Logo](public/Isle-logo-blue.svg)

</div>

# Isle — Frontend Engineering

The frontend is a hybrid application built with React 18, TypeScript, and Vite. It can run as a standard web application in any modern browser, or be compiled into a highly optimized native desktop application for macOS and Windows using Tauri.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Desktop Runtime**: Tauri v2 (Rust)
- **Styling**: Tailwind CSS + Framer Motion (for animations)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query v5)
- **Routing**: Wouter (Lightweight)

## Folder Structure

```
apps/desktop/
├── src/
│   ├── api/            # API integration, interceptors, X-Timezone injection
│   ├── components/     # UI components (shadcn/ui, habits, layout)
│   ├── lib/            # Utilities, React Query hooks (api-client.ts)
│   ├── pages/          # Full page views (Dashboard, History, etc.)
│   └── store/          # Zustand state stores (auth, habits, offline queue)
└── src-tauri/          # Tauri Rust workspace
    ├── src/main.rs     # Native window logic, deep linking, Stronghold vault
    └── tauri.conf.json # Tauri configuration & permissions
```

## Running the Frontend

### Prerequisites
Make sure your backend is running, or set `VITE_API_BASE_URL` to the production backend in a `.env.local` file.

```bash
pnpm install
```

### 1. Web Mode (Fastest for UI Dev)
Run the application completely in the browser. Deep linking and native features are automatically mocked or bypassed (e.g., OAuth redirects are handled via URL parameters instead of OS intents).

```bash
pnpm dev
```
Open `http://localhost:1420`.

### 2. Native Desktop Mode (Tauri)
Run the application inside the Tauri native OS window. Hot-reloading is still active.

```bash
pnpm tauri dev
```

## Authentication Flow

Isle uses a strict Google OAuth 2.0 PKCE flow to prevent authorization code interception. 

When running in Desktop mode, the browser redirects back to a `success.html` page hosted alongside the backend, which immediately fires a custom OS protocol deep-link (`habittracker://auth/callback?code=...`). Tauri intercepts this deep link at the Rust layer and pushes the OAuth code to the React frontend to complete the exchange.

Refresh tokens are securely stored in the Tauri Stronghold (an encrypted native memory vault), ensuring that long-lived credentials cannot be extracted by malicious processes.

## Local API Mocking

The frontend contains offline capabilities via an `offlineStore` queue. If the internet connection drops, habit check-ins are queued locally and automatically synced to the Spring Boot backend once connectivity is restored.
