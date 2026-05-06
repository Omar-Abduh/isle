import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/shared/Reveal'
import RevealText from '@/components/shared/RevealText'
import PageReveal from '@/components/shared/PageReveal'
import { IsleLogo } from '@/components/shared/IsleLogo'



function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
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
    // Mock login simulating Google OAuth success
    login({
      userId: '00000000-0000-0000-0000-000000000001',
      displayName: 'Alex Rivera',
      email: 'user@isle.app',
    })
    setLocation('/dashboard')
  }

  return (
    <PageReveal>
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background relative overflow-hidden">
        
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        {/* Desktop-style Login Modal */}
        <Reveal y={30} duration={0.8} className="w-full max-w-[420px] px-6 relative z-10">
          <div className="w-full flex flex-col items-center text-center">
            
            <Reveal scale={0.8} y={0} delay={0.1}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 shadow-inner border border-primary/10">
                <IsleLogo className="h-10 w-10 text-foreground" />
              </div>
            </Reveal>
            
            <div className="space-y-3 mb-10 w-full">
              <RevealText
                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
                delay={200}
              >
                Isle
              </RevealText>
              <Reveal y={10} delay={0.4}>
                <p className="text-muted-foreground text-sm font-medium">
                  Sign in to sync your habits across devices.
                </p>
              </Reveal>
            </div>

            <Reveal y={20} delay={0.5} className="w-full">
              <Button
                onClick={handleLogin}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm transition-all rounded-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <div className="flex items-center justify-center gap-3 relative z-10 w-full">
                  <GoogleIcon className="h-5 w-5" />
                  <span className="font-semibold text-[15px]">Continue with Google</span>
                </div>
              </Button>
            </Reveal>

            <Reveal y={10} delay={0.7} className="mt-8">
              <p className="text-[11px] text-muted-foreground/60 max-w-[240px] leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </Reveal>

          </div>
        </Reveal>
      </div>
    </PageReveal>
  )
}

