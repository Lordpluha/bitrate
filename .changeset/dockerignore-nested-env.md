---
'@bitrate/api': patch
---

Nested `.env` files are excluded from every Docker build context, and `prisma generate` no longer
depends on one being there.

`.dockerignore` patterns are matched against the context root, so a bare `.env` line excluded only
`./.env` and left `apps/api/.env`, `apps/api/.env.test`, `apps/mobile/.env`, and
`apps/web-player/.env.development` in the context of every image built with `COPY . .`. They never
reached a production image — the final stages copy named artifacts rather than the tree — but they
did land in the build stage, which is exported to the registry as build cache. The patterns are
`**/.env` and `**/.env.*` now, with the example templates negated back in.

That exclusion is what surfaced the real bug. `prisma.config.ts` read the shadow database URL as
`process.env.SHADOW_DATABASE_URL || env('SHADOW_DATABASE_URL')` and then spread it conditionally,
which reads as "optional" — but Prisma's `env()` throws on a missing variable rather than returning
undefined, so the conditional could never see a falsy value and loading the config failed outright
wherever the variable was unset. It builds locally only because a developer's `apps/api/.env` was
being copied in; CI, which has no such file, failed. The shadow database is only used by
`migrate dev`, and production runs `migrate deploy`, so it is read from `process.env` and genuinely
optional now.
