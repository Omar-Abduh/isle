import { Sun, Moon } from 'lucide-react'
import { Switch, useTheme } from '@isle/shared'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-3">
      <Sun className="w-4 h-4 text-muted-foreground" aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle dark mode"
      />
      <Moon className="w-4 h-4 text-muted-foreground" aria-hidden />
    </div>
  )
}
