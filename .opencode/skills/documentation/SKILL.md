---
name: documentation
description: Write and update documentation with consistent style covering API contracts, usage examples, and setup instructions
---

## When to Use

- Writing or updating README files
- Documenting API endpoints, schemas, or configuration
- Adding inline code documentation
- Writing changelogs or migration guides
- Updating architecture or design docs

## Guidelines

### README Files
- Start with: what this is, why it exists, who it's for
- Include: prerequisites, quick start, configuration, available scripts/commands
- Keep setup instructions runnable — someone should be able to copy-paste and go

### API Documentation
- Include endpoint, method, request/response shapes, error codes, auth requirements
- Reference the OpenAPI spec at `/swagger-ui/` when applicable

### Code Documentation
- Document the "why" not the "what" — let the code speak for itself
- Document public APIs, non-obvious behavior, and rationale for non-standard choices

### Changelogs
- Follow the keepachangelog.com format
- Group by: Added, Changed, Deprecated, Removed, Fixed, Security
- Reference issue/PR numbers when relevant

### Style
- Be concise and accurate over verbose
- Use active voice
- Include code examples for non-trivial usage
- Keep sensitive information (secrets, keys) out of docs
