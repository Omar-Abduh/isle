import { useLocation, NavLink } from 'react-router-dom'
import { Home, BarChart3, User } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const tabs = [
  { path: '/', label: 'TODAY', icon: Home },
  { path: '/dashboard', label: 'ANALYTICS', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
]

function useActiveIndex() {
  const { pathname } = useLocation()
  return tabs.findIndex((t) =>
    t.path === '/' ? pathname === '/' : pathname.startsWith(t.path),
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
        className="mx-3 mb-2 backdrop-blur-2xl bg-background/70
          border border-border/40 rounded-[32px]
          shadow-2xl shadow-black/10"
      >
        <div className="relative flex items-center justify-around py-1.5 px-1">
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
                  relative z-10 flex flex-col items-center gap-0.5 px-6 py-2
                  rounded-[24px] text-xs font-medium
                  min-w-[64px] min-h-[48px] justify-center
                  tracking-wider select-none
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-[24px] bg-primary/15 shadow-inner"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }
                    }
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] leading-tight relative z-10">
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
