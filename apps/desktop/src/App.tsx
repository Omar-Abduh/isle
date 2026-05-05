import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { useAuth } from '@/hooks/use-auth'

import NotFound from '@/pages/not-found'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Analytics from '@/pages/Analytics'
import HabitHistory from '@/pages/HabitHistory'
import Profile from '@/pages/Profile'

const queryClient = new QueryClient()

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Redirect to="/" />
  return <Component />
}

function Router() {
  return (
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
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="isle-ui-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
