# ADR-0035: The operator panel returns, on Angular, with its own data layer

Status: Accepted

Date: 2026-09-08

## Context

[ADR-0025](./0025-remove-admin-panel.md) deleted the Kottster panel and recorded the gap it left:
*"Operator work has no UI. This is a real gap, recorded rather than hidden."* It also set the
condition any replacement has to meet — *"the replacement, if built, should go through the API
rather than around it, so that one set of rules governs the data regardless of who is writing."*
Kottster's fatal property was reaching PostgreSQL directly through Knex, bypassing every guard,
schema, and queue job the API enforces.

That gap has stood since. Catalog work, artist and user management, and the moderation queue go
through the API by hand or through the database directly.

The API also had no notion of an operator: no role, no staff entity, no admin guard, no admin
endpoints. `AuditLog` and `ModerationReport` existed in the schema and nothing wrote to or read
from them. So the panel could not be built without building its backend first.

## Decision

A new application, `apps/admin`, on **Angular 22** — zoneless, standalone, SPA — talking to a new
`admin` module in `apps/api` over HTTP. It goes through the API, satisfying ADR-0025's condition.

**Access is a separate `Staff` entity**, not a role flag on `User`. An operator is not a listener;
keeping the tables apart means compromising an ordinary account grants nothing, and the audit
trail does not have to distinguish two meanings of one id.

**The data layer diverges from [ADR-0004](./0004-openapi-data-layer.md), on both axes**, and this
is the part most worth arguing with later:

- **No `openapi-fetch`.** Transport is Angular's `HttpClient`, because interceptors are how
  Angular expresses the refresh-on-401 behaviour, and `httpResource` only works over `HttpClient`.
- **No TanStack Query, and no cache at all.** Reads go straight to the API. Two components reading
  one endpoint issue two requests; a mutation is followed by an explicit reload.
- **Schemas are hand-written zod**, not generated from `@bitrate/contracts`. Not a preference —
  the generator reads the running API's Swagger, and these endpoints did not exist. There was
  nothing to generate.

**Linting is ESLint, not Biome** — the second exception after `apps/mobile`. Biome's language
support is fixed at compile time; ESLint is the only linter that accepts a third-party parser, and
`@angular-eslint/template-parser` is the only thing that can read an Angular template's semantics.
Measured on a representative component, Biome does lint Angular `.html` and catches eight a11y
rules with no false positives on modern Angular syntax — but it cannot see `(click)`, so the
keyboard-accessibility rules it needs most are exactly the ones it misses, and it has no view of
decorator metadata at all.

**UI is spartan-ng** (`@spartan-ng/brain` plus helm components copied in via its CLI) over Angular
CDK and Tailwind v4. It is the same methodology `packages/ui-react` already follows — shadcn over
headless primitives, CVA, `cn()` — which keeps the two libraries philosophically aligned even
though no code is shared. Tables use spartan's `hlm-table`; no table library, matching the web
player, which has none either.

**Dates use spartan's `provideUtcDateAdapter()`.** No `luxon`: the monorepo has no date library at
all, spartan's luxon peer is optional, and the API returns UTC timestamps, which the UTC adapter
handles without one.

## Consequences

- **The operator gap starts closing**, beginning with the moderation queue — the one workflow whose
  model (`ModerationReport`, with its status enum) already existed.
- **`AuditLog` gets its first writer.** Every operator mutation records who, what, and from where.
  The model has been in the schema unused since it was added.
- **`@bitrate/ui-react` is not reused.** Twenty-nine React components stay React. What is shared is
  the token layer — `themes.css` is plain Tailwind v4 CSS with no JavaScript, so it is imported
  directly and the package sits in `devDependencies` as a build-time dependency.
- **The monorepo now has two lint gates.** `.claude/rules/code-style.md` no longer describes Biome
  as the only one.
- **Three frontend frameworks are now in the repository** — Next.js, TanStack Start, Angular —
  plus React Native and Tauri. A pattern from one is not evidence for another.
- **Hand-written schemas can drift from the API** and only a runtime `parse` will catch it. Revisit
  once the admin module appears in the generated contract.
- The panel is served at `admin.<domain>` with `X-Frame-Options: DENY` and no public link.

## Alternatives considered

- **A role flag on `User`** — rejected. It merges the listener and operator identities in one
  table, so an account takeover escalates straight to operator, and every audit entry has to
  disambiguate which kind of subject its id refers to.
- **Another React app** — rejected because the request was explicitly for Angular. Worth recording
  what it would have bought: `@bitrate/ui-react` reused as-is, one lint gate, one framework fewer.
  That is the real price of this decision, and it is not small.
- **Keep ADR-0004's data layer** (`openapi-fetch` + TanStack Query via
  `@tanstack/angular-query-experimental`) — rejected on request. It would have kept one data-layer
  story across every frontend and given cache invalidation for free; without it, reload after
  mutation is manual and duplicate reads are real. If the panel grows past CRUD screens, this is
  the first decision to revisit.
- **Server-rendered Angular** (`@angular/ssr`) — rejected. Everything is behind operator auth;
  there is nothing to render for an anonymous visitor.
