import { useLocation } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Home, BarChart3, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

const tabs = [
  { path: '/', label: 'TODAY', icon: Home },
  { path: '/dashboard', label: 'ANALYTICS', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
]

function useActiveIndex() {
  const { pathname } = useLocation()
  return tabs.findIndex((t) =>
    t.path === '/' ? pathname === '/' : pathname.startsWith(t.path)
  )
}

export default function BottomNav() {
  const activeIndex = useActiveIndex()
  const prefersReducedMotion = useReducedMotion()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]"
      role="tablist"
      aria-label="Main navigation"
    >
      <div
        className="mx-3 my-2 backdrop-blur-xl bg-background/80
          border border-border/40 rounded-[28px] shadow-lg
          ring-1 ring-black/5"
      >
        <div className="relative flex items-center justify-around py-1 px-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeIndex === index

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === '/'}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                className={`
                  relative z-10 flex flex-col items-center gap-0.5 px-5 py-2
                  rounded-[20px] text-xs font-medium
                  transition-colors duration-200 ease-out
                  min-w-[64px] min-h-[44px] justify-center
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-[20px] bg-primary/15 shadow-sm"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }
                    }
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] leading-tight tracking-wider relative z-10">
                  {tab.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
