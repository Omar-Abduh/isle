import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/shared/Reveal'
import RevealText from '@/components/shared/RevealText'
import PageReveal from '@/components/shared/PageReveal'

function IsleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor" />
      <rect x="36" y="4" width="24" height="24" rx="6" fill="currentColor" opacity="0.7" />
      <rect x="4" y="36" width="24" height="24" rx="6" fill="currentColor" opacity="0.7" />
      <rect x="36" y="36" width="24" height="24" rx="6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (isAuthenticated) setLocation('/dashboard')
  }, [isAuthenticated, setLocation])

  const handleLogin = () => {
    login({
      userId: '00000000-0000-0000-0000-000000000001',
      displayName: 'Alex Rivera',
      email: 'user@isle.app',
    })
    setLocation('/dashboard')
  }

  return (
    <PageReveal>
      <div className="flex flex-col gap-4 sm:gap-6 w-full h-full md:h-auto">
        <div className="overflow-hidden relative rounded-none md:rounded-3xl shadow-xl border-border bg-background h-full md:h-auto min-h-svh md:min-h-0 md:border">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-svh md:min-h-[650px] h-full w-full">

            {/* Left — Form */}
            <div className="p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col items-center justify-center relative bg-background max-w-md mx-auto w-full h-full">
              <Reveal y={40} duration={0.8} className="w-full flex justify-center">
                <div className="flex flex-col gap-10 sm:gap-12 w-full max-w-sm relative z-10">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <Reveal scale={0.8} y={0} delay={0.1}>
                      <IsleIcon className="h-16 sm:h-20 w-auto text-primary" />
                    </Reveal>
                    <div className="space-y-3">
                      <RevealText
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                        delay={200}
                      >
                        Isle Habit Tracker
                      </RevealText>
                      <Reveal y={20} delay={0.4}>
                        <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-[280px] mx-auto">
                          A quiet space for better habits. Track, reflect, grow.
                        </p>
                      </Reveal>
                    </div>
                  </div>

                  <Reveal y={30} delay={0.6}>
                    <Button
                      onClick={handleLogin}
                      className="w-full h-12 sm:h-12 font-medium text-[15px] rounded-lg transition-all shadow-md hover:shadow-lg bg-[#247E84] hover:bg-[#1a5b60] text-white"
                    >
                      <div className="flex items-center gap-3">
                        <IsleIcon className="h-5 w-5 text-white" />
                        <span>Continue with Isle</span>
                      </div>
                    </Button>
                  </Reveal>

                  <Reveal y={20} delay={0.8} className="md:hidden">
                    <div className="text-center text-xs text-muted-foreground pt-6 border-t border-border">
                      <p>Build lasting habits, one day at a time.</p>
                    </div>
                  </Reveal>
                </div>
              </Reveal>
            </div>

            {/* Right — Visual (Desktop Only) */}
            <div className="bg-muted relative hidden md:block overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/50 to-primary/5" />

              {/* Decorative habit grid */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="grid grid-cols-7 gap-2 p-8">
                  {Array.from({ length: 91 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-md"
                      style={{
                        backgroundColor: Math.random() > 0.4 ? 'var(--primary)' : 'var(--border)',
                        opacity: Math.random() * 0.6 + 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Orbs */}
              <div className="absolute top-[15%] left-[20%] w-48 h-48 rounded-full bg-primary/20 blur-[80px]" />
              <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full bg-primary/15 blur-[100px]" />

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute bottom-12 left-12 right-12 text-white">
                <Reveal y={40} delay={0.6}>
                  <h2 className="text-3xl font-bold tracking-tight mb-4 text-white/90">
                    Build Better Habits
                  </h2>
                  <p className="text-lg text-white/70 max-w-md leading-relaxed font-medium">
                    Track your progress, celebrate streaks, and grow one day at a time.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageReveal>
  )
}
