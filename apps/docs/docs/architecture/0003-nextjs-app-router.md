# ADR-0003: Next.js App Router

Status: Accepted

Date: 2026-06-24

## Context

The web player benefits from server rendering, nested layouts, route groups, streaming, and
framework-owned server/client boundaries.

## Decision

- Routes live under `apps/web-player/src/app/`.
- Server Components are the default.
- `'use client'` is added only at the deepest boundary requiring hooks, events, context, or
  browser APIs.
- Navigation uses `ROUTES` from `@/shared/routes`.
- Route files delegate screen composition to `views/`; reusable sections live in widgets,
  features, and entities.
- Route handlers under `app/api/` are framework adapters, not a second business backend.

## Consequences

Code must be explicit about server-only and browser-only dependencies. Route strings remain
centralised even though Next.js filesystem paths are necessarily represented by folders.

## Alternatives considered

- **TanStack Router SPA** — valid for admin-style SPAs, but rejected because this product
  already relies on Next.js App Router and server rendering.
- **Pages Router** — rejected for new work; App Router is the repository standard.
