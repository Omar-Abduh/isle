---
name: ui-ux
description: Comprehensive UI/UX design patterns for the isle project — accessibility, responsive design, forms, animations, design system, and testing
---

# UI/UX Design System for Isle

Unified guide covering accessibility, responsive design, form patterns, animations, design tokens, component architecture, and testing.

---

## 1. Accessibility (a11y)

### Standards
Target WCAG 2.2 Level AA.

### Semantic HTML
- Use native HTML elements: `<button>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<header>`, `<footer>`
- Use `<h1>`–`<h6>` in hierarchical order — don't skip levels
- Use `<label>` for form inputs (or `aria-label` / `aria-labelledby`)
- Use `<ul>` / `<ol>` for lists, `<table>` with `<th scope>` for tabular data

### ARIA
| Attribute | When |
|-----------|------|
| `aria-label` | Icon buttons, nav items without visible text |
| `aria-labelledby` | Link element to visible heading by ID |
| `aria-describedby` | Link element to description/message |
| `aria-current="page"` | Active nav link |
| `aria-expanded` | Toggle buttons (menus, accordions) |
| `aria-live="polite"` | Dynamic content (toasts, query results) |
| `role="alert"` | Error messages, critical notifications |
| `role="status"` | Non-critical status updates |
| `role="dialog"` | Modals and drawers |
| `aria-hidden="true"` | Decorative icons, non-visible content |

### Focus Management
- Use `:focus-visible` for focus indicators (not `:focus`)
- Every interactive element needs a visible focus ring
- Modals/drawers: trap focus when open, return focus on close (Radix handles this)
- Add skip-to-content link as the first focusable element

### Keyboard Navigation
- All interactive elements reachable via Tab
- Arrow keys for navigation within groups (tabs, listbox, menu)
- Escape closes modals, drawers, dropdowns, popovers
- Enter/Space activates buttons and links
- No keyboard traps

### Color Contrast
- **4.5:1** minimum for normal text
- **3:1** minimum for large text (18px bold or 24px regular)
- Don't rely on color alone — add icons, text, patterns
- Test both light and dark mode

### Screen Reader
- Images: `alt` text (decorative → `alt=""`)
- Dynamic content: `aria-live` regions
- Toast notifications: `role="alert"` + announcement regions
- Loading spinners: `aria-label="Loading"` + `role="status"`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
- Framer Motion: use `useReducedMotion()` hook
- GSAP: check `matchMedia('(prefers-reduced-motion: reduce)')`

### This Project's Gaps
- Add `aria-current` on nav links
- Add `aria-expanded` on hamburger menu
- Add `aria-live` region for toast notifications
- Add skip-to-content link
- Add keyboard support for DnD on HabitCard
- Ensure focus trap on drawer/modal open

---

## 2. Responsive Design

### Breakpoints (Tailwind v4 defaults)
| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Typography scaling, small layout shifts |
| `md` | 768px | Grid columns, drawer direction, `useIsMobile()` boundary |
| `lg` | 1024px | Desktop nav vs mobile nav, sidebar visibility, layout direction |
| `xl` | 1280px | Constraining max-widths, wider cards |

Approach: **mobile-first** — write mobile styles first, layer on larger breakpoints.

### Touch Targets
- Minimum: **44×44pt** (WCAG 2.5.5)
- Add `touch-none` to draggable elements
- Avoid hover-only interactions on touch
- Use `@media (hover: hover)` for hover-only enhancements

### Navigation Patterns
- **Desktop**: Top nav with GSAP-animated menu
- **Mobile**: Bottom nav bar (`lg:hidden`) or slide-in drawer
- **Web app**: Bottom nav at `pb-28`, desktop at `pt-[calc(2%+6vw)]`
- Use shared `useIsMobile()` hook (768px breakpoint) consistently

### Drawer Direction (Vaul)
```tsx
const isMobile = useIsMobile()
<Drawer direction={isMobile ? 'bottom' : 'right'}>
```
Mobile: bottom sheet. Desktop: side panel. Consider `snapPoints` for multi-stop sheets.

### Grids
- Dashboard: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Content: `max-w-5xl` with responsive padding (`p-4 sm:p-6 lg:p-8`)
- Gaps: `space-y-5 sm:space-y-7`, 16px grid gap

### Typography
- Fluid sizing: `clamp()` or Tailwind breakpoints
- `text-[10px] lg:text-[0.65vw]` in nav
- `text-2xl sm:text-3xl` in headings

### Safe Areas
```css
padding-bottom: env(safe-area-inset-bottom, 0px); /* bottom nav */
```
- Ensure mobile nav and drawers respect `safe-area-inset-*`
- Test on iOS with home indicator and notch

### Testing Responsive
- 375px (small mobile), 768px (tablet/mobile split), 1024px (desktop nav), 1440px+ (large)
- Test both orientations on mobile
- Verify mobile nav toggle, drawer direction, grid reflow

---

## 3. Form UX (react-hook-form + Zod)

### Structure
```tsx
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormValues = z.infer<typeof formSchema>

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: '' },
})
```

