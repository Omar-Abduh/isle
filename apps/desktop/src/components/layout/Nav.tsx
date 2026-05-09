import React, { useState, useRef, useEffect } from 'react'
import { gsap, useGSAP, SplitText } from '@/lib/gsap'
import { IsleLogo } from '@/components/shared/IsleLogo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useAppNavigate } from '@/hooks/useNavigate'

const APP_VERSION = 'v1.0.0'

const navLinks: { href: string; label: string; disabled?: boolean }[] = [
  { href: '/dashboard', label: 'Today' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/profile', label: 'Profile' },
]

export const Nav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { path, navigate } = useAppNavigate()
  const { logout } = useAuth()

  const desktopNavRef = useRef<HTMLElement>(null)
  const mobileNavRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const desktopTopLineRef = useRef<HTMLSpanElement>(null)
  const desktopBottomLineRef = useRef<HTMLSpanElement>(null)
  const mobileTopLineRef = useRef<HTMLSpanElement>(null)
  const mobileBottomLineRef = useRef<HTMLSpanElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([])
  const linkRowsRef = useRef<(HTMLDivElement | null)[]>([])
  const indicatorRef = useRef<HTMLDivElement>(null)
  const linksContainerRef = useRef<HTMLDivElement>(null)
  const contactInfoRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const splitsRef = useRef<SplitText[]>([])
  const allLinesRef = useRef<HTMLElement[]>([])
  const indicatorRotationRef = useRef(0)
  const isInitialMount = useRef(true)

  const activeIndex = navLinks.findIndex(
    link => !link.disabled && (path === link.href)
  )

  const getPageLabel = () => {
    if (activeIndex >= 0) return navLinks[activeIndex].label;
    if (path.includes('history')) return 'History';
    return isMobile ? '' : 'Navigate';
  };

  const pageLabel = getPageLabel();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { contextSafe } = useGSAP()

  useGSAP(() => {
    const splits: SplitText[] = []
    const lines: HTMLElement[] = []

    const splitElements: HTMLElement[] = [
      ...(linksRef.current.filter(Boolean) as HTMLElement[]),
      ...Array.from(contactInfoRef.current?.querySelectorAll<HTMLElement>('p, button') || []),
    ]

    splitElements.forEach(el => {
      const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
      splits.push(split)
      split.lines.forEach((line) => {
        gsap.set(line, { y: '100%' })
        lines.push(line as HTMLElement)
      })
    })

    splitsRef.current = splits
    allLinesRef.current = lines

    return () => {
      timelineRef.current?.kill()
      splits.forEach(split => {
        try { split.revert() } catch { /* ignore */ }
      })
    }
  }, [])

  const animateToLink = contextSafe((index: number) => {
    const indicator = indicatorRef.current
    const container = linksContainerRef.current

    if (!indicator || !container) return

    if (index >= 0 && linkRowsRef.current[index]) {
      const containerRect = container.getBoundingClientRect()
      const rowRect = linkRowsRef.current[index]!.getBoundingClientRect()
      const targetY = rowRect.top - containerRect.top + (rowRect.height / 2) - (indicator.offsetHeight / 2)

      indicatorRotationRef.current += 180

      gsap.to(indicator, {
        x: 0,
        y: targetY,
        rotation: indicatorRotationRef.current,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.4)',
        overwrite: true,
      })
    } else {
      gsap.to(indicator, {
        x: isMobile ? '-4vw' : '-2vw',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      })
    }

    linkRowsRef.current.forEach((row, i) => {
      if (!row) return
      const link = row.querySelector('a')
      if (!link) return
      gsap.to(link, {
        x: i === index ? (isMobile ? '3vw' : '1.5vw') : '0vw',
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: true,
      })
    })
  })

  useGSAP(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    timelineRef.current?.kill()
    const tl = gsap.timeline()
    timelineRef.current = tl

    if (isOpen) {
      const navEl = isMobile ? mobileNavRef.current : desktopNavRef.current
      const topLine = isMobile ? mobileTopLineRef.current : desktopTopLineRef.current
      const bottomLine = isMobile ? mobileBottomLineRef.current : desktopBottomLineRef.current

      gsap.set(indicatorRef.current, {
        x: isMobile ? '-4vw' : '-2vw',
        opacity: 0,
      })
      linkRowsRef.current.forEach(row => {
        if (!row) return
        const link = row.querySelector('a')
        if (link) gsap.set(link, { x: '0vw' })
      })

      tl.to(navEl, {
        width: isMobile ? '94vw' : '90vw',
        duration: 0.6,
        ease: 'power3.inOut',
      })
        .to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: 'power2.out' }, 0)
        .to(topLine, { rotation: 45, y: 0, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(bottomLine, { rotation: -45, y: 0, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(menuRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.6,
          ease: 'power3.inOut',
        }, 0.2)
        .to(allLinesRef.current, { y: '0%', duration: 0.6, stagger: 0.04, ease: 'power3.out' }, 0.4)
        .call(() => animateToLink(activeIndex))
    } else {
      const navEl = isMobile ? mobileNavRef.current : desktopNavRef.current
      const topLine = isMobile ? mobileTopLineRef.current : desktopTopLineRef.current
      const bottomLine = isMobile ? mobileBottomLineRef.current : desktopBottomLineRef.current

      tl.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
        .set(overlayRef.current, { pointerEvents: 'none' }, 0.25)
        .to(indicatorRef.current, {
          x: isMobile ? '-4vw' : '-2vw',
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        }, 0)
        .to(linksRef.current.filter(Boolean), {
          x: '0vw',
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        }, 0)
        .to(allLinesRef.current, { y: '100%', duration: 0.35, stagger: 0.02, ease: 'power3.inOut' }, 0)
        .to(topLine, { rotation: 0, y: isMobile ? '-5px' : '-0.3vw', duration: 0.35, ease: 'power2.inOut' }, 0.1)
        .to(bottomLine, { rotation: 0, y: isMobile ? '5px' : '0.3vw', duration: 0.35, ease: 'power2.inOut' }, 0.1)
        .to(menuRef.current, {
          clipPath: isMobile ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
          duration: 0.5,
          ease: 'power3.inOut',
        }, 0.1)
        .to(navEl, {
          width: isMobile ? '94vw' : '95vw',
          duration: 0.5,
          ease: 'power3.inOut',
        }, 0.1)
    }
  }, { dependencies: [isOpen, activeIndex, isMobile, animateToLink] })

  const handleLogout = async () => {
    try {
      setIsOpen(false)
      logout()
      navigate("/");
    } catch (error) {
      console.error('Logout failed', error)
      navigate("/");
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />

      <nav
        ref={desktopNavRef}
        className="fixed left-1/2 -translate-x-1/2 z-50 bg-background/50 backdrop-blur-2xl border border-white/[0.08] dark:border-white/[0.08] hidden lg:flex items-center justify-between top-[2%] w-[95vw] rounded-2xl px-[2vw] py-[1.1vw] shadow-xl shadow-black/10 dark:shadow-black/30"
      >
        <div className="flex items-center gap-[0.8vw]">
          <button onClick={() => { setIsOpen(false); navigate('/dashboard'); }} className="hover:opacity-80 transition-opacity">
            <IsleLogo className="h-[2.2vw] w-[2.2vw] text-foreground transition-colors group-hover:text-primary" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[0.7vw] uppercase tracking-[0.25em] text-muted-foreground font-medium">
            {pageLabel}
          </span>
        </div>

        <div className="flex items-center gap-[1.2vw]">
          <ThemeToggle />
          <div className="w-px h-4 bg-border/50" />
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-[2vw] h-[1.2vw] flex items-center justify-center cursor-pointer group"
          >
            <span
              ref={desktopTopLineRef}
              className="absolute w-[1.6vw] h-[1.5px] bg-foreground rounded-full transition-colors group-hover:bg-primary"
              style={{ transform: 'translateY(-0.3vw)' }}
            />
            <span
              ref={desktopBottomLineRef}
              className="absolute w-[1.6vw] h-[1.5px] bg-foreground rounded-full transition-colors group-hover:bg-primary"
              style={{ transform: 'translateY(0.3vw)' }}
            />
          </div>
        </div>
      </nav>

      <nav
        ref={mobileNavRef}
        className="fixed left-1/2 -translate-x-1/2 z-50 bg-background/50 backdrop-blur-2xl border border-white/[0.08] dark:border-white/[0.08] flex items-center justify-between lg:hidden bottom-[2%] w-[94vw] rounded-2xl px-5 py-3.5 shadow-xl shadow-black/10 dark:shadow-black/30"
      >
        <button onClick={() => { setIsOpen(false); navigate('/dashboard'); }} className="hover:opacity-80 transition-opacity">
          <IsleLogo className="h-7 w-7 text-foreground transition-colors group-hover:text-primary" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {pageLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-6 h-5 flex items-center justify-center cursor-pointer group"
          >
            <span
              ref={mobileTopLineRef}
              className="absolute w-5 h-[1.5px] bg-foreground rounded-full transition-colors group-hover:bg-primary"
              style={{ transform: 'translateY(-5px)' }}
            />
            <span
              ref={mobileBottomLineRef}
              className="absolute w-5 h-[1.5px] bg-foreground rounded-full transition-colors group-hover:bg-primary"
              style={{ transform: 'translateY(5px)' }}
            />
          </div>
        </div>
      </nav>

      <div
        ref={menuRef}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-background/50 backdrop-blur-2xl border border-white/[0.08] dark:border-white/[0.08] overflow-clip shadow-2xl ${isMobile
            ? 'bottom-[calc(2%+72px)] w-[94vw] rounded-2xl'
            : 'top-[calc(2%+5.5vw)] w-[90vw] rounded-2xl'
          }`}
        style={{ clipPath: isMobile ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="p-5 lg:p-[2.5vw] h-fit flex flex-col lg:flex-row">
          <div
            ref={linksContainerRef}
            className="w-full lg:w-[25%] flex flex-col gap-1.5 lg:gap-[.4vw] border-b lg:border-b-0 lg:border-r border-border/40 pb-4 lg:pb-0 lg:pr-[2vw] relative"
            onMouseLeave={() => animateToLink(activeIndex)}
          >
            <p className="text-[10px] lg:text-[0.65vw] uppercase tracking-[0.25em] text-foreground/70 dark:text-muted-foreground/40 mb-2 lg:mb-[0.6vw] font-medium">Navigation</p>

            <div
              ref={indicatorRef}
              className="absolute left-0 top-0 size-2.5 lg:size-[0.8vw] bg-primary rotate-45 opacity-0 pointer-events-none z-10"
              style={{ transform: `translateX(${isMobile ? '-4vw' : '-2vw'})` }}
            />

            {navLinks.map((link, index) => (
              <div
                key={link.href}
                ref={el => { linkRowsRef.current[index] = el }}
                className="flex w-fit flex-row items-center"
                onMouseEnter={() => !link.disabled && animateToLink(index)}
              >
                <a
                  ref={el => { linksRef.current[index] = el as unknown as HTMLAnchorElement }}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); setIsOpen(false); navigate(link.href); }}
                  className={`text-[7vw] lg:text-[2.6vw] font-semibold tracking-tight transition-colors ${path === link.href
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                    }`}
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>

          <div
            ref={contactInfoRef}
            className="w-full lg:w-[25%] flex flex-row lg:flex-col justify-between items-center lg:items-start gap-4 lg:gap-[1.5vw] pt-4 lg:pt-0 lg:px-[2vw] text-foreground/80 dark:text-muted-foreground text-sm lg:text-[1vw]"
          >
            <div>
              <p className="text-[10px] lg:text-[0.65vw] text-foreground/70 dark:text-muted-foreground/40 uppercase tracking-[0.25em] mb-1 lg:mb-[0.3vw] font-medium">
                Version
              </p>
              <p className="text-xs lg:text-[0.8vw] font-mono text-muted-foreground/60">{APP_VERSION || 'v1.0.0'}</p>
            </div>

            <div className="lg:mt-auto pt-0 lg:pt-4 border-l pl-4 lg:border-l-0 lg:pl-0 lg:border-t border-border/20">
              <button
                onClick={handleLogout}
                className="text-destructive hover:text-destructive/80 transition-colors font-medium text-lg lg:text-[1.2vw] tracking-tight flex items-center gap-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
