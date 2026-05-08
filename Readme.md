<div align="center">

![Isle Logo](apps/desktop/public/Isle-full-logo.svg)

</div>

# Isle — Advanced Habit Tracker

Isle is a modern, high-performance habit tracking application built for consistency and beautifully crafted analytics. It features a stunning glassmorphic UI, robust recurrence logic, and a strict timezone-aware backend.

It is available both as a native desktop application (powered by Tauri) and a web application.

---

rsvg-convert -w 16   -h 16   Isle-icon-black.svg -o icon.iconset/icon_16x16.png
rsvg-convert -w 32   -h 32   Isle-icon-black.svg -o icon.iconset/icon_16x16@2x.png

rsvg-convert -w 32   -h 32   Isle-icon-black.svg -o icon.iconset/icon_32x32.png
rsvg-convert -w 64   -h 64   Isle-icon-black.svg -o icon.iconset/icon_32x32@2x.png

rsvg-convert -w 128  -h 128  Isle-icon-black.svg -o icon.iconset/icon_128x128.png
rsvg-convert -w 256  -h 256  Isle-icon-black.svg -o icon.iconset/icon_128x128@2x.png

rsvg-convert -w 256  -h 256  Isle-icon-black.svg -o icon.iconset/icon_256x256.png
rsvg-convert -w 512  -h 512  Isle-icon-black.svg -o icon.iconset/icon_256x256@2x.png

rsvg-convert -w 512  -h 512  Isle-icon-black.svg -o icon.iconset/icon_512x512.png
rsvg-convert -w 1024 -h 1024 Isle-icon-black.svg -o icon.iconset/icon_512x512@2x.png

## ✨ Features

- **Rich Habit Types**: Supports Positive (build a habit), Negative (break a bad habit), and Composite (grouped routines, e.g., "Morning Routine" with multiple sub-habits).
- **Flexible Recurrences**: Powered by standard iCal `RRULE` parsing. Schedule habits Daily, Weekly (on specific days), or Monthly.
- **Dynamic Dashboard**: Beautiful UI featuring 30-day contribution grids, streak rings, relative time histories, and animated progress visualizations.
- **Strict Timezone Integrity**: Your streak will never break just because you traveled. The backend enforces `X-Timezone` aware boundary checks for "today" based strictly on the user's local context.
- **Secure Authentication**: Implements a robust Google OAuth 2.0 PKCE flow, safely storing refresh tokens in an encrypted local vault (Tauri Stronghold).

---

## 📖 Documentation

### Core Architecture & Design
- **[Architecture](./docs/architecture.md)** — System design, components, and infrastructure
- **[System Flow & Architecture](./docs/system-flow-architecture.md)** — End-to-end runtime flows with architecture diagrams
- **[Application Logic](./docs/application-logic.md)** — Recurrence engine, streak calculation, and timezone handling
- **[Database Schema](./docs/database-schema.md)** — Entity relationships and data model
- **[Semantic Versioning & CI/CD](./docs/semantic-release.md)** — Release strategy, branch flow, and automated versioning
- **[CI/CD with Semantic Release](./docs/ci-cd-semantic.md)** — CI gates, CD release flow, and branch cascade behavior

### Module-Specific Guides
- **[Backend Engineering (Spring Boot)](./services/api/README.md)** — API setup, authentication, recurrence engine
- **[Frontend Engineering (React + Tauri)](./apps/desktop/README.md)** — Web & desktop development, OAuth flow
- **[Infrastructure & Deployment](./infra/README.md)** — Docker, VPS setup, Vercel deployment, CI/CD
- **[Secrets & Security](./infra/secrets/README.md)** — JWT key generation and management

### Project Standards
- **[Contributing](./CONTRIBUTING.md)** — Commit convention and pull request guidelines

### Getting Started
For a quick start guide and project overview, see [Plan.md](./Plan.md).

---

## 📋 License & Security

- **[LICENSE](./LICENSE)** — MIT License
- **[SECURITY](./SECURITY.md)** — Security policy, vulnerability reporting, and best practices
