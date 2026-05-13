import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from "../../lib/gsap"

interface RevealTextProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  className?: string
  delay?: number
  duration?: number
  stagger?: number
  trigger?: 'scroll' | 'load'
  splitBy?: 'lines' | 'words' | 'chars'
  start?: string
  direction?: 'top' | 'bottom'
}

export default function RevealText({
  children,
  as: Tag = 'p',
  className = '',
  delay = 0,
  duration = 1.2,
  stagger = 0.08,
  trigger = 'load',
  splitBy = 'lines',
  start = 'top 90%',
  direction = 'bottom',
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    const split = new SplitText(el, {
      type: splitBy,
      mask: splitBy,
      linesClass: 'split-line',
      wordsClass: 'split-word',
      charsClass: 'split-char',
    })

    const targets =
      splitBy === 'lines'
        ? split.lines
        : splitBy === 'words'
          ? split.words
          : split.chars

    const startY = direction === 'top' ? -110 : 110
    gsap.set(targets, { yPercent: startY, opacity: 0, filter: 'blur(10px)' })

    const config: gsap.TweenVars = {
      keyframes: [
        {
          yPercent: direction === 'top' ? -10 : 10,
          filter: 'blur(5px)',
          opacity: 0.5,
          duration: duration * 0.4,
          ease: 'power2.inOut',
        },
        {
          yPercent: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: duration * 0.6,
          ease: 'expo.out',
        },
      ],
      stagger,
      delay: delay / 1000,
    }

    if (trigger === 'scroll') {
      gsap.to(targets, {
        ...config,
        scrollTrigger: { trigger: el, start, once: true },
      })
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
        return () => { try { split.revert() } catch { /* ignore */ } }
      }

      window.addEventListener('page-reveal', onReveal)
      const fallbackTimer = setTimeout(animate, 1500)

      return () => {
        window.removeEventListener('page-reveal', onReveal)
        clearTimeout(fallbackTimer)
        try { split.revert() } catch { /* ignore */ }
      }
    }

    return () => { try { split.revert() } catch { /* ignore */ } }
  }, { scope: ref, dependencies: [children, splitBy, delay, duration, stagger, trigger, start, direction] })

  return (
    <Tag ref={ref as React.RefObject<never>} className={className}>
      {children}
    </Tag>
  )
}
