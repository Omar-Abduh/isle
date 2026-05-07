# Isle — Habit Tracker

A Tauri v2 desktop app (React + TypeScript) backed by a Spring Boot 3.4 REST API, PostgreSQL 16, Nginx, and Google OAuth 2.0 PKCE.

---

## 🏗 Architecture

```text
isle/
├── apps/desktop/          # Tauri + React + Zustand (desktop app)
│   └── src-tauri/         # Rust backend (deep-link, Stronghold, notifications)
├── services/api/          # Spring Boot 3.4 REST API (Java 21)
└── infra/                 # Docker Compose, Nginx, secrets, .env configuration
```

### Auth Flow (PKCE)
1. `useOAuth.startLogin()` → opens system browser with code_challenge (S256)
2. Google → redirects to `https://your-domain.com/success.html?code=…&state=…` (or localhost)
3. `success.html` → fires `habittracker://auth/callback?code=…&state=…` (deep link)
4. Tauri deep-link → `useOAuth.ts` → `POST /api/v1/auth/exchange`
5. Backend → verifies PKCE, issues access JWT (15 min) + opaque refresh (30 days)
6. Frontend → access token saved to Zustand | refresh token saved to encrypted Tauri Stronghold vault

---

## 🛠 Required Toolchain

| Tool     | Install                                                |
|----------|--------------------------------------------------------|
| Rust     | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` |
| Node.js  | `nvm install 20` (Min v20 LTS)                         |
| pnpm     | `npm i -g pnpm` (Min v9)                               |
| Java     | `sdk install java 21-tem` (Min v21 LTS)                |
| Docker   | [Docker Desktop](https://docs.docker.com/engine/install/) |

---

## 🔐 Configuration (One-Time Setup)

Both the backend and frontend are configured via a single shared `.env` file located in the `infra/` folder.

### 1. Google Cloud Console
1. Go to Google Cloud Console → Create Project "Isle"
2. **APIs & Services** → OAuth consent screen → External
3. **Credentials** → Create OAuth Client ID → **Desktop app**
4. Add Authorized redirect URIs (e.g. `http://localhost:8081/success.html` for local testing)
5. Keep your Client ID and Client Secret ready.

### 2. Generate RSA Keypair
This is required to sign JWT tokens. Run from the project root:
```bash
mkdir -p infra/secrets

# Generate PKCS8 keys for Spring Boot
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM -out infra/secrets/jwt_private.pem
openssl rsa -in infra/secrets/jwt_private.pem -pubout -out infra/secrets/jwt_public.pem

chmod 600 infra/secrets/*.pem
```

### 3. Setup Global `.env`
Create `infra/.env` (or modify the existing one). Make sure you fill in the Google credentials:

```dotenv
# ─── PostgreSQL ───────────────────────────────────────────────────────────────
POSTGRES_DB=habittracker
POSTGRES_USER=ht_user
POSTGRES_PASSWORD=devpassword

# ─── Spring Boot ──────────────────────────────────────────────────────────────
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/habittracker
SPRING_DATASOURCE_USERNAME=ht_user
SPRING_DATASOURCE_PASSWORD=devpassword

JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=30

# Google OAuth — Client Secret is BACKEND ONLY, never in frontend
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ─── Tauri / Frontend (Vite build-time variables) ────────────────────────────
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_REDIRECT_URI=http://localhost:8081/success.html
VITE_DEEP_LINK_SCHEME=habittracker

# Security allowlists
GOOGLE_ALLOWED_REDIRECT_URIS=http://localhost:8081/success.html
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:3000,http://127.0.0.1:3000,tauri://localhost,http://tauri.localhost
PUBLIC_API_DOCS_ENABLED=true
COMPOSE_PROJECT_NAME=isle
```

---

## 💻 Running Locally (Development)

### 1. Start the Backend Stack
We use Docker Compose to run the PostgreSQL database, the Spring Boot Java Backend, and an Nginx reverse proxy. The API will be exposed on **port 8081**.

```bash
# From project root
cd infra
docker-compose up -d --build
```
*Wait ~1-2 minutes for the database to migrate and Spring Boot to start.*
**Test it:** Open **`http://localhost:8081/swagger-ui.html`** in your browser. You should see the interactive API documentation!

### 2. Start the Frontend
The frontend uses Vite and lives in `apps/desktop`. It reads configuration directly from `infra/.env`.

```bash
# In a new terminal tab, from project root
cd apps/desktop
pnpm install

# Option A: Run as a standard web app (in your browser)
pnpm dev

# Option B: Run native desktop shell (with hot reloading)
pnpm tauri dev
```
> **Note:** If working mostly on UI/UX, running `pnpm dev` in a browser is much faster.

