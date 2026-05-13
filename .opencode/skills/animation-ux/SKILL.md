---
name: animation-ux
description: Animation guidelines for GSAP and Framer Motion — performance, reduced-motion, timing/easing, and when to use each library
---

## Library Decision

| Use Case | Library |
|----------|---------|
| Page enter/exit transitions | Framer Motion (`pageVariants`, `AnimatePresence`) |
| Staggered list reveals | Framer Motion (`staggerChildren`, `itemVariants`) |
| Hover/tap micro-interactions | Framer Motion (`whileHover`, `whileTap`) |
| SVG animations | Framer Motion (`motion.circle`, `motion.path`) |
| Gesture-based (drag, pan) | Framer Motion (`drag`, `onPan`) |
| Scroll-triggered reveals | GSAP (`ScrollTrigger`) |
| Complex timeline sequences | GSAP (`timeline`) |
| Text animations (SplitText) | GSAP (`SplitText`, `RevealText`) |
| High-performance sequential | GSAP (timeline with `.to()`, `.fromTo()`) |

## Performance

- **Only animate** `transform` and `opacity` — these are GPU-composited
- Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding` (triggers layout)
- Avoid animating `box-shadow`, `filter`, `border-radius` (triggers paint)
- Use `will-change: transform` sparingly — only on elements actively animating
- Remove `will-change` after animation completes

## Timing and Easing (This Project's Patterns)

```
// Common ease curve
[0.4, 0, 0.2, 1]     // smooth deceleration

// GSAP easing
power3.inOut
expo.out

// Framer Motion
{ ease: 'easeOut', duration: 0.3 }

// Stagger values
0.05s per item         // Framer Motion
0.04–0.08s per item    // GSAP timeline
```

## Reduced Motion

```tsx
import { useReducedMotion } from 'framer-motion'

const prefersReducedMotion = useReducedMotion()

const variants = prefersReducedMotion
  ? { initial: {}, animate: {} }   // no motion
  : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
```

For GSAP:
```ts
// Check at registration
const mm = gsap.matchMedia()
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // register animations here
})
```

## Framer Motion Patterns

```tsx
// Page variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

// Stagger container
const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
}

// Item variants
const itemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}
```

## GSAP Patterns (This Project)

- Nav menu open/close: GSAP timeline with indicator animation and SplitText reveals
- `PageReveal`: opacity + y + blur on page enter
- `Reveal`: scroll-triggered direction/scale/blur
- `RevealText`: SplitText-based (lines, words, chars)
- GSAP plugins registered: `ScrollTrigger`, `SplitText`, `useGSAP`

## Entry Animations

- Page load: one well-orchestrated sequence (staggered reveals) > scattered micro-interactions
- List items: stagger at 0.05s per item
- Content sections: reveal on scroll via `Reveal` component

## Micro-interactions

- Button hover: scale 1.02–1.05 or subtle background shift
- Checkmark toggle: spring animation on habit log
- Streak ring: animated strokeDashoffset
- Bar chart: height animation on mount
