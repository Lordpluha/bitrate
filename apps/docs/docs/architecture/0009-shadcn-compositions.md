# ADR-0009: shadcn produces package-owned compositions

Status: Accepted

Date: 2026-06-24

## Context

Registry primitives are useful starting points but rarely match this package's tokens,
exports, icon pipeline, tests, or compatibility requirements unchanged.

## Decision

- Search existing `@bitrate/ui-react` exports first.
- Use the shadcn CLI for discovery, docs, and source previews. MCP stays disabled by
  default and is enabled only locally or by explicit team decision.
- Prefer composing installed primitives over adding near-duplicates.
- New registry code lands under `packages/ui-react/src/components/ui/`, is adapted to the
  package API, exported through barrels, and receives stories/tests.
- Existing components are updated through `--dry-run` and `--diff`; overwrite requires
  explicit approval.

## Consequences

The registry is an input, not an authority. Local compatibility may intentionally override
generic shadcn advice and must be documented in the `ui-react-rules` skill.

## Alternatives considered

- **Blind registry installation** — rejected because it can break local APIs and tokens.
- **Never use registries** — rejected because discovery and accessible composition patterns
  are valuable.
