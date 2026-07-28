# ADR-0006: Shared UI package, tokens, Base UI, and shadcn methodology

Status: Accepted

Date: 2026-06-24

## Context

Web surfaces need consistent primitives, themes, icons, accessibility, stories, and visual
tests without locking product UI behind an opaque dependency.

## Decision

- `@spotify/ui-react` owns React component source and public exports.
- `packages/tokens/tokens.json` is the design-value source of truth.
- `@spotify/tokens-generator` produces Tailwind v4 CSS.
- Base UI and package-owned Slot helpers provide primitives.
- shadcn is a discovery/scaffolding methodology; generated code is reviewed and becomes
  repository-owned source.
- Public primitives receive Storybook stories and Vitest coverage proportional to behaviour.

## Consequences

Applications consume `@spotify/ui-react` before creating local primitives. Literal visual
values are promoted to tokens. Updating an upstream shadcn component uses CLI diff/merge,
not blind overwrite.

## Alternatives considered

- **Per-app component copies** — rejected because fixes and accessibility drift.
- **Runtime component dependency only** — rejected because local ownership and customisation
  are central to the design system.
