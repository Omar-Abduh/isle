import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from "../../lib/gsap"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  x?: number
  scale?: number
  opacity?: number
  trigger?: 'scroll' | 'load'
  start?: string
  staggerChildren?: number
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 1,
  y = 60,
  x = 0,
  scale = 1,
  opacity = 0,
  trigger = 'load',
  start = 'top 88%',
  staggerChildren,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const targets = staggerChildren ? el.children : el

    gsap.set(targets, { y, x, scale, opacity, filter: 'blur(12px)' })

    const config: gsap.TweenVars = {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: duration * 1.2,
      ease: 'expo.out',
      delay,
      stagger: staggerChildren || 0,
    }

    if (trigger === 'scroll') {
      gsap.to(targets, {
        ...config,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      })
      return
    } else {
      let resolved = false

      const animate = () => {
        if (resolved) return
        resolved = true
        window.removeEventListener('page-reveal', onReveal)
        gsap.to(targets, config)
      }

      const onReveal = () => animate()

      if ((window as Window & { __PAGE_REVEALED__?: boolean }).__PAGE_REVEALED__) {
        animate()
        return
      }

      window.addEventListener('page-reveal', onReveal)
      const fallbackTimer = setTimeout(animate, 1500)

      return () => {
        window.removeEventListener('page-reveal', onReveal)
        clearTimeout(fallbackTimer)
      }
    }
  }, { scope: ref, dependencies: [y, x, scale, opacity, duration, delay, trigger, start, staggerChildren] })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
