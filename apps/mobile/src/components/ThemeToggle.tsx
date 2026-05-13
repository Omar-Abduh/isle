import { Sun, Moon, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@isle/shared'
import { useCallback } from 'react'

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleChange = useCallback(
    (value: string) => setTheme(value as 'light' | 'dark' | 'system'),
    [setTheme],
  )

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/40" role="radiogroup" aria-label="Theme">
      {THEME_OPTIONS.map((opt) => {
        const Icon = opt.icon
        const isActive = theme === opt.value

        return (
          <button
            key={opt.value}
            onClick={() => handleChange(opt.value)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
