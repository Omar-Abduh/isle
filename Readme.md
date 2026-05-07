# Isle — Habit Tracker

A Tauri desktop app (React + TypeScript) backed by a Spring Boot REST API.

## Architecture

```
isle-project/
├── apps/desktop/        # Tauri + React frontend
├── services/api/        # Spring Boot backend (Java 21)
└── infra/               # Docker Compose, Nginx, CI
```

## Quick Start

### 1. Backend
```bash
# Generate JWT keys
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM -out infra/secrets/jwt_private.pem
openssl rsa -in infra/secrets/jwt_private.pem -pubout -out infra/secrets/jwt_public.pem

# Copy and fill env
cp infra/.env.example infra/.env

# Start everything
cd infra && docker compose up -d
```

### 2. Frontend (dev)
```bash
cd apps/desktop
pnpm install
cp .env.example .env.local    # set VITE_API_BASE_URL etc.
pnpm tauri dev                # desktop
# or: pnpm dev               # browser only
```

## Auth Flow (PKCE)
1. User clicks "Continue with Google" → `useOAuth.startLogin()` opens the system browser
2. Google redirects to `https://your-vps/success.html?code=…`
3. success.html fires `habittracker://auth/callback?code=…` deep link
4. Tauri catches the deep link → `use-auth.ts` → `handleCallback()` → POST `/api/v1/auth/exchange`
5. Access token stored in memory (Zustand), refresh token stored in Stronghold

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL e.g. `https://api.yourapp.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_REDIRECT_URI` | `https://your-vps/success.html` |
| `GOOGLE_CLIENT_ID` | Same client ID on the backend |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
