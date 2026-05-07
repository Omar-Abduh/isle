# Isle — Habit Tracker

A Tauri v2 desktop app (React + TypeScript) backed by a Spring Boot 3.4 REST API,
PostgreSQL 16, Nginx, and Google OAuth 2.0 PKCE.

---

## Architecture

```
isle/
├── apps/desktop/          # Tauri + React + Zustand (desktop app)
│   └── src-tauri/         # Rust backend (deep-link, Stronghold, notifications)
├── services/api/          # Spring Boot 3.4 REST API (Java 21)
└── infra/                 # Docker Compose, Nginx, secrets, success.html
```

### Auth Flow (PKCE)
```
1. useOAuth.startLogin()  →  opens system browser with code_challenge (S256)
2. Google                 →  redirects to https://your-vps/success.html?code=…&state=…
3. success.html           →  fires habittracker://auth/callback?code=…&state=…  (deep link)
4. Tauri deep-link        →  use-auth.ts → POST /api/v1/auth/exchange
5. Backend                →  verifies PKCE, issues RS256 access JWT (15 min) + opaque refresh (30 days)
6. Frontend               →  access token → Zustand memory | refresh token → Tauri Stronghold vault
```

---

## Required Toolchain

| Tool     | Min Version | Install                                                |
|----------|-------------|--------------------------------------------------------|
| Rust     | ≥ 1.78      | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` |
| Node.js  | ≥ 20 LTS    | `nvm install 20`                                       |
| pnpm     | ≥ 9         | `npm i -g pnpm`                                        |
| Java     | ≥ 21 LTS    | `sdk install java 21-tem`                              |
| Maven    | ≥ 3.9       | `sdk install maven`                                    |
| Docker   | ≥ 26        | https://docs.docker.com/engine/install/               |
| psql     | ≥ 16        | `sudo apt install postgresql-client`                   |

> Spring Boot 3.4+ is **mandatory** — `logging.structured.format.console: ecs` is a 3.4 feature.

---

## Step 1 — Google Cloud Console (one-time)

1. https://console.cloud.google.com → Create Project → **Isle**
2. APIs & Services → OAuth consent screen → External → fill app name + support email
3. Credentials → Create OAuth Client ID → **Desktop app** → Name: `Isle Desktop`
4. Add Authorized redirect URIs:
   - `https://your-domain.com/success.html` ← production
   - `http://localhost:8888/auth/callback` ← dev only
5. Copy **Client ID** → goes in backend `.env` AND `VITE_GOOGLE_CLIENT_ID`
6. Copy **Client Secret** → goes in backend `.env` **ONLY** — never in frontend

---

## Step 2 — Generate RSA Keypair (once)

```bash
mkdir -p infra/secrets

# PKCS8 format required by Spring Boot KeyFactory
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM \
  -out infra/secrets/jwt_private.pem
openssl rsa -in infra/secrets/jwt_private.pem -pubout \
  -out infra/secrets/jwt_public.pem

chmod 600 infra/secrets/*.pem
```

> `infra/secrets/*.pem` is gitignored. In production they are Docker secrets — not env vars.

---

## Step 3 — Development

### 3a. Start backend

```bash
# Start a local Postgres
docker run -d --name isle-db \
  -e POSTGRES_DB=habittracker \
  -e POSTGRES_USER=ht_user \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 postgres:16-alpine

# Export env vars (add to ~/.bashrc or use direnv for convenience)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/habittracker
export SPRING_DATASOURCE_USERNAME=ht_user
export SPRING_DATASOURCE_PASSWORD=devpassword
export JWT_PRIVATE_KEY_PATH=$(pwd)/infra/secrets/jwt_private.pem
export JWT_PUBLIC_KEY_PATH=$(pwd)/infra/secrets/jwt_public.pem
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

cd services/api
mvn spring-boot:run

# Smoke test
curl http://localhost:8080/actuator/health
# → {"status":"UP"}
```

### 3b. Run all tests

```bash
cd services/api
mvn verify        # unit + integration (Testcontainers spins up a fresh DB)
# All 6 tests should pass
```

### 3c. Start frontend — web mode (fastest)

```bash
cd apps/desktop
pnpm install

cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_REDIRECT_URI=http://localhost:1420
VITE_DEEP_LINK_SCHEME=habittracker
EOF

pnpm dev   # http://localhost:1420
```

> In web mode the OAuth deep-link is bypassed. After Google redirects back, the
> page detects `?code=` in the URL and calls `handleOAuthCallback` automatically.

### 3d. Start frontend — Tauri desktop mode

```bash
cd apps/desktop
pnpm install      # also installs Rust crates on first run (~10 min)
pnpm tauri dev    # opens native window with hot-reload
```

---

## Step 4 — Production Deployment (VPS)

### 4a. Prepare server

```bash
# Ubuntu 22.04+
sudo apt update && sudo apt install -y docker.io docker-compose-plugin certbot
sudo usermod -aG docker $USER   # re-login after
```

### 4b. Clone + configure

```bash
git clone https://github.com/your-username/isle.git
cd isle/infra

cp .env.example .env
nano .env
# Required edits:
#   POSTGRES_PASSWORD        → strong random string (min 32 chars)
#   GOOGLE_CLIENT_ID         → from Google Cloud Console
#   GOOGLE_CLIENT_SECRET     → from Google Cloud Console
#   VITE_API_BASE_URL        → https://your-domain.com
#   VITE_REDIRECT_URI        → https://your-domain.com/success.html

# Copy JWT keypair (generated in Step 2) or generate fresh on VPS:
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM \
  -out secrets/jwt_private.pem
openssl rsa -in secrets/jwt_private.pem -pubout -out secrets/jwt_public.pem
chmod 600 secrets/*.pem

# Replace placeholder domain in nginx.conf
sed -i 's/YOUR_DOMAIN/your-domain.com/g' nginx.conf
```

