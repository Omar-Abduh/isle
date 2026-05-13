---
name: testing-ui
description: UI testing patterns for this project — component tests with Testing Library, accessibility tests with axe, E2E with Playwright
---

## Current State

This project has **zero UI tests**. Only backend Java tests and TypeScript typechecking exist. This skill provides guidance for setting up and writing UI tests.

## Testing Stack (Recommended)

| Type | Tool | Purpose |
|------|------|---------|
| Unit/component | Vitest + Testing Library | Component rendering, user interactions |
| Accessibility | vitest-axe + Testing Library | Automated a11y audits |
| E2E | Playwright | Full user flows across pages |
| Visual regression | Playwright screenshot diff | Catch unintended visual changes |

## Component Tests (Testing Library)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Accessibility Tests

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'vitest-axe'

expect.extend(toHaveNoViolations)

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## What to Test

### Every Component
- Renders correctly with default props
- Renders correctly with each variant/size (CVA variants)
- Handles click/keyboard events
- Shows disabled state
- No a11y violations

### Forms
- Validation errors appear on invalid input
- Submit calls the handler with correct data
- Loading state disables submit button
- Error state shows error message

### Pages
- Renders loading state (skeleton check)
- Renders empty state when no data
- Renders error state on failure
- Renders data state with content
- Navigation works correctly

### User Flows (E2E)
- Login → redirect to dashboard
- Create habit → appears in list
- Log habit → streak updates
- Navigate between pages

## Writing Good Tests

- Test behavior, not implementation (don't test internal state, test rendered output)
- Use `userEvent` over `fireEvent` (it simulates real interactions)
- Use `screen.getByRole()` over `screen.getByTestId()` (prefer accessible queries)
- Use `within()` to scope queries to a container
- Avoid `waitFor` where possible — use `findBy*` which retries automatically

## Project Setup

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

Test files should be colocated with components: `button.test.tsx` next to `button.tsx`.
