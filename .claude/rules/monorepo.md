# Monorepo conventions — Turborepo + pnpm

Working reference for the repository structure and cross-package tooling.

## Workspace topology

```
spotify-clone/
  apps/
    api/          NestJS backend — @spotify/api
    web-player/   Next.js App Router — @spotify/web-player
    admin/        Kottster admin — @spotify/admin
    desktop/      Tauri 2 + React — @spotify/desktop
    mobile/       React Native + Expo — @spotify/mobile
    docs/         Docusaurus 3 — @spotify/docs
  packages/
    ui-react/         Shared React component library
    tokens/           Raw design tokens + SVG icons
    tokens-generator/ CSS generator CLI
    contracts/        OpenAPI TypeScript types
    vite-svgr/        Vite SVG plugin
    svgr/             SVG → React converter
    converter/        Media conversion utilities
    ncs-parser/       NCS audio format parser
    performance-test/ K6 test scenarios
  infra/
    docker-compose.dev.yaml   postgres + redis only (~320 MB)
    docker-compose.yaml       full stack
  biome.json      Root Biome config (extended by apps)
  turbo.json      Turborepo pipeline
  pnpm-workspace.yaml
```

## Package manager

**pnpm only.** Never `npm install` or `yarn add`.

```bash
pnpm install                          # install all deps
pnpm add <dep> --filter @spotify/api  # add to a specific package
pnpm --filter @spotify/web-player dev # run a script in one package
```

## Root scripts

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start all apps (needs postgres + redis running) |
| `pnpm build` | Build all packages + apps in dependency order |
| `pnpm lint` | Biome lint all |
| `pnpm format` | Biome format all |
| `pnpm check-types` | `tsc --noEmit` across all apps |
| `pnpm knip` | Detect unused files, exports, and dependencies |
| `pnpm commit` | Interactive Conventional Commits wizard |
| `pnpm docker:dev:build` | First run — build + start all Docker containers |
| `pnpm docker:dev` | Subsequent Docker runs |
| `pnpm docker:down` | Stop Docker stack |

## Recommended local dev setup

```bash
# Minimal: just infrastructure
docker-compose -f infra/docker-compose.dev.yaml up -d

# Apps natively
pnpm dev
```

## Turborepo pipeline

`turbo.json` defines the dependency graph. `pnpm build` runs packages before apps. `dependsOn: ["^build"]` means `web-player` builds after `ui-react`. Don't break this ordering by adding manual build scripts.

## Asset generation pipelines

These must be re-run when source data changes:

```bash
# After editing packages/tokens/tokens.json
pnpm --filter @spotify/ui-react gen:tokens

# After adding/changing packages/tokens/icons/
pnpm --filter @spotify/ui-react svgr:build

# After changing API endpoints (API must run on :3000)
pnpm --filter @spotify/contracts gen:api
```

## Cross-package imports

Use workspace package names, not relative paths:

```ts
import type { ApiPaths } from '@spotify/contracts'
import { Button } from '@spotify/ui-react'
```

## Adding a new package

1. Create `packages/<name>/` with `package.json` (name: `@spotify/<name>`).
2. Add to `pnpm-workspace.yaml` packages list.
3. Add a `tsconfig.json`.
4. Add a reference in `turbo.json` if it has a `build` step.
5. Run `pnpm install` to link.

## Documentation ownership

- Root onboarding: `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`.
- Working agent/human rules: `AGENTS.md` and `.claude/`.
- Durable decisions: `apps/docs/docs/architecture/`.
- Design/accessibility contracts: `apps/docs/docs/brand/`.
- Published product/developer guides: `apps/docs/docs/`.

Do not create a second contradictory source of truth; link to the canonical layer.

## Environment variables

Copy `.env.example` to `.env` for Docker Compose variables. The API validates its own env at startup via Zod (`apps/api/env.schema.ts`). Required API vars: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `WEB_HOST`.

## Pre-push hook

`lefthook` runs a full monorepo build before push. Alternatives:
```bash
WEB_ONLY=true git push   # build only api + web-player + ui-react
LEFTHOOK=0 git push      # skip hooks (hotfixes/docs only)
```
