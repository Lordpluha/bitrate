---
name: admin-rules
description: Kottster admin panel rules for apps/admin — the open secrets-in-git issue to read first, the two constraints that define the app (it reaches PostgreSQL directly and so bypasses every API guard, and Prisma owns the schema so Knex is a query builder not a migration tool), safe parameterised querying, and guard rails for destructive actions. Use whenever writing or reviewing a page, data source, or query under apps/admin/.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Admin rules — apps/admin (Kottster + Knex)

Read before writing any file in `apps/admin/`. Pair with the `kottster` skill, which covers
framework mechanics; this file is project law.

## ⚠️ Open security issue — read first

`apps/admin/app/_server/app.ts` and
`apps/admin/app/_server/data-sources/spotify_postgres_local/index.ts` are **tracked in git in
a public repository** and contain live literal values:

- the Kottster `secretKey` and `kottsterApiToken`,
- the identity provider's `jwtSecretSalt`,
- the root admin username and password,
- the PostgreSQL connection user and password.

The template's own comment in `app.ts` says to move these to environment variables; it was
not done. **These credentials must be treated as compromised** — public git history exposes
them, and rewriting history does not un-expose what was already published.

Rules that follow from this:

- **Never add another literal secret to this app.** Read every value through validated env.
- **Do not "fix" this by editing the files quietly.** Rotating the Kottster token, the secret
  key, the JWT salt, and the database password is the user's action; a code change alone
  leaves the live credentials valid.
- If you touch either file for any reason, restate this in your report.

## Status: one page, mostly generated

The app has a single table page (`app/pages/likedTracks/`) over `_UserLikedTracks`, one data
source, and Kottster's generated `dist/`. Pages are **JSON configuration**
(`page.json`), not hand-written React — respect that shape rather than replacing it with
custom components.

`apps/admin/dist/` and `kottster-app.json` are generated/managed by the Kottster CLI. Do not
hand-edit them.

## The two constraints that define this app

### 1. It bypasses the API entirely

Kottster reaches PostgreSQL directly through Knex. **None of `apps/api`'s guards, Zod
validation, business rules, queue jobs, or audit paths apply to anything done here.** An
invariant a NestJS service enforces simply does not happen on an admin write.

Before adding a destructive or state-changing admin surface, read what `apps/api` does for
the same entity and **state in your report which invariants the admin path does not
reproduce**. "Admin can change a track's status directly, bypassing the transcoding job the
API enqueues" must be visible before it ships, not discovered afterwards.

### 2. Prisma owns the schema

`apps/api/prisma/schema.prisma` is the single source of truth for the database. Knex here is
a **query builder, not a migration tool**.

- Never add a Knex migration.
- Never `ALTER TABLE` / `CREATE INDEX` from this app.
- A schema change belongs to `sp-backend-developer` and a Prisma migration; the admin panel
  follows.

Read column names from `schema.prisma`, **not** from the API's DTOs or entity classes — those
are response shapes and are frequently renamed. Watch for Prisma `@map`/`@@map`: the
TypeScript field name and the real column name differ, and Knex uses the column. Note the
existing page targets `_UserLikedTracks`, a Prisma implicit-relation join table — those are
Prisma-managed and especially unsafe to write to by hand.

## What does NOT apply here

| Web-player rule | Status in `apps/admin` |
|---|---|
| FSD layers | Not used — Kottster owns the page model |
| `ROUTES` | Kottster routing |
| Tailwind / `cn()` / CVA | Kottster's own UI kit |
| `'use client'` | No server component model |

Rules that **do** apply: `.claude/rules/typescript.md` and `.claude/rules/code-principles.md`.

## Structure

```
apps/admin/
  app/
    main.tsx
    pages/<name>/page.json          page config (type, dataSource, table)
    schemas/sidebar.json            navigation
    _server/app.ts                  createApp + identity provider
    _server/server.ts
    _server/data-sources/<name>/    dataSource.json + index.ts (Knex adapter)
  kottster-app.json                 GENERATED
  dist/                             GENERATED
```

Use the CLI rather than hand-rolling:

```bash
pnpm --filter @spotify/admin dev
pnpm --filter @spotify/admin dev:add-data-source
pnpm --filter @spotify/admin dev:upgrade-kottster
```

## Querying safely

```ts
await knex('tracks').where({ id }).first()                    // ✓ parameterised
await knex.raw(`SELECT * FROM tracks WHERE id = '${id}'`)     // ✗ SQL injection
```

Use the builder. If `knex.raw` is genuinely required, use bindings (`knex.raw('… = ?', [id])`),
never interpolation. Paginate anything listing a table — `SELECT *` on a production-sized
table is how the panel becomes unusable exactly when it matters.

## Destructive actions

Admin panels delete real rows and there is no undo. A delete or bulk-update surface needs
explicit confirmation in the UI and must be called out in your report so a human decides
whether it belongs there. Prefer a soft delete or status change where the schema supports it.

## Commands

```bash
pnpm --filter @spotify/admin check-types
```

This app has a `check-types` script (`tsc --noEmit`) but **no lint and no tests**. Say so
rather than claiming a mechanical pass that did not run.

## Related

- `kottster` skill — page/data-source structure and Knex specifics.
- `prisma-client-api` skill — reading `schema.prisma` for real column names.
- `sp-admin-developer` — the agent that owns this app.
