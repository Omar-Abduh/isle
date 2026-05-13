---
name: mobile-ux
description: Modern UI/UX patterns for the isle app — glassmorphism effects, minimal design, system colors, clean navigation, and contemporary interface patterns
---

## Design Philosophy

Modern, clean, minimal. Glassmorphism surfaces with system-aware colors. The interface should feel light, airy, and contemporary — never heavy or cluttered.

## Glassmorphism

### Core Pattern

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```

Dark mode: white-based glass with low opacity
Light mode: white-based glass with higher opacity

### Glass Variants

| Variant | Background | Border | Blur |
|---------|-----------|--------|------|
| Surface | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.06)` | 12px |
| Elevated | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.1)` | 20px |
| Modal | `rgba(0,0,0,0.6)` backdrop | — | 4px |
| Nav bar | `rgba(255,255,255,0.03)` | bottom `rgba(255,255,255,0.06)` | 16px |

### When to Use Glass

- **Cards** — habit cards, stat cards, info panels
- **Navigation** — top bar, bottom nav, side panels
- **Modals/Drawers** — frosted backdrop, glass content area
- **Overlays** — menus, dropdowns, command palette

### When NOT to Use Glass

- Text-heavy areas (reduces readability)
- Small UI elements (badges, tags, icons)
- Interactive elements where clarity is critical (form inputs, buttons)
- On very light backgrounds where the effect is invisible

## Minimal Design Principles

### Whitespace
- Generous spacing: `p-6` minimum for card content, `gap-4` for grids
- Breathing room between sections: `space-y-8` or `gap-8`
- Don't fill empty space with decoration — empty space IS the design

### Typography
- One typeface family (system font or well-chosen sans-serif)
- Max 2-3 font weights (400, 500, 700)
- Hierarchy through size and weight, not color
- Line height: 1.5 for body, 1.2 for headings

### Color
- Use color sparingly — one accent color, one neutral scale
- Most UI is grayscale with the accent color reserved for:
  - Primary actions (1-2 per page)
  - Active states
  - Key data highlights
- System colors: use `light-dark()` or CSS variables that respond to OS theme

### Borders & Separation
- Minimal borders — use spacing and background to separate sections
- When borders are needed: subtle (`rgba`), thin (1px), on one side only
- No heavy outlines, no double borders, no 3D effects

### Icons
- Consistent set (lucide-react already in the project)
- Same stroke width throughout
- Don't mix filled and outlined icons
- Small (16-20px) for inline, medium (24px) for nav

## System Colors

### CSS System Color Approach

Use `light-dark()` CSS function or CSS variables that respect the OS color scheme:

```css
:root {
  --surface: light-dark(rgba(255,255,255,0.9), rgba(255,255,255,0.04));
  --surface-elevated: light-dark(rgba(255,255,255,0.95), rgba(255,255,255,0.08));
  --text-primary: light-dark(#1a1a1a, #f5f5f5);
  --text-secondary: light-dark(#666, #999);
  --border: light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.06));
  --accent: #color; /* same in both modes */
}
```

Or use the `color-scheme` property:
```css
:root {
  color-scheme: light dark;
}
```

### When to Use System Colors
- Backgrounds and surfaces
- Text colors
- Borders and dividers
- Shadow colors

### When to Use Fixed Colors
- Brand accent color (crimson/primary) — same in both modes
- Semantic colors (red for errors, green for success) — same hue, adjust lightness
- Logo and brand elements

## Modern Navigation Patterns

### Top Nav Bar (Current)

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 glass h-16 px-6">
```

- Glass effect background
- Centered or left-aligned logo
- Right-aligned actions (theme toggle, profile, settings)
- No heavy borders — use subtle bottom edge `border-b border-[rgba(255,255,255,0.06)]`

### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 glass h-16 px-4 pb-[env(safe-area-inset-bottom,0px)]">
  <div className="flex items-center justify-around h-full">
    {tabs.map(tab => (
      <button className="flex flex-col items-center gap-0.5 text-xs">
        {tab.icon}
        <span className={isActive ? 'text-accent' : 'text-secondary'}>
          {tab.label}
        </span>
      </button>
    ))}
  </div>
</nav>
```

- Glass effect background
- 3-5 tabs max
- Active state: accent color, subtle indicator (dot or underline)
- Inactive state: secondary/tertiary text color
- No labels for 3 or fewer tabs (icons only)

### Sidebar (Desktop)

- Glass effect panel
- Collapsible with smooth animation
- Uses `env(safe-area-inset-left)` for notched displays
- Active nav item: subtle background highlight, not heavy color blocks

## Modern UI Component Patterns

### Cards

```tsx
<div className="glass rounded-2xl p-6 space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-secondary">Title</h3>
    <span className="text-xs text-tertiary">optional meta</span>
  </div>
  {/* card content */}
</div>
```

- Glass background
- Rounded corners (`rounded-2xl` or `rounded-xl`)
- No border on light surfaces (use shadow instead)
- Subtle border on dark surfaces (glass border)
- Padding: `p-6` minimum

### Buttons

```tsx
<button className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium text-sm
  hover:opacity-90 active:scale-[0.98] transition-all duration-150">
  Primary Action
</button>

<button className="px-6 py-2.5 rounded-xl glass text-primary font-medium text-sm
  hover:bg-white/10 active:scale-[0.98] transition-all duration-150">
  Secondary Action
</button>

<button className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors">
  Ghost Action
</button>
```

- Rounded (`rounded-xl`)
- Minimal padding (`px-6 py-2.5`)
- Subtle hover state (opacity or background shift)
- Press state: `scale-[0.98]`
- Three tiers: primary (accent bg), secondary (glass), ghost (text only)

### Inputs

```tsx
<input
  className="w-full px-4 py-3 rounded-xl bg-transparent border border-border
    text-primary placeholder:text-tertiary
    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
    transition-all duration-150"
  placeholder="Label"
/>
```

- Transparent/glass background
- Subtle border
- Focus: accent ring (semi-transparent)
- No heavy outlines

### Toggle/Switch

- Minimal design: thin track, circular thumb
- Accent color for active state
- Smooth transition on toggle

## Applying the Style to Current App

### Current App Changes

1. **Navigation** — Replace existing nav with glass-effect top bar (desktop) and bottom bar (mobile), remove GSAP heavy animations, use subtle CSS transitions instead
2. **Cards** — Convert existing habit cards to glass surfaces, reduce border usage, add rounded corners
3. **Buttons** — Unify button styles to the three-tier system (primary/secondary/ghost)
4. **Colors** — Shift toward system-aware colors, reduce reliance on hardcoded theme values
5. **Spacing** — Audit all pages for adequate whitespace, remove unnecessary borders
6. **Icons** — Ensure consistent icon style (lucide-react, same stroke width)

### Anti-Patterns

- NO heavy box-shadows (use subtle glass shadows)
- NO bold borders (use `rgba` borders or spacing instead)
- NO more than one accent color
- NO decorative gradients
- NO filled/outlined icon mixing
- NO `border-2` or thicker
- NO padding smaller than `p-4` on containers
- NO text smaller than 12px for UI labels
- NO hover-only interactions that don't work on touch
