---
name: a11y-accessibility
description: WCAG 2.2 AA compliance for React apps — ARIA patterns, keyboard navigation, focus management, semantic HTML, color contrast, screen reader support
---

## Standards

Target WCAG 2.2 Level AA. Use these patterns consistently.

## Semantic HTML

- Use native HTML elements where possible (`<button>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<header>`, `<footer>`)
- Use `<h1>`–`<h6>` for headings in hierarchical order — don't skip levels
- Use `<label>` for form inputs (or `aria-label` / `aria-labelledby`)
- Use `<ul>` / `<ol>` for lists of items
- Use `<table>` with `<th scope="col/row">` for tabular data

## ARIA

- `aria-label` — When the element's purpose isn't clear from visible text (icon buttons, nav items with only icons)
- `aria-labelledby` — Link an element to a visible heading/label by ID
- `aria-describedby` — Link an element to a description (form field hints)
- `aria-current="page"` — On the active nav link
- `aria-expanded` — On toggle buttons (menus, accordions, collapsibles)
- `aria-controls` — References the ID of the element being controlled
- `aria-hidden="true"` — Decorative icons, non-visible content
- `aria-live="polite"` — Dynamic content updates (toast notifications, loading results)
- `aria-atomic="true"` — When the entire live region should be announced
- `role="alert"` — For error messages or critical notifications
- `role="status"` — For non-critical status updates
- `role="dialog"` / `role="alertdialog"` — For modals and dialogs
- `role="navigation"` — Nav sections
- `role="region"` with `aria-label` — Distinct page sections

## Focus Management

- Use `:focus-visible` for focus indicators (not `:focus`) — visible ring only on keyboard focus
- Every interactive element must have a visible focus state
- Modals and drawers: trap focus within the dialog when open, return focus to trigger on close (Radix handles this — verify)
- Skip-to-content link as the first focusable element on the page
- Manage focus when content changes dynamically (page transitions, filtered lists)

## Keyboard Navigation

- All interactive elements must be reachable via Tab
- Arrow keys for navigation within a group (tabs, listbox, menu, radiogroup)
- Escape closes modals, drawers, dropdowns, popovers
- Enter/Space activates buttons and links
- No keyboard traps — focus must be able to move away from any element

## Color and Contrast

- **4.5:1** minimum contrast ratio for normal text
- **3:1** minimum for large text (18px bold or 24px regular+)
- Don't rely on color alone to convey information (add icons, text, patterns)
- Test both light and dark mode

## Screen Reader Specific

- Images must have `alt` text (decorative → `alt=""`)
- Dynamic content updates use `aria-live` regions
- Toast notifications need `role="alert"` or `role="status"`
- Loading spinners need `aria-label="Loading"` and `role="status"`
- Empty states should be announced when they appear

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Respect `prefers-reduced-motion` for all animations
- Framer Motion: `<motion.div animate={{ ... }} whileTap={{ ... }}>` should disable with `useReducedMotion()`
- GSAP: check `matchMedia` for reduced motion preference before registering animations

## This Project's Gaps

From audit: add `aria-current` on nav links, focus trap verification on drawer/modal open, skip-to-content link, keyboard nav for drag-and-drop on HabitCard, `aria-expanded` on hamburger menu, announcement region for toast, visible focus during DnD.