### Field States
| State | Visual |
|-------|--------|
| Default | Normal label + input |
| Focus | `:focus-visible` ring |
| Error | Red border + `FormMessage` |
| Disabled | Reduced opacity + cursor-not-allowed |
| Loading | Spinner, button disabled via `isPending` |

### Validation UX
- Show errors immediately on blur (`mode: 'onBlur'` or `'onTouched'`)
- Async validation: debounce with `useCallback`
- Submit validation: validate all, scroll to first error
- `aria-invalid` and `aria-describedby` linked to error messages

### Submit Button
- Disable during submission (prevents double-submit)
- Show spinner during `isPending` state
- Can place button outside `<form>` using `form="form-id"` attribute

### Dynamic Fields
- `useFieldArray` from react-hook-form for add/remove
- Use `field.id` for unique keys
- Clear labels on add/remove actions

### Accessibility
- Every input gets a `<label>` (via `FormLabel`)
- Group related inputs with `<fieldset>` + `<legend>` for radios/checkboxes
- Autocomplete attributes: `autocomplete="name"`, `autocomplete="email"`, etc.
- Tab order follows visual order

### Error Handling
- Toast on mutation error: `variant: "destructive"`
- Don't clear form on error — preserve user input
- Show retry button for network errors
- Focus first errored field

---

## 4. Animation Patterns (GSAP + Framer Motion)

### Library Decision
| Use Case | Library |
|----------|---------|
| Page transitions | Framer Motion (`pageVariants`, `AnimatePresence`) |
| Staggered lists | Framer Motion (`staggerChildren`) |
| Hover/tap micro-interactions | Framer Motion (`whileHover`, `whileTap`) |
| SVG animations | Framer Motion (`motion.circle`, `motion.path`) |
| Scroll-triggered reveals | GSAP (`ScrollTrigger`) |
| Complex sequential timelines | GSAP (`timeline`) |
| Text animations | GSAP (`SplitText`, `RevealText`) |

### Timing
| Ease/Timing | Value |
|-------------|-------|
| Smooth deceleration | `[0.4, 0, 0.2, 1]` |
| GSAP power | `power3.inOut`, `expo.out` |
| Stagger delay | 0.05s per item (FM), 0.04–0.08s (GSAP) |
| Duration range | 0.3s (quick) to 1.2s (reveals) |

### Framer Motion Variants
```tsx
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}
```

### Performance
- **Only animate** `transform` and `opacity` (GPU-composited)
- Avoid `width`, `height`, `top`, `left`, `box-shadow`, `border-radius`
- Use `will-change: transform` sparingly

### Reduced Motion
```tsx
const prefersReducedMotion = useReducedMotion()
const variants = prefersReducedMotion
  ? { initial: {}, animate: {} }
  : { initial: { opacity: 0 }, animate: { opacity: 1 } }
```

### GSAP Setup
```ts
// packages/shared/src/lib/gsap.ts — registers plugins
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
```

---

## 5. Design System

### Token Architecture

**Color tokens** (Tailwind v4 CSS vars):
```
--color-primary, --color-primary-foreground    — accent colors
--color-secondary, --color-secondary-foreground — support colors
--color-muted, --color-muted-foreground        — subdued UI
--color-accent, --color-destructive             — semantic
--color-border, --color-input, --color-ring     — form borders/focus
--chart-1 through --chart-5                     — data visualization
```

**Typography tokens:**
```
Default: --font-sans (Inter-like, system stack)
Display: --font-serif (for headings)
Mono:    --font-mono (for data, labels)
```

**Spacing:**
```
--spacing: 0.27rem   — custom base spacing unit
```

### CVA Component Pattern
```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: { default: 'h-10 px-4 py-2', sm: 'h-9 rounded-md px-3', lg: 'h-11 px-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

### Component Architecture
- All UI components in `packages/shared/src/components/ui/`
- Use `forwardRef`, `data-slot`, `cn()` (clsx + tailwind-merge)
- Each component is a single file with named export
- Import via `import { Button } from '@isle/shared/components/ui/button'`

### Component States
Every interactive component needs: Default, Hover, Focus-visible, Active, Disabled, Loading.

---

## 6. Testing (UI Quality)

### Recommended Stack
| Type | Tool | Purpose |
|------|------|---------|
| Component | Vitest + Testing Library | Rendering, user interactions |
| A11y | vitest-axe | Automated accessibility audits |
| E2E | Playwright | Full user flows, cross-browser |

### Component Test Pattern
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('handles interaction', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### What to Test
- **Every component**: renders, handles interactions, shows disabled state, no a11y violations
- **Forms**: validation errors, submit calls handler, loading state, error state
- **Pages**: loading → empty → error → data states all render correctly
- **User flows** (E2E): login, create item, navigate pages

### Cross-Browser
- Chrome (latest), Firefox (latest), Safari (latest)
- Test at 375px, 768px, 1024px+, 1440px+

### Accessibility Testing
- Run `ax DevTools` or Lighthouse accessibility audit
- Target 90+ accessibility score
- Test with screen readers (VoiceOver, NVDA)
- Test with keyboard only (Tab through entire page)