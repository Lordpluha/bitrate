# ADR-0060: API data write ownership enforced by an oxlint JS plugin

Status: Accepted

Date: 2026-10-19

## Context

`PrismaService` is global, so any API module can write any table. The admin area writes
users, sessions, tracks, albums, releases, playlists, podcasts and moderation reports
directly, beside the modules that own those rules. A rule such as "what removing a track
means" then lives in two places and drifts. Nothing in the toolchain noticed: the API is
linted by Biome, which has no API for a rule that needs a module map and the file's path.

## Decision

- Every Prisma model has an owning **scope**: a folder under `src/modules/`, an admin
  area (`admin/genres`, `admin/staff`) or an `src/infra/` folder. The map lives in
  `apps/api/oxlint/data-ownership.mjs`. **Writes** (`create*`, `update*`, `upsert`,
  `delete*`) are restricted to the owner; reads stay open to every module.
- `bitrate-api/prisma-write-ownership`, an oxlint JS plugin in
  `apps/api/oxlint/prisma-write-ownership.mjs`, reports `<client>.<model>.<write>(…)` from
  any other scope. Matching is syntactic, so `this.prisma`, a transaction `tx` and aliases
  are all covered. The model list is read from the Prisma schema (one file or a folder).
- Existing violations are recorded in `apps/api/oxlint/data-ownership-baseline.json`
  (per file and model). A file over its allowance fails; a file under it also fails until
  the entry is lowered, so the baseline only shrinks. It started at 27 writes in 11 files,
  all but one in `admin/*`.
- oxlint runs **only** this rule in the API (`apps/api/.oxlintrc.json` turns every built-in
  category off). Biome remains the API's lint and format gate. `pnpm --filter @bitrate/api
  lint` runs both, and the API CI job runs `lint:data-ownership` after `biome ci`.
- `apps/api/oxlint/data-ownership.test.mjs` (`node:test`) fails when a schema model has no
  owner, an owner folder or baseline file disappears, or the rule's behaviour changes; it
  runs oxlint itself over `oxlint/fixtures/`.
- Seeds (`src/infra/seeds/`) and tests are exempt: fixtures legitimately write every table.

## Consequences

- A new model needs an owner in the same change; a cross-module write needs the owner's
  service or an explicit, reviewed ownership change.
- Reducing the baseline is the migration path for admin: each admin area calls the domain
  service and its baseline entry is lowered or removed.
- Out of scope, because a syntactic rule cannot see them: nested relation writes inside
  `data` (`user.update({ data: { sessions: { create } } })`), `$executeRaw`, and writes
  reached through a helper defined in the owner but called elsewhere. Review covers them.
- The API now has two linters with disjoint jobs. oxlint adds one dev dependency and runs
  in well under a second over `src/`.

## Alternatives considered

- **ESLint with a local rule** — works and has built-in bulk suppressions, but adds a
  second full linter stack to a Biome workspace; oxlint runs the same ESLint-style rule
  API with a much lighter footprint.
- **Biome GritQL plugin** — syntactic pattern only; it cannot read the ownership map or
  derive the module from the file path.
- **Repository layer per module** — the boundary would be a convention again, with no
  check that other modules do not inject `PrismaService` directly.
