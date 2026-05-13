import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore, IsleLogo } from '@isle/shared'
import { loginDemo } from '../api/authApi'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)

  async function handleLogin() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await loginDemo()
      setSession(result.user, result.accessToken)
    } catch {
      setError('Failed to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      </div>
      <motion.div
        className="w-full max-w-sm px-6 relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 shadow-inner border border-primary/10">
            <IsleLogo className="h-10 w-10 text-foreground" />
          </div>
        </motion.div>
        <div className="space-y-3 mb-10 w-full">
          <motion.h1 className="text-2xl font-bold tracking-tight text-foreground" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Isle</motion.h1>
          <motion.p className="text-muted-foreground text-sm font-medium" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>Sign in to sync your habits across devices.</motion.p>
        </div>
        <motion.button
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-all touch-manipulation min-h-[48px] flex items-center justify-center gap-3 disabled:opacity-60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogin}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
          <span>{isLoading ? 'Signing in…' : 'Sign in with Google'}</span>
        </motion.button>
        {error && <motion.p className="text-sm text-destructive mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
        <motion.p className="text-[11px] text-muted-foreground/60 max-w-xs mt-8 leading-relaxed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>By continuing, you agree to our Terms of Service and Privacy Policy.</motion.p>
      </motion.div>
    </div>
  )
}
