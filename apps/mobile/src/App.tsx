import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore, useHabitStore } from '@isle/shared'
import { useEffect, useRef } from 'react'
import BottomNav from './components/BottomNav'
import HabitsPage from './pages/Habits'
import DashboardPage from './pages/Dashboard'
import ProfilePage from './pages/Profile'
import HabitHistoryPage from './pages/HabitHistory'
import RecentActivityPage from './pages/RecentActivity'
import LoginPage from './pages/Login'
import { listHabits } from './api/habitApi'

const NAV_HEIGHT_PX = 88

function App() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.accessToken)
  const setHabits = useHabitStore((s) => s.setHabits)
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [location.pathname])

  useEffect(() => {
    if (!token) return
    listHabits()
      .then((serverHabits) => {
        if (serverHabits.length > 0) {
          setHabits(serverHabits)
        }
      })
      .catch(() => {})
  }, [token, setHabits])

  if (!user) {
    return <LoginPage />
  }

  const hideNavPaths = ['/history/', '/recent-activity']
  const showNav = !hideNavPaths.some((p) => location.pathname.startsWith(p))

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: showNav ? NAV_HEIGHT_PX : 0 }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HabitsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history/:habitId" element={<HabitHistoryPage />} />
            <Route path="/recent-activity" element={<RecentActivityPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}

export default App