### 3. Verify Local Web Auth + API
1. Open `http://localhost:3000`.
2. Sign in with Google. Google must redirect to `http://localhost:8081/success.html`.
3. Create a habit from the dashboard. The request should hit `POST http://localhost:8081/api/v1/habits`.
4. Refresh the browser. The app should silently call `/api/v1/auth/refresh` and stay logged in.

If the popup closes but the app stays logged out, confirm these values match exactly in `infra/.env`, Google Cloud Console, and the backend container environment:
```dotenv
VITE_REDIRECT_URI=http://localhost:8081/success.html
GOOGLE_ALLOWED_REDIRECT_URIS=http://localhost:8081/success.html
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:3000,http://127.0.0.1:3000,tauri://localhost,http://tauri.localhost
PUBLIC_API_DOCS_ENABLED=true
```

For Vercel web builds, set the frontend project environment variables:
```dotenv
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_REDIRECT_URI=https://api.yourdomain.com/success.html
```

Then set the API/backend environment variables:
```dotenv
GOOGLE_ALLOWED_REDIRECT_URIS=https://api.yourdomain.com/success.html
CORS_ALLOWED_ORIGIN_PATTERNS=https://your-vercel-project.vercel.app,https://*.vercel.app
```

---

## 📦 Building Native Desktop App (macOS `.dmg`)

To share your application, you can compile the app down to a native installer `.dmg`.

### 1. Compile the Application
Ensure the backend is configured securely in `infra/.env` (change `VITE_API_BASE_URL` to your production URL if packaging for production!).
```bash
cd apps/desktop
pnpm install
pnpm dlx @tauri-apps/cli build
```

### 2. Find and Open Your `.dmg`
- Wait for the Rust compiler to finish building everything.
- Your installer will be generated at: `apps/desktop/src-tauri/target/release/bundle/macos/Isle.dmg`
- Double-click `Isle.dmg` to mount it.
- Drag "Isle" into your **Applications** folder.
- **MacOS Gatekeeper Note:** On the first run, macOS might block the unassigned application. If so, right-click (or Control-click) "Isle" in Applications and click **Open**.

---

## 🚀 Hosting on a VPS (Production)

Deploying to production involves pushing your codebase to a Linux VPS and spinning up Docker along with a real SSL certificate.

### 1. Prepare VPS & Source Code
SSH into your Linux VPS (Ubuntu/Debian recommended).
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin certbot openssl git
sudo usermod -aG docker $USER
```
Relogin (or type `su - $USER`) to apply docker group permissions.

Clone your repository to the server:
```bash
git clone https://github.com/your-username/isle.git
cd isle/infra
```

### 2. Configure Production Secrets
1. Regenerate your RSA keypair exclusively for the server in `infra/secrets/` (same exact command as Setup Step 2).
2. Copy `.env` to `.env.prod`. **CRITCAL EDITS:**
   - Change `POSTGRES_PASSWORD` and `SPRING_DATASOURCE_PASSWORD` to a highly secure randomly generated string.
   - Update `VITE_API_BASE_URL` to `https://api.yourdomain.com`.
   - Update `VITE_REDIRECT_URI` to `https://api.yourdomain.com/success.html`.
   - Set `GOOGLE_ALLOWED_REDIRECT_URIS=https://api.yourdomain.com/success.html`.
   - Set `CORS_ALLOWED_ORIGIN_PATTERNS` to your production web origins, for example `https://your-vercel-project.vercel.app,https://app.yourdomain.com`.
   - Keep `PUBLIC_API_DOCS_ENABLED=false` unless you intentionally want public Swagger docs.

### 3. Generate TLS Certificate (HTTPS)
```bash
# Nginx must not be running yet! (We need port 80 open)
sudo certbot certonly --standalone -d api.yourdomain.com --agree-tos -m admin@yourdomain.com
```

### 4. Adjust Nginx & Start the Service
Open `infra/nginx.conf.prod` (or modify `nginx.conf` and map volume appropriately in `docker-compose.yml`) to use port 443 and SSL context. Check docker-compose network bindings.
Finally, start your production environment:
```bash
docker-compose --env-file .env.prod up -d --build
```
Access `https://api.yourdomain.com/swagger-ui.html` to confirm it is live!

---

## 🩺 Useful Commands

**View Backend Logs:**
`docker logs -f isle-backend-1`

**Rebuild Backend without cache:**
`docker-compose build --no-cache backend && docker-compose up -d --build backend`

**Database Access (from host):**
`docker exec -it isle-db-1 psql -U ht_user -d habittracker`
