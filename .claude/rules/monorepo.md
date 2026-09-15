---
name: monorepo
description: Turborepo + pnpm topology and cross-package tooling — the workspace layout, why pnpm only, the root script table and what each gate actually enforces, the Taskfile as the single Docker interface, asset pipelines, cross-package imports, and environment variables. Use whenever adding a workspace, changing a root script or turbo.json, running the Docker/database workflows, or asking where something lives.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Monorepo conventions — Turborepo + pnpm

Working reference for the repository structure and cross-package tooling.

## Workspace topology

```
bitrate/
  apps/
    api/          NestJS backend — @bitrate/api
    web-player/   Next.js App Router — @bitrate/web-player
    web-artists/  Next.js artist-facing frontend — @bitrate/web-artists
    desktop/      Tauri 2 + React — @bitrate/desktop
    mobile/       React Native + Expo — @bitrate/mobile
    docs/         Docusaurus 3 — @bitrate/docs
  packages/
    ui-react/         Shared React component library — also owns the design tokens,
                      hand-written as Tailwind @theme layers in src/styles/
    contracts/        OpenAPI TypeScript types
    vite-svgr/        Vite SVG plugin
    svgr/             SVG → React converter
    converter/        Media conversion utilities
    ncs-parser/       NCS audio format parser
  infra/
    docker-compose.dev.yaml       infra only: postgres, postgres_test, redis, mailhog
    docker-compose.preprod.yaml   full stack — what every `task dev:*`/`db:*` targets
    docker-compose.prod.yaml      production stack
    docker-monitor.sh             health/resource/db/error reporting — see `task monitor:*`
    nginx/                        reverse-proxy config for the preprod and prod stacks
  biome.json      Root Biome config (extended by apps)
  turbo.json      Turborepo pipeline
  Taskfile.yml    Task runner — the only interface to Docker/db workflows
  pnpm-workspace.yaml
```

## Package manager

**pnpm only.** Never `npm install` or `yarn add`.

```bash
pnpm install                          # install all deps
pnpm add <dep> --filter @bitrate/api  # add to a specific package
pnpm --filter @bitrate/web-player dev # run a script in one package
```

### TypeScript 6 and `peerDependencyRules`

The repo is on TypeScript `^6.0.3` everywhere. Four transitive packages still declare a
`typescript@^5` peer — `openapi-typescript`, `tsconfck`, `i18next`, `@expo/require-utils` —
so a plain install printed four `unmet peer` warnings. `package.json` now declares TS 6
acceptable for exactly those four via `pnpm.peerDependencyRules.allowedVersions`.

This is not a suppression of a real break. `openapi-typescript@7.13.0` is the latest release,
its `^5.x` peer range is simply stale, and it was verified to generate correct output while
resolving `typescript@6.0.3`. **A peer cannot be given its own copy of a dependency** —
`pnpm.overrides` rewrites the requirement, not the resolution, so a scoped
`openapi-typescript>typescript` override only changes what the warning says. Do not
"fix" these warnings by downgrading the repo to TypeScript 5.

Three unrelated peers remain genuinely unmet and are **not** covered by these rules — leave
them visible until someone bumps them:

| Consumer | Wants | Installed |
|---|---|---|
| `openapi-react-query@0.5.4` (web-artists) | `openapi-fetch@^0.17.0` | `0.15.2` |
| `@swc/core` (docs) | `@swc/helpers@>=0.5.17` | `0.5.15` |
| `@swc/cli@0.8.1` (api) | `chokidar@^5.0.0` | `4.0.3` |

## Root scripts

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start all apps (needs postgres + redis running) |
| `pnpm build` | Build all packages + apps in dependency order |
| `pnpm lint` | Biome lint all — a **gate**: `--error-on-warnings`, never writes |
| `pnpm lint:fix` | Per-package autofix (`biome lint --write`) — the opt-in mutating form |
| `pnpm format` | Biome format all |
| `pnpm check-types` | `tsc --noEmit` in every workspace that has the script |
| `pnpm knip` | Detect unused files, exports, and dependencies |
| `pnpm test` | `turbo run test` in every workspace that has the script |
| `pnpm commit` | Interactive Conventional Commits wizard |

