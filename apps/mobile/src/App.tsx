import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@isle/shared'
import BottomNav from './components/BottomNav'
import HabitsPage from './pages/Habits'
import DashboardPage from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import LoginPage from './pages/Login'

const NAV_HEIGHT_PX = 72

function App() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <main
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: NAV_HEIGHT_PX + 'px' }}
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HabitsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
