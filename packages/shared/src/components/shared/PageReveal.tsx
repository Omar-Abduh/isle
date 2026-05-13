import { useRef } from 'react'
import { gsap, useGSAP } from "../../lib/gsap"

export default function PageReveal({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!pageRef.current) return
    let resolved = false

    const animate = (fromFallback = false) => {
      if (resolved || !pageRef.current) return
      resolved = true
      window.removeEventListener('page-reveal', onReveal);

      (window as Window & { __PAGE_REVEALED__?: boolean }).__PAGE_REVEALED__ = true

      if (fromFallback) {
        window.dispatchEvent(new Event('page-reveal'))
      }

      try {
        gsap.fromTo(
          pageRef.current,
          { opacity: 0, y: 30, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.0,
            ease: 'expo.out',
            onComplete() {
              if (pageRef.current) {
                pageRef.current.style.transform = ''
                pageRef.current.style.filter = ''
              }
            },
          }
        )
      } catch {
        if (pageRef.current) {
          pageRef.current.style.opacity = '1'
          pageRef.current.style.filter = 'blur(0px)'
          pageRef.current.style.transform = 'translateY(0)'
        }
      }
    }

    const onReveal = () => animate(false)
    window.addEventListener('page-reveal', onReveal)
    const fallbackTimer = setTimeout(() => animate(true), 100)

    return () => {
      window.removeEventListener('page-reveal', onReveal)
      clearTimeout(fallbackTimer)
    }
  }, { scope: pageRef })

  return (
    <div ref={pageRef} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