There are **no `pnpm docker:*` scripts**. Docker, database, and monitoring workflows live
in `Taskfile.yml` only — see "Task runner" below. Do not reintroduce a pnpm script that
wraps a compose command; that split is what let `docker:logs:web` point at a service name
that had not existed for months.

## Task runner

[`task` (go-task)](https://taskfile.dev/installation/) is a required tool, and `Taskfile.yml`
at the repo root is the single interface for anything involving Docker. `task` with no
arguments lists every task with its description; the groups are:

| Group | Covers |
|---|---|
| `infra:*` | `docker-compose.dev.yaml` — postgres, postgres_test, redis, mailhog |
| `dev:*` | `docker-compose.preprod.yaml` — the full app stack |
| `prod:*` | `docker-compose.prod.yaml` |
| `db:*` | Prisma inside the `api` container; `:native` variants run it on the host |
| `shell:*` | a shell (or psql) inside one container |
| `mobile:*`, `desktop:*` | the profile-gated services |
| `monitor:*` | wrappers over `infra/docker-monitor.sh` — health, resources, db, errors |
| `app:*` | thin mirrors of the root pnpm scripts |
| `init`, `init:native` | first-run setup, all-Docker or infra-only |

Two conventions worth keeping when editing it: destructive tasks declare `prompt:`, and
tasks never hardcode database credentials — they read `POSTGRES_USER`/`POSTGRES_DB` from
the container's own environment so an override in `.env` cannot silently break them.

`check-types` runs in `api`, `desktop`, `mobile`, `docs`, `web-player`,
`web-artists`, `ui-react`, `contracts`, and `ncs-parser`. The remaining packages
(`converter`, `svgr`, `vite-svgr`) have no
`tsconfig.json`, so there is nothing to check — that is deliberate, not a gap to fill.

Both `check-types` and `test` declare `dependsOn: ["^build"]` in `turbo.json`, because
`web-player` and `web-artists` resolve `@bitrate/ui-react` through its built
`dist/types/index.d.ts`. Without that edge a stale `dist/` makes `pnpm check-types` fail on
components that exist in `src/` — do not remove it.

## Recommended local dev setup

```bash
# First run: infra + migrations + seed + apps
task init:native

# Afterwards
task infra:up   # infra in Docker
pnpm dev        # apps natively
```

## Turborepo pipeline

`turbo.json` defines the dependency graph. `pnpm build` runs packages before apps. `dependsOn: ["^build"]` means `web-player` builds after `ui-react`. Don't break this ordering by adding manual build scripts.

## Asset generation pipelines

These must be re-run when source data changes:

```bash
# SVG sources in packages/ui-react/assets/icons/ are converted into
# src/icons/svgr/ by the svgr plugin in vite.config.ts during
pnpm --filter @bitrate/ui-react build

# After changing API endpoints (API must run on :3000)
pnpm --filter @bitrate/contracts gen:api
```

`openapi-typescript@7.13.0` — the latest release — still declares `peerDependencies:
{ typescript: "^5.x" }`, while this repo ships TypeScript 6. That range is stale, not a real
incompatibility: the generator touches the compiler API only through `ts.factory` and the
printer, both unchanged in 6.0, and generating against a spec on 6.0.3 produces correct
nullable fields, literal unions, and `operations` entries. Root `package.json` records that
in `pnpm.peerDependencyRules.allowedVersions`. **Do not "fix" the warning by downgrading
TypeScript** — re-run the generator and re-verify before changing either version.

## Cross-package imports

Use workspace package names, not relative paths:

```ts
import type { ApiPaths } from '@bitrate/contracts'
import { Button } from '@bitrate/ui-react'
```

## Adding a new package

1. Create `packages/<name>/` with `package.json` (name: `@bitrate/<name>`).
2. Add to `pnpm-workspace.yaml` packages list.
3. Add a `tsconfig.json`.
4. Add a reference in `turbo.json` if it has a `build` step.
5. Run `pnpm install` to link.

## Documentation ownership

- Root onboarding: `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`.
- Working agent/human rules: `CLAUDE.md` and `.claude/`.
- Durable decisions: `apps/docs/docs/architecture/`.
- Design/accessibility contracts: `apps/docs/docs/brand/`.
- Published product/developer guides: `apps/docs/docs/`.

Do not create a second contradictory source of truth; link to the canonical layer.

**Link, don't restate.** `apps/docs/docs/applications/*/overview.md` and
`apps/docs/docs/getting-started/architecture.md` are human onboarding pages — a short
summary plus a link to the owning ADR or rule file. Do not reproduce a full FSD layer tree,
module folder tree, or tech-stack list that a specific `.claude/rules/*.md` or
`.claude/rules/*.md` file already owns; that tree drifts the moment the rule file changes,
since no agent workflow reads `apps/docs/` while implementing (see
[ADR-0011](../../apps/docs/docs/architecture/0011-retire-apps-web.md), a real incident this
caused, and [ADR-0013](../../apps/docs/docs/architecture/0013-docs-sync.md)). Run
`/br-sync-docs` periodically to catch drift before it goes stale for months.

## Environment variables

Three sources, and only three. There is **no repository-root `.env`** and no root template —
do not reintroduce either.

| Where a value is needed | Where it comes from |
|---|---|
| Deploy and CI | GitHub environment secrets and variables, referenced as `${{ secrets.NAME }}` / `${{ vars.NAME }}` and passed to a step through `env:` |
| A developer running one app natively | That app's own `.env`, seeded from its own `apps/<app>/.env.example` |
| The Docker stacks | The `:-default` values written into `infra/docker-compose.*.yaml` |

Every variable in `docker-compose.dev.yaml` and `docker-compose.preprod.yaml` is declared
with a default, so both stacks come up on a clean checkout with no env file present;
`docker compose -f infra/docker-compose.dev.yaml config -q` exits 0 with nothing to read.
Override one by exporting it in the shell — a shell variable beats the compose default.
`Taskfile.yml`'s `infra:*` and `dev:*` therefore pass no `--env-file`; adding one back makes
every `task dev:*` fail with `couldn't find env file` on a clean checkout.

`docker-compose.prod.yaml` is the exception on both counts. It defaults **nothing**
(`DOMAIN`, `DATABASE_URL`, `JWT_SECRET`, `POSTGRES_*`, `REDIS_PASSWORD`, `WEB_HOST`,
`NEXT_PUBLIC_*`), and `DC_PROD` **keeps** `--env-file .env`. That is not a leftover: the deploy
workflow renders those values from GitHub environment secrets into `$HOME/bitrate/.env` on the
server (mode 600), rsyncs `infra/` and `Taskfile.yml` beside it, and runs `task prod:deploy`
there. That file is a deploy artifact on the target host, never a repository file — **do not
"tidy" the flag away, it breaks production deploys.** `config` failing on `DOMAIN` outside a
deploy is the guard working.

A CI job that needs a non-default value sets it as job- or step-level `env:` so compose picks
it up through shell interpolation. Do **not** write a root `.env` in a workflow: with
`-f infra/...` the project directory is `infra/`, so compose looks for `infra/.env` and
ignores a root one entirely — a root `.env` written by a CI step is silently dead.

The API validates its own env at startup via Zod (`apps/api/env.schema.ts`). Required API
vars: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `WEB_HOST`.

## Pre-push hook

`lefthook` runs a full monorepo build before push. Alternatives:
```bash
WEB_ONLY=true git push   # build only api + web-player + ui-react
LEFTHOOK=0 git push      # skip hooks (hotfixes/docs only)
```
