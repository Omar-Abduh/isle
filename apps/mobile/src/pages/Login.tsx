import { useAuthStore } from '@isle/shared'

export default function LoginPage() {
  const setSession = useAuthStore((s) => s.setSession)

  function handleLogin() {
    setSession(
      { id: '1', email: 'demo@isle.app', timezone: 'UTC' },
      'mock-token',
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 bg-background">
      <div className="text-center space-y-6 max-w-sm w-full">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Isle</h1>
          <p className="text-muted-foreground text-sm mt-2">Sign in to continue</p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium
            active:scale-[0.98] transition-transform touch-manipulation min-h-[44px]"
          aria-label="Sign in"
        >
          Sign In
        </button>
      </div>
    </div>
  )
}
