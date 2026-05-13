---
name: responsive-design
description: Mobile-first responsive design patterns for React + Tailwind v4 — breakpoints, touch targets, safe areas, layout adaptation
---

## Breakpoint Strategy (Tailwind defaults)

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Typography scaling, small layout shifts |
| `md` | 768px | Grid columns (1→2), drawer direction change, `useIsMobile()` hook boundary |
| `lg` | 1024px | Desktop nav vs mobile nav, sidebar visibility, layout direction |
| `xl` | 1280px | Constraining max-widths, wider cards |

Preferred approach: `mobile-first` — write the mobile styles first, then layer on larger breakpoints.

## Touch Targets

- Minimum touch target: **44×44pt** (WCAG 2.5.5)
- Add `touch-none` to draggable elements to prevent scroll interference
- Avoid hover-only interactions that don't work on touch
- Use `@media (hover: hover)` for hover enhancements that shouldn't apply on touch

## Mobile Nav Pattern (This Project)

- **Mobile**: Bottom nav bar (`lg:hidden`) with 4-5 icon + label items
- **Desktop**: Top nav bar (`hidden lg:flex`) with animated menu (GSAP)
- Toggle between them based on viewport; hamburger menu expands mobile nav

## Drawer Adaptation (Vaul)

```tsx
const isMobile = useIsMobile()

<Drawer direction={isMobile ? 'bottom' : 'right'}>
```

- Mobile: bottom sheet drawer
- Desktop: side panel drawer
- This pattern is already used in `HabitFormDrawer`

## Responsive Grids

```tsx
// Dashboard habits grid
<div className="grid-cols-1 md:grid-cols-2 gap-4">

// Analytics stat cards
<div className="grid-cols-2 lg:grid-cols-4 gap-3">
```

## Responsive Typography

- `text-[10px] lg:text-[0.65vw]` in nav
- `text-2xl sm:text-3xl` in headings
- Use `clamp()` or Tailwind breakpoints for fluid sizing

## Responsive Spacing

- `p-4 sm:p-6 lg:p-8` for page padding
- `space-y-5 sm:space-y-7` for section gaps
- `max-w-5xl` for content width constraint

## Safe Areas (Notch/Island)

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

Ensure bottom nav bars account for home indicator on iOS.

## Testing Responsive

- Test at: 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px+ (large desktop)
- Test with mobile nav, drawer directions, and touch interactions
