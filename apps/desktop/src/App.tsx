import { useEffect } from 'react'
import { Switch, Route, Router as WouterRouter } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Toaster } from '@isle/shared'
import { TooltipProvider } from '@isle/shared'
import { ThemeProvider } from '@isle/shared'
import { useAuth } from '@/hooks/use-auth'
import { useOfflineSync } from './hooks/useOfflineSync'
import { useNotifications } from './hooks/useNotifications'
import { useAuthStore } from '@isle/shared'
import { useNavStore } from './store/navStore'
import { useAppNavigate } from '@/hooks/useNavigate'

import NotFound from '@/pages/not-found'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Analytics from '@/pages/Analytics'
import HabitHistory from '@/pages/HabitHistory'
import Profile from '@/pages/Profile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isInitialising } = useAuth()
  const { navigate } = useAppNavigate()

  useEffect(() => {
    if (!isInitialising && !isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, isInitialising, navigate])

  if (isInitialising) return null
  if (!isAuthenticated) return null
  return <Component />
}

function GlobalEffects() {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken && !!state.user)
  const queryClient = useQueryClient()
  useOfflineSync(isAuthenticated)
  useNotifications()

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [queryClient])

  return null
}

// ── Web Router (uses wouter with useHashLocation) ─────────────

function WebRouter() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/analytics">
          <ProtectedRoute component={Analytics} />
        </Route>
        <Route path="/history/:id">
          <ProtectedRoute component={HabitHistory} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  )
}

// ── Tauri Router (uses zustand navStore) ──────────────────────

function TauriPageContent() {
  const path = useNavStore((s) => s.path)

  switch (path) {
    case '/':
      return <Login key={path} />
    case '/dashboard':
      return <ProtectedRoute key={path} component={Dashboard} />
    case '/analytics':
      return <ProtectedRoute key={path} component={Analytics} />
    case '/profile':
      return <ProtectedRoute key={path} component={Profile} />
    default:
      if (path.startsWith('/history/')) {
        return <ProtectedRoute key={path} component={HabitHistory} />
      }
      return <NotFound key={path} />
  }
}

// ── App ───────────────────────────────────────────────────────

function App() {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="isle-ui-theme">
        <TooltipProvider>
          <GlobalEffects />
          {isTauri ? <TauriPageContent /> : <WebRouter />}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
