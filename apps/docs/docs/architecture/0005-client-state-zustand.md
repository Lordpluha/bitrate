# ADR-0005: Zustand target for client state

Status: Accepted

Date: 2026-06-24

## Context

The web player needs small, domain-owned client stores. Server state is handled by TanStack
Query.

## Decision

- New client state uses one Zustand store per owning entity/feature.
- Stores live in `<slice>/model/<name>Store.ts` and expose selector functions.
- Persistence is opt-in and narrow; persisted stores define `partialize`.
- Auth-bound stores expose `reset()` and register with the shared reset registry.
- `shared/store/` may contain generic factories/registries only, never concrete domain stores.
- Redux Toolkit is not used in the web player.

`shared/store/createPersistedStore.ts` owns the middleware composition and
`shared/store/resetStores.ts` owns reset registration.

## Consequences

The player state follows the same factory, selector, and reset contract expected from future
client stores.

## Alternatives considered

- **Redux Toolkit** — rejected due to boilerplate and global coupling.
- **React Context for application state** — rejected due to update granularity and lack of
  persistence/devtools conventions.
