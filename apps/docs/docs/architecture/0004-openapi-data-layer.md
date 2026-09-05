# ADR-0004: OpenAPI-first client and TanStack Query

Status: Accepted

Date: 2026-06-24

## Context

Frontend applications need typed API contracts, JWT refresh behaviour, caching, mutations,
and a single place for transport concerns.

## Decision

- NestJS Swagger at `/swagger/json` is the contract source.
- `@bitrate/contracts` generates TypeScript paths from the running API.
- `apps/web-player/src/shared/api/client/fetchClient.ts` owns `openapi-fetch` transport and
  JWT refresh middleware.
- `reactQueryClient.ts` wraps it with `openapi-react-query`.
- Server state belongs in TanStack Query; components do not fetch through ad-hoc effects.
- Raw `fetch`/Axios calls are permitted only in explicit infrastructure adapters where the
  shared client cannot represent the requirement.

## Consequences

Contract changes require regeneration. Consumers receive endpoint-derived types and shared
auth behaviour rather than hand-maintained response interfaces.

## Alternatives considered

- **Axios with generated resource modules** — rejected because this repository already has
  an OpenAPI Fetch pipeline.
- **Hand-written request hooks** — rejected where generated endpoint typing is available.
