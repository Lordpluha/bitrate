# ADR-0002: Feature-Sliced Design for web-player

Status: Accepted

Date: 2026-06-24

## Context

The web player needs domain boundaries that remain understandable as playback, library,
authentication, playlist, and social features grow.

## Decision

`apps/web-player/src` uses:

```text
app → views → widgets → features → entities → shared
```

Imports flow downward only. Cross-slice imports at the same layer are forbidden.
Consumers use a slice's `index.ts` public API. New feature/entity slices are created from
`.claude/templates/` by `implement` through the `fsd-scaffold` skill.

The current tree contains some legacy naming. New code follows the canonical shape;
migrations are incremental and must not create a second competing convention.

## Consequences

Features own interactions, entities own domain state/types, and views own full-screen
composition. Mechanical linting plus `.claude/rules/architecture-checklist.md` guard the
boundaries.

## Alternatives considered

- **Folder-by-technical-type only** — rejected because domain ownership disappears.
- **Unenforced documentation** — rejected because boundaries erode without review gates.
