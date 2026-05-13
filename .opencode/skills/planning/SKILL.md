---
name: planning
description: Research the codebase and present a structured plan before implementing complex multi-step tasks or architectural changes
---

## When to Use

- The user explicitly asks for a plan
- The task involves multiple files or cross-cutting concerns
- Architectural changes, refactors, or new features
- Any task where the wrong approach would waste significant effort

## Process

1. **Understand requirements** — Clarify what success looks like. Ask questions if the request is ambiguous.
2. **Explore the codebase** — Find relevant files, understand existing patterns and conventions. Check tests for expected behavior.
3. **Identify affected areas** — List all files that will be created, modified, or deleted. Note cross-cutting concerns (types, API contracts, DB schema).
4. **Consider alternatives** — Briefly evaluate different approaches. Recommend one with reasoning.
5. **List edge cases** — Failure modes, empty states, auth, permissions, error handling.
6. **Present the plan** — Summarize approach, file list, and step order. Wait for approval before implementing.

## Deliverable

A structured plan covering: approach, files to change, order of operations, and potential risks.
