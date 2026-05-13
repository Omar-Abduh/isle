<div align="center">

![Isle Logo](../../apps/desktop/public/Isle-logo-blue.svg)

</div>

# @isle/shared — Shared Workspace Package

Cross-platform code extracted from `apps/web/` and `apps/desktop/` into a single shared package consumed by all apps.

Part of the `@isle` monorepo. Published as a workspace package (`"@isle/shared": "workspace:*"`).

## Contents

### Types (`src/types/`)
- `auth.ts` — User, AuthResponse, TokenPair types
- `habit.ts` — Habit, HabitLog, HabitType, HabitLogEntry

### Stores (`src/store/`)
- `authStore.ts` — Zustand auth state (token management, login/logout)
- `habitStore.ts` — Zustand habit state (CRUD, optimistic updates)
- `offlineStore.ts` — Offline queue for syncing when disconnected

### Hooks (`src/hooks/`)
- `useOAuth.ts` — Google OAuth PKCE flow handler

### Components (`src/components/`)
- **UI** (`ui/`) — 55 shadcn/ui primitives (Button, Card, Dialog, Input, Select, etc.)
- **Habit** (`habit/`) — `HabitCard`, `StreakRing`, `Dashboard`, `HistoryLog`
- **Shared** (`shared/`) — `LoadingScreen`, `ErrorBoundary`, `EmptyState`, `ConfirmDialog`

### Libraries (`src/lib/`)
- `cn.ts` — Tailwind CSS class merge utility (`clsx` + `tailwind-merge`)
- `tauriStoreAdapter.ts` — Tauri Store adapter for Zustand persist middleware

## Usage

```ts
// In any app (apps/web, apps/desktop, apps/mobile):
import { useAuthStore, useHabitStore } from '@isle/shared/store';
import { HabitCard, StreakRing } from '@isle/shared/components/habit';
import { cn } from '@isle/shared/lib';
import type { Habit } from '@isle/shared/types';
```

## Tailwind CSS Scanning

For Tailwind CSS v4 to scan shared component class names, each app has a symlink:

```
apps/web/src/shared-src → ../../packages/shared/src/
apps/desktop/src/shared-src → ../../packages/shared/src/
```

These symlinks are inside the project root so `@tailwindcss/oxide` (which follows symlinks) detects them during build. This ensures shared utility classes (`.text-muted-foreground`, `.bg-primary`, `.flex`, `.gap-4`, etc.) are included in the output CSS.

## Development

```bash
# Build all apps (implicitly builds @isle/shared)
pnpm --filter @isle/web build
pnpm --filter @isle/desktop build

# Typecheck
pnpm --filter @isle/shared run typecheck
```
