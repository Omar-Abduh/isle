---
name: systematic-debugging
description: Investigate bugs, test failures, or unexpected behavior using a structured root-cause analysis process before implementing fixes
---

## Process

1. **Reproduce** — Understand the exact steps, inputs, and conditions that trigger the issue. Check if it's consistent or intermittent.
2. **Isolate** — Narrow down to the smallest reproducible scope. Identify the specific module, function, or component involved.
3. **Root cause** — Trace through the code to find why the behavior diverges from expected. Use logging, breakpoints, or `git bisect` if needed.
4. **Impact assessment** — Check if the bug affects other areas (same pattern elsewhere, shared utilities, downstream consumers).
5. **Fix** — Implement the minimal correct fix. Don't fix more than the bug, but don't leave related issues unaddressed.
6. **Verify** — Confirm the fix resolves the original reproduction case. Run relevant tests. Ensure no regressions.
7. **Document** — Note the root cause and fix in the commit message or issue tracker.

## Principles

- **Evidence before assertions** — Don't claim to know the cause without checking the code and runtime behavior.
- **One change at a time** — Change one variable, test, then proceed.
- **Check assumptions first** — Verify that your understanding of how the code works is correct before assuming something is broken.
