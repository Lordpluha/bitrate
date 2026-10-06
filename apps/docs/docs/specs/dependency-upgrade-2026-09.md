# Dependency upgrade 2026-09: behavior and implementation

## Goal and boundaries

Clear the outdated and deprecated dependency backlog across the monorepo without changing
runtime behavior. `prom-client` is deprecated (replaced by `@prometheus-io/client`, same
repository and author). Every other item is a version bump.

In scope: `apps/api`, `apps/admin`, `apps/web-player`, `apps/web-artists`, `apps/desktop`,
`packages/*`, root tooling. Excluded: schema changes, feature work, deferred majors below.

## Observable behavior and contracts

- `GET /metrics` keeps the same metric names, labels, buckets and content type.
- No public API, contract or database schema changes. Rollback is reverting the PR.
- Coordinated groups move as one unit so peer ranges stay satisfied: Angular, Prisma
  (client + adapter + CLI), Playwright (all four packages), aws-sdk, bullmq + ioredis,
  Sentry.
- `zod` and `@tanstack/react-query` are pinned in `pnpm-workspace.yaml` overrides; the
  override moves together with the manifests.

## Acceptance and evidence

| ID | Observable criterion | Verification | Result / limitation |
|---|---|---|---|
| AC-1 | `/metrics` output unchanged after the `prom-client` migration | `metrics.service.unit-spec.ts`, api `check-types` | Pending |
| AC-2 | Patch/minor bumps install, type-check, test and build per touched workspace | scoped `check-types`, `test:unit`, build | Pending |
| AC-3 | openapi-fetch 0.17 compiles against `@bitrate/contracts` in both web apps | `check-types` in web-player and web-artists | Pending |
| AC-4 | Angular 22.2 + spartan-ng 1.5 admin builds and tests pass | admin lint, test, build | Pending |
| AC-5 | Prisma 7.10 client regenerates; API tests and Docker build pass | api integration specs, Docker build | Pending |
| AC-6 | argon2 0.45 verifies hashes created by 0.44 | unit test with a fixture hash from 0.44 | Pending |
| AC-7 | All Playwright packages on 1.63; screenshot tests pass | ui-react and player screenshot runs | Pending |
| AC-8 | Tauri npm packages match the `tauri` crate line | desktop `check-types` and `cargo check` if toolchain present | Pending |
| AC-9 | Each in-scope major lands in its own group PR with changelog reviewed | per-PR checks | Pending |

## Decisions and approval

Agreed with the user in the planning interview on 2026-09-30, plan confirmed ("Confirm"):

- Staged PRs, each on a `chore/` worktree branch off `develop`: (A) `prom-client`
  migration + patch/minor bumps, (B) coordinated groups, (C+) one PR per major group.
- Majors in scope: bullmq 6 + ioredis 6, Sentry 11, nodemailer 10, dotenv 18, cross-env 10,
  execa 10, @changesets/cli 3, @compodoc/compodoc 2, jsdom 30 + @types/jsdom 30,
  jest-dom 7, vite-plugin-dts 5, postcss-load-config 6.
- Deferred, with reason and unblock condition:
  - `@babel/core` 8 (mobile): Expo needs Babel 7; earlier Babel 8 peer-leak incident.
    Unblocks when Expo supports Babel 8.
  - `@types/node` 26: ahead of the Node 24 runtime. Unblocks when the repo moves to Node 26.
  - `eslint` / `@eslint/js` 10: waits for typescript-eslint and the other ESLint plugins
    to declare v10 peer support.
- Verification: scoped local checks through `run-heavy.py`, plus targeted integration or
  screenshot runs for risky groups. Anything skipped is reported as unverified.
- Remote actions: local commits only; each push or PR needs the user's confirmation.

## Implementation plan

1. PR A: migrate `metrics.service.ts` to `@prometheus-io/client`, add a changeset, update
   the ADR-0044 note, then bump patch/minor packages (checking openapi-fetch and knip
   findings separately).
2. PR B: Angular 22.2 group, Prisma 7.10, Playwright 1.63, Tauri, aws-sdk, argon2 0.45,
   openapi-fetch 0.17.
3. PR C onward, lowest risk first: tooling majors, nodemailer 10, Sentry 11, then
   bullmq 6 + ioredis 6. Read each changelog before bumping.
4. Record final state of deferred items here.
