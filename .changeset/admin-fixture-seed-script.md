---
'@bitrate/api': patch
---

Added `pnpm --filter @bitrate/api db:seed:admin`, an additive and idempotent fixture script that
creates the stuck/failed tracks, moderation reports across every status and entity type,
deactivated users/artists, an unreferenced genre, extra staff and roles, and audit history the
admin panel's coverage work is verified against. Never clears existing data and unconditionally
refuses to run with `NODE_ENV=production` — fixture data has no legitimate production use, so
unlike `db:seed:staff` this refusal has no override. It also refuses to run against a
non-local `DATABASE_URL` host (anything other than `localhost`/`127.0.0.1`/`::1` or the
`postgres`/`postgres_test` Docker service names) unless `ADMIN_FIXTURES_ALLOW_REMOTE_DB=true` is
set — production is refused either way, with no override.

`db:seed`, `db:seed:staff`, and `db:seed:admin` now load `.env` then `.env.local` — the same
first-file-wins order `apps/api`'s own `ConfigModule` uses — instead of a bare `dotenv/config`
that only reads `.env`. `apps/api` ships no `.env` by default, only `.env.local`, so all three
previously required `DATABASE_URL` to be inlined by hand.
