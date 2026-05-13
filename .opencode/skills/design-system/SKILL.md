---
name: design-system
description: Design system standards for @isle/shared — component architecture, CVA variants, CSS variable tokens, theme consistency
---

## Token Architecture

Tokens are defined in CSS using Tailwind v4's `@theme inline` block in `index.css`:

### Color Tokens
```
--background, --foreground           // page bg / text
--primary, --primary-foreground      // primary actions
--secondary, --secondary-foreground  // secondary actions
--muted, --muted-foreground          // subdued text, placeholders
--accent, --accent-foreground        // highlights
--destructive, --destructive-foreground  // destructive actions
--border / --input                   // borders and inputs
--ring                               // focus ring
--chart-1 through --chart-5          // chart colors
--sidebar-*                          // sidebar specific
```

### Typography Tokens
```
--font-sans: Afacad
--font-serif: Lora
--font-mono: JetBrains Mono
```

### Spacing
```
--spacing: 0.27rem     // custom base (vs Tailwind default 0.25rem)
```

### Radius
```
--radius: 1.025rem     // large, playful
```

### Shadows
Custom 2px-bottom-shadow aesthetic via `--shadow-*` variables.

### Letter Spacing
```
--tracking-normal: 0.075em  // wide by default
```

**Always use CSS variable references in Tailwind**, e.g. `bg-background text-foreground`, not raw hex values.

## CVA Component Pattern

All shared UI components use `class-variance-authority`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:ring',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

## Component States

Every interactive component should define these visual states:
- **Default** — resting state
- **Hover** — cursor hover (skip on touch devices with `@media (hover: hover)`)
- **Focus-visible** — keyboard focus ring
- **Active** — pressed state
- **Disabled** — reduced opacity + `cursor-not-allowed`
- **Loading** — spinner/pulse where applicable

## Component Architecture

- All UI components in `packages/shared/src/components/ui/`
- Domain components in `packages/shared/src/components/habits/` and `shared/`
- Each component is a single file with a named export
- Use `forwardRef` for components that wrap Radix primitives
- Use `cn()` (clsx + tailwind-merge) for class merging
- Use `data-slot` attributes for Radix slot-based composition

## Consistency Rules

- Don't add new UI primitives if one already exists in `packages/shared/src/components/ui/`
- Extend existing components with CVA variants, don't create new ones
- Keep the same import pattern: `import { Button } from '@isle/shared/components/ui/button'`
- Follow the same file structure as existing 55+ components
- No inline `tailwind.config.js` — all custom tokens in `index.css` `@theme` block

## Documentation

- No Storybook or component docs exist yet
- When adding new components, document: purpose, props, variants, usage example
- Keep an eye on establishing a component documentation standard
