---
name: kottster
description: Kottster admin-panel conventions for apps/admin — the two constraints that make this app different (it bypasses the API, and Prisma owns the schema), page and data-source structure, safe Knex querying, and guard rails for destructive admin actions. Use when adding or changing an admin page, data source, or admin query.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Kottster — apps/admin

A Kottster admin panel (`@kottster/server`, `@kottster/react`, `@kottster/cli`) reaching
PostgreSQL through Knex.

## The two things that make this app different

### 1. It bypasses the API entirely

Kottster talks to PostgreSQL directly. **None of `apps/api`'s guards, Zod validation,
business rules, or side effects apply to anything you do here.** An invariant the API
enforces in a service — a status transition, a cascade, a cache invalidation, an audit
entry, a queued job — simply does not happen on the admin path.

Before adding a destructive or state-changing admin action, read what `apps/api` does for the
same entity and **say in your report which invariants the admin path does not reproduce**.
"Admin can set a track's status directly, bypassing the transcoding job the API enqueues" is
exactly the kind of thing that must be visible before it ships, not discovered later.

### 2. Prisma owns the schema

`apps/api/prisma/schema.prisma` is the single source of truth for the database. Knex here is
a **query builder, not a migration tool**.

- Never add a Knex migration.
- Never `ALTER TABLE`, `CREATE INDEX`, or otherwise change structure from this app.
- A schema change belongs to `sp-backend-developer` and a Prisma migration; the admin panel
  follows.

## Read the real schema before querying

Column and relation names come from `schema.prisma` — **not** from the API's DTOs or entity
classes, which are response shapes and are frequently renamed relative to the columns. Knex
will happily compile a query against a column that does not exist and fail only at runtime,
with an error that names the SQL rather than your code.

```bash
grep -A 20 "^model Track" apps/api/prisma/schema.prisma
```

Watch for Prisma's `@map`/`@@map` — the TypeScript field name and the actual column name are
not always the same, and Knex uses the column name.

## Structure

Follow Kottster's own conventions and the CLI's generated shape rather than hand-rolling:

```bash
pnpm --filter @bitrate/admin dev                    # dev server
pnpm --filter @bitrate/admin dev:add-data-source    # supported way to add a data source
pnpm --filter @bitrate/admin dev:upgrade-kottster
```

Read the existing pages and the `app/_server/` wiring before adding one. Kottster owns its
page model and UI kit — **web-player conventions do not apply here**: no FSD layers, no
`ROUTES`, no Tailwind/`cn()`, no `'use client'`. `.claude/rules/admin-rules.md` is this app's
law — read it first, including its security note about credentials committed to a public
repo.

## Querying safely

```ts
await knex('tracks').where({ id }).first()                   // ✓ parameterised
await knex.raw(`SELECT * FROM tracks WHERE id = '${id}'`)    // ✗ SQL injection
```

Use the builder. If `knex.raw` is genuinely needed, use bindings (`knex.raw('… = ?', [id])`),
never string interpolation. An admin panel is a high-value target precisely because it runs
with full database access.

Paginate anything that lists a table. `SELECT *` on a production-sized table in an admin grid
is how the panel becomes unusable at exactly the moment it matters.

## Destructive actions need a guard rail

Admin panels delete real production rows, and there is no undo. Any delete or bulk-update
surface needs an explicit confirmation in the UI, and should be called out in your report so
a human decides whether it belongs there at all. Prefer a soft delete or a status change over
a hard delete when the schema supports it.

## Secrets

The database connection comes from validated env — never a hardcoded connection string,
never a credential in source. Never read or write `.env*`.

## Documentation

Kottster is small and fast-moving, and there is little reliable material about it in model
memory. Read the installed `@kottster/*` types and the current official docs before using an
unfamiliar API. If the documentation you need is not available, say so rather than guessing.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@kottster/server` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@kottster/server/package.json').version"
   ```
2. **Then the official docs:** https://kottster.app/docs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because Kottster is small and fast-moving, and model memory about it is unreliable.

## Related

- `prisma-client-api` skill — reading `schema.prisma` for real column and relation names.
- `sp-admin-developer` agent — owns this surface.
- `.claude/rules/api-rules.md` — what the API does for the same entities.
