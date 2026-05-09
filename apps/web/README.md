<div align="center">

![Isle Logo](public/Isle-logo-blue.svg)

</div>

# Isle — Web Frontend

The web-only variant of the Isle frontend. Deployed on Vercel.

## Differences from Desktop

| Aspect | Web | Desktop |
|--------|-----|---------|
| Port | 3000 | 1420 |
| Routing | wouter `useHashLocation` | zustand nav store |
| OAuth flow | Browser popup + `postMessage` | Local HTTP server (dev) / deep-link (prod) |
| Refresh token storage | `sessionStorage` | Tauri Stronghold (encrypted) |
| Tauri dependencies | No runtime deps | Full Tauri v2 runtime |
| Deployment | Vercel (static) | Native .dmg/.exe/.AppImage |

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query v5)
- **Routing**: Wouter (hash-based routing)

## Folder Structure

```
apps/web/
├── src/
│   ├── api/            # API integration, interceptors, X-Timezone injection
│   ├── components/     # UI components (shadcn/ui, habits, layout)
│   ├── lib/            # Utilities, React Query hooks (api-client.ts)
│   ├── pages/          # Full page views (Dashboard, History, etc.)
│   └── store/          # Zustand state stores (auth, habits, offline queue)
```

## Running Locally

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:3000`.

Make sure the backend is running (see `infra/README.md`) and `infra/.env` has the correct `VITE_*` variables.

## Authentication Flow

Isle uses Google OAuth 2.0 PKCE. In the web variant:

1. User clicks "Sign in with Google"
2. A popup window opens to Google's consent page
3. Google redirects to `success.html` (served by the backend)
4. `success.html` sends the OAuth code via `postMessage` to the opener
5. The frontend exchanges the code for JWT tokens
6. Refresh token is stored in `sessionStorage` (cleared on tab close)

## Building for Production

```bash
pnpm build
```

Output goes to `apps/web/dist/`.
