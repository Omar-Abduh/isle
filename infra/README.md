# Infrastructure & Deployment

This directory contains the Docker Compose setup, Nginx configuration, and environment configurations for deploying the Isle Habit Tracker.

The Isle application consists of two parts:
1. **Frontend**: A React/Vite application (deployed via Vercel).
2. **Backend**: A Spring Boot API and PostgreSQL database (deployed on a VPS using Docker).

---

## 1. Backend Deployment (VPS)

Deploy the Spring Boot API, PostgreSQL database, and an Nginx reverse proxy on a Linux VPS (Ubuntu/Debian).

### Prerequisites
SSH into your VPS and install Docker:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin certbot openssl git
sudo usermod -aG docker $USER
```

### Configuration
Clone the repository and set up your production environment variables:
```bash
git clone https://github.com/your-username/isle.git
cd isle/infra

# Create your production .env
cp .env.example .env.prod
```

Edit `.env.prod`:
- `POSTGRES_PASSWORD`: Use a strong, random 32-character string.
- `SPRING_DATASOURCE_PASSWORD`: Must exactly match `POSTGRES_PASSWORD`.
- `GOOGLE_ALLOWED_REDIRECT_URIS`: Your Vercel frontend URL (e.g., `https://isle.vercel.app/success.html`).
- `CORS_ALLOWED_ORIGIN_PATTERNS`: Your Vercel domain (e.g., `https://isle.vercel.app`).

### Generate JWT RSA Keys
The backend requires RSA keys to sign and verify JWT tokens.
```bash
mkdir -p secrets
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM -out secrets/jwt_private.pem
openssl rsa -in secrets/jwt_private.pem -pubout -out secrets/jwt_public.pem
chmod 600 secrets/*.pem
```
*(For more details on secrets, see [secrets/README.md](./secrets/README.md))*

### TLS / HTTPS Setup
1. Generate an SSL certificate using Certbot (ensure port 80 is open and Nginx is not running yet).
```bash
sudo certbot certonly --standalone -d api.yourdomain.com --agree-tos -m admin@yourdomain.com
```
2. Update `nginx.conf` (or create an `nginx.conf.prod`) to map to `/etc/letsencrypt/live/api.yourdomain.com/`.

### Start the Services
```bash
docker-compose --env-file .env.prod up -d --build
```
Your API will now be live securely at `https://api.yourdomain.com`.

---

## 2. Frontend Deployment (Vercel)

The React web application can be deployed seamlessly to Vercel for free.

1. Connect your GitHub repository to Vercel.
2. Select the `apps/desktop` directory as the Root Directory.
3. Use the following build settings (Vercel auto-detects Vite):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` or `pnpm run build`
   - **Output Directory**: `dist`
4. Configure the following Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com` (Your VPS URL)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `VITE_REDIRECT_URI`: `https://your-vercel-project.vercel.app/success.html`
5. Click **Deploy**.

---

## Database Management

### Daily Backup Cron Job
Keep your database safe with automated backups:
```bash
# Add to: sudo crontab -e
0 2 * * * docker exec $(docker ps -qf "name=isle-db") pg_dump -U ht_user habittracker | gzip > /backups/isle_$(date +\%Y\%m\%d).sql.gz && find /backups -name "*.sql.gz" -mtime +7 -delete
```

### Seeding Data
If you need to seed dummy data for a user on your VPS:
```bash
docker cp seed.sql $(docker ps -qf "name=isle-db"):/seed.sql
docker exec -it $(docker ps -qf "name=isle-db") psql -U ht_user -d habittracker -f /seed.sql
```

---

## 3. Desktop Application Build (Tauri)

The frontend can be compiled into a native `.dmg` (macOS) or `.exe` (Windows) using Tauri.

### Local Compilation
Ensure your `apps/desktop/.env.local` points to your production server URL (`VITE_API_BASE_URL`).
```bash
cd apps/desktop
pnpm install
pnpm tauri build
```
The compiled installer will be available in `apps/desktop/src-tauri/target/release/bundle/`.

### GitHub Actions (CI/CD)
To automate the desktop app builds, the repository includes a GitHub Action (`.github/workflows/ci.yml`) that compiles the native application on every new version tag.

1. Create the following secrets in **GitHub Settings → Secrets and variables → Actions**:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com`
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `VITE_REDIRECT_URI`: `https://your-vercel-project.vercel.app/success.html`
2. Push a new semantic version tag to trigger the build:
```bash
git tag v1.0.0
git push origin v1.0.0
```
3. GitHub Actions will build and attach the `.dmg`, `.exe`, and `.AppImage` to a new GitHub Release.