### 4c. TLS certificate

```bash
# Nginx must NOT be running yet
sudo certbot certonly --standalone \
  -d your-domain.com \
  --email admin@your-domain.com \
  --agree-tos --no-eff-email
```

### 4d. Start

```bash
docker compose up -d

# Verify everything
curl https://your-domain.com/actuator/health
# → {"status":"UP"}

docker compose logs backend | grep -E "migration|Flyway|Started"
# → Successfully applied 2 migrations to schema "habit_tracker"
# → Started HabitTrackerApplication in X seconds

docker compose ps
# All 3 services: db (healthy), backend (running), webserver (running)
```

### 4e. SSL auto-renewal

```bash
# sudo crontab -e
0 0,12 * * * certbot renew --quiet && docker exec $(docker ps -qf "name=isle-webserver") nginx -s reload
```

### 4f. Daily DB backup

```bash
# sudo crontab -e  (keeps last 7 days)
0 2 * * * docker exec $(docker ps -qf "name=isle-db") pg_dump -U ht_user habittracker | gzip > /backups/isle_$(date +\%Y\%m\%d).sql.gz && find /backups -name "*.sql.gz" -mtime +7 -delete
```

### 4g. Update / redeploy

```bash
cd ~/isle && git pull
cd infra
docker compose down
docker compose up --build -d
docker compose logs -f backend   # watch Flyway, then Ctrl+C
```

---

## Step 5 — Build Desktop Releases (CI)

Push a version tag — GitHub Actions compiles `.dmg`, `.exe`, `.AppImage` automatically:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

**Required GitHub Secrets** (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `VITE_API_BASE_URL` | `https://your-domain.com` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `VITE_REDIRECT_URI` | `https://your-domain.com/success.html` |

---

## Environment Variables

| Variable | Used By | Sensitivity | Notes |
|----------|---------|-------------|-------|
| `POSTGRES_DB` | DB, Backend | Low | Database name |
| `POSTGRES_USER` | DB, Backend | Medium | DB username |
| `POSTGRES_PASSWORD` | DB, Backend | **HIGH** | Min 32 chars |
| `SPRING_DATASOURCE_URL` | Backend | Low | `jdbc:postgresql://db:5432/habittracker` |
| `SPRING_DATASOURCE_USERNAME` | Backend | Medium | Same as POSTGRES_USER |
| `SPRING_DATASOURCE_PASSWORD` | Backend | **HIGH** | Same as POSTGRES_PASSWORD |
| `JWT_PRIVATE_KEY_PATH` | Backend | **CRITICAL** | `/run/secrets/jwt_private` (Docker secret) |
| `JWT_PUBLIC_KEY_PATH` | Backend | High | `/run/secrets/jwt_public` (Docker secret) |
| `JWT_ACCESS_EXPIRY_MINUTES` | Backend | Low | Default: 15 |
| `JWT_REFRESH_EXPIRY_DAYS` | Backend | Low | Default: 30 |
| `GOOGLE_CLIENT_ID` | Backend + Frontend | Medium | Safe in frontend bundle |
| `GOOGLE_CLIENT_SECRET` | **Backend ONLY** | **CRITICAL** | Never in frontend |
| `VITE_API_BASE_URL` | Frontend | Low | `https://your-domain.com` |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Medium | Same as GOOGLE_CLIENT_ID |
| `VITE_REDIRECT_URI` | Frontend | Low | `https://your-domain.com/success.html` |
| `VITE_DEEP_LINK_SCHEME` | Frontend | Low | `habittracker` |

---

## API Reference

Base path: `/api/v1/`. All authenticated endpoints require `Authorization: Bearer <access_token>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/exchange` | No | Exchange OAuth code + PKCE verifier |
| POST | `/auth/refresh` | No | Rotate refresh token |
| POST | `/auth/logout` | Yes | Revoke all refresh tokens |
| GET | `/habits` | Yes | List habits (paginated) |
| POST | `/habits` | Yes | Create habit |
| PUT | `/habits/{id}` | Yes | Update habit |
| DELETE | `/habits/{id}` | Yes | Archive habit |
| POST | `/logs` | Yes | Log completion (accepts past timestamps for offline sync) |
| GET | `/habits/{id}/logs` | Yes | Completion history |
| GET | `/habits/{id}/stats` | Yes | Streak + 30-day completion rate |

---

## Troubleshooting

**Flyway migration fails on first start**
Postgres isn't ready yet. Run `docker compose restart backend`.

**401 on all API requests / JWT decode error**
Key mismatch — regenerate the keypair and restart.
```bash
# Quick verification
openssl dgst -sha256 -sign infra/secrets/jwt_private.pem /dev/null | \
  openssl dgst -sha256 -verify infra/secrets/jwt_public.pem -signature /dev/stdin /dev/null
# Should print: Verified OK
```

**Deep link not opening the app (macOS)**
```bash
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Isle.app
```

**Stronghold vault corrupted (dev only)**
```bash
rm ~/Library/Application\ Support/com.habittracker.app/isle.stronghold   # macOS
rm ~/.local/share/com.habittracker.app/isle.stronghold                     # Linux
```
Then re-login.

**Offline queue stuck / not syncing**
Open dev console: `useOfflineStore.getState().clear()` to discard the queue.
