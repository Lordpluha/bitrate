# ADR-0011: Retire apps/web in favor of apps/web-player

Status: Accepted

Date: 2026-07-20

## Context

`apps/web` was the original Next.js web client (Redux slices, Axios, SWR). `apps/web-player`
was introduced as its Feature-Sliced Design replacement (ADR-0002), with the OpenAPI-first
client (ADR-0004), Zustand client state (ADR-0005), and shadcn-based UI (ADR-0006). `apps/web`
was deleted from the repository (see `e12fd0c13`, `cd4379292`, `36749c0b3`), but
`apps/docs/docs/applications/web/` was never updated: it still names the deleted directory and
documents an obsolete stack (Axios, SWR, Redux slices) that contradicts ADR-0004 and ADR-0005.
This was surfaced by a graphify knowledge-graph pass, which flagged the doc as an unresolved
contradiction against ADR-0004.

## Decision

`apps/web-player` is the sole first-party Next.js web client. `apps/web` is retired and must
not be recreated. `apps/docs/docs/applications/web/` is replaced with
`apps/docs/docs/applications/web-player/`, describing the current FSD + openapi-fetch +
TanStack Query + Zustand stack.

## Consequences

Documentation, onboarding, and future contributors reference a single web app and a single
API-client convention. No dual-maintenance of two competing web clients or two contradictory
sets of frontend architecture docs.

## Alternatives considered

- **Keep `apps/web/` docs as a historical record** — rejected; a stale doc that silently
  contradicts current ADRs is worse than no doc, since it actively misleads rather than
  informs.
