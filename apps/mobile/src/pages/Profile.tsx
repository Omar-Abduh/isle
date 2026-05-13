import { useAuthStore } from '@isle/shared'
import ThemeToggle from '../components/ThemeToggle'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="px-4 py-3" role="region" aria-label="Profile settings">
      <h1 className="text-xl font-bold mb-6">Profile</h1>

      {user && (
        <div className="mb-4 p-4 bg-card border border-border rounded-xl">
          <p className="font-medium">{user.displayName || user.email}</p>
          {user.displayName && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Dark Mode</span>
          <ThemeToggle />
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">App version</p>
          <p className="text-sm font-medium">1.1.0-beta.5</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full mt-6 py-3.5 bg-destructive/10 text-destructive rounded-xl font-medium
          active:scale-[0.98] transition-transform touch-manipulation
          min-h-[44px]"
      >
        Sign Out
      </button>
    </div>
  )
}
