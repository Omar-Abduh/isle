---
name: code-review
description: Review code changes systematically for correctness, security, edge cases, error handling, type safety, and adherence to project patterns
---

## When to Use

- Reviewing a PR or diff before approval
- Self-reviewing your own changes before commit/PR
- Auditing a specific file or module for quality

## Checklist

### Correctness
- Does the code do what it claims? Check against requirements
- Are there off-by-one errors or incorrect boundary conditions?
- Are there race conditions or timing assumptions?

### Security
- Are user inputs validated and sanitized?
- Are there hardcoded secrets or credentials?
- Are auth/permission checks applied correctly?
- SQL injection, XSS, path traversal vectors?

### Error Handling
- Are all failure modes handled (network, DB, auth, validation)?
- Are errors logged with sufficient context?
- Does the code fail gracefully (user sees a useful message)?

### Type Safety
- Are there any `any` types that could be properly typed?
- Are generics used correctly?
- Are null/undefined states handled (no-bang assertions)?

### Performance
- N+1 queries in API or DB access?
- Unnecessary re-renders in React components?
- Large bundles or missing lazy loading?
- Expensive operations in hot paths?

### Project Patterns
- Does the code follow existing conventions (file structure, naming, imports)?
- Does it use the established state management approach?
- Is the component colocated with its styles/types?
- Are API changes reflected in the OpenAPI spec?

### Readability
- Is the code clear without comments (or are comments explaining the "why")?
- Are functions and variables named descriptively?
- Is there dead code, commented-out code, or debugging artifacts?

## Output Format

For each issue found, note: file, line, severity (blocking/minor/suggestion), and a brief explanation. Group by category.
