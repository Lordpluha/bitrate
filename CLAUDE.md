# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Turborepo + pnpm monorepo for a full-stack Spotify clone. All packages share the `@spotify/` namespace.

**Apps** (`apps/`):
- `api` — NestJS backend (port 3000), PostgreSQL via Prisma, Redis, BullMQ, Socket.io
- `web-player` — Next.js 15 App Router frontend (port 3001), Feature-Sliced Design
- `admin` — Kottster admin panel (port 3002)
- `desktop` — Tauri 2 + React + Vite desktop app (port 1420 in dev)
- `mobile` — React Native + Expo
- `docs` — Mintlify documentation site

**Packages** (`packages/`):
- `ui-react` — shared React component library (React 19, Tailwind v4, shadcn/ui, Storybook)
- `tokens` — raw design tokens (`tokens.json`) and SVG icons source
- `tokens-generator` — CLI/programmatic CSS generator from `tokens.json`
- `contracts` — OpenAPI TypeScript types, auto-generated from Swagger
- `vite-svgr` — Vite plugin wrapping `@spotify/svgr` — integrates SVG-to-React generation into the build pipeline
- `svgr` — SVG → typed React component converter (used for icons in `ui-react`)
- `converter` — media/audio conversion utilities for the API

## Commands

### Root (runs all apps via Turbo)

```bash
pnpm install          # install all deps
pnpm dev              # start all apps (needs postgres + redis running separately)
pnpm build            # build all packages + apps in dependency order
pnpm lint             # Biome lint all
pnpm format           # Biome format all
pnpm check-types      # tsc --noEmit across all apps
```

### Local development setup

The recommended workflow is a minimal Docker stack for infrastructure + native processes for apps:

```bash
# Start only postgres + redis (~320 MB)
docker-compose -f infra/docker-compose.dev.yaml up -d

# Then run apps natively
pnpm dev
```

Full Docker stack (heavy, ~70 GB images total):
```bash
pnpm docker:dev:build   # first run — builds + starts all containers
pnpm docker:db:migrate  # run Prisma migrations
pnpm docker:db:seed     # seed test data
pnpm docker:dev         # subsequent runs
pnpm docker:down        # stop
```

### Per-app commands

**API** (`apps/api`):
```bash
pnpm --filter @spotify/api start:dev         # watch mode
pnpm --filter @spotify/api test              # unit tests (Jest, src/**/*.spec.ts)
pnpm --filter @spotify/api test:int          # integration tests (real DB required)
pnpm --filter @spotify/api test:e2e          # E2E tests
pnpm --filter @spotify/api test:cov          # coverage
pnpm --filter @spotify/api db:migration:start # run Prisma migrations
pnpm --filter @spotify/api db:ui             # open Prisma Studio
pnpm --filter @spotify/api db:seed          # seed data
```

**Web player** (`apps/web-player`):
```bash
pnpm --filter @spotify/web-player dev        # Next.js dev server on :3001
pnpm --filter @spotify/web-player check-types
```

**Desktop** (`apps/desktop`):
```bash
pnpm --filter @spotify/desktop dev           # Vite dev server on :1420
pnpm --filter @spotify/desktop tauri dev     # Full Tauri app with native window
```

**Mobile** (`apps/mobile`):
```bash
pnpm --filter @spotify/mobile start          # Expo Metro bundler
pnpm --filter @spotify/mobile android
pnpm --filter @spotify/mobile ios
```

**tokens-generator** (`packages/tokens-generator`):
```bash
pnpm --filter @spotify/tokens-generator test  # node:test integration tests
```

### Asset / contract generation pipelines

These must be re-run when source data changes:

```bash
# 1. Regenerate CSS design tokens (after editing packages/tokens/tokens.json)
pnpm --filter @spotify/ui-react gen:tokens
# Runs: tokens-generator --tokens ../tokens/tokens.json --output ./src/styles
# Writes: ui-react/src/styles/{palette,layout,typography,themes}.css

# 2. Regenerate SVG icon components (after adding/changing packages/tokens/icons/)
pnpm --filter @spotify/ui-react svgr:build
# Writes: ui-react/src/icons/svgr/

# 3. Regenerate OpenAPI TypeScript types (API must be running on :3000)
pnpm --filter @spotify/contracts gen:api
# Fetches http://localhost:3000/swagger/json → writes packages/contracts/src/api/v1.ts
```

### Git workflow

```bash
pnpm commit           # interactive Conventional Commits wizard (use instead of git commit -m)

# Pre-push hook builds the full monorepo. Alternatives:
WEB_ONLY=true git push    # build only api + web-player + ui-react (faster for web devs)
LEFTHOOK=0 git push       # skip all hooks (hotfixes/docs only)
```

Branch naming: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `test/`, `hotfix/`.

### Versioning and changelogs (Changesets)

```bash
pnpm changeset          # describe what changed and select bump type (patch/minor/major)
pnpm changeset:version  # apply pending changesets → bump versions + update CHANGELOG.md
pnpm changeset:release  # create git tags for released versions (run after version step)
```

**Workflow per PR:**
1. Make changes, then run `pnpm changeset` — select affected packages and bump level
2. Commit the generated `.changeset/*.md` file alongside the code
3. On merge to `develop`, the `release.yml` GitHub Action creates/updates a "Version Packages" PR
4. Merging that PR bumps all `package.json` versions, updates `CHANGELOG.md` files, and creates GitHub Releases with tags

Skip the changeset step only for `docs`, `ci`, or `chore` commits that don't change package behaviour.

## Code style

Biome handles both linting and formatting (config in `biome.json` at root):
- 2-space indent, single quotes, **no semicolons**, trailing commas, 100-char line width
- TypeScript throughout; `async/await` over raw Promises

## Architecture

### API (NestJS)

Standard NestJS module structure under `apps/api/src/modules/`. Each module owns its controller, service, and Prisma queries. Path aliases: `@modules/`, `@infra/`.

**Three test layers** (see `apps/api/TESTING.md`):
- **Unit** (`*.spec.ts`) — mocked Prisma + services, no infrastructure
- **Integration** (`*.int-spec.ts`) — real Prisma + test database, in-process
- **E2E** (`test/e2e/**/*.e2e-spec.ts`) — HTTP calls against a running API instance

Integration and E2E require `DATABASE_URL`, `REDIS_HOST`/`REDIS_PORT`, and JWT env vars. See `apps/api/env.schema.ts` for the full validated env shape.

### Web player (Next.js)

Follows **Feature-Sliced Design**. Layers in `src/`:
- `app/` — Next.js App Router pages and layouts
- `views/` — full-page view compositions
- `widgets/` — self-contained page sections (`Header`, `Player`, `LeftSidebar`, …)
- `features/` — user interactions (`Album`, `Playlist`, `AuthModal`, …)
- `entities/` — domain objects (`Track`, `User`, `Player`, …)
- `shared/` — cross-cutting: `api/`, `hooks/`, `store/`, `ui/`, `routes/`, `constants/`, `validation/`

**API client** (`src/shared/api/client/`):
- `fetchClient.ts` — `openapi-fetch` client with automatic JWT refresh middleware
- `reactQueryClient.ts` — `openapi-react-query` wrapper; exports `useQuery`, `useMutation`, etc.
- Types come from `@spotify/contracts` (generated from Swagger)

### Design token pipeline

`packages/tokens/tokens.json` is the single source of truth for all design values.

```
tokens.json
  └─▶ @spotify/tokens-generator (CLI)
        └─▶ ui-react/src/styles/palette.css
        └─▶ ui-react/src/styles/layout.css
        └─▶ ui-react/src/styles/typography.css
        └─▶ ui-react/src/styles/themes.css  ← @theme + :root.{theme} selectors
```

CSS files use Tailwind v4 `@theme` blocks. First theme in `tokens.themes` becomes the default (`@theme`); additional themes get `:root.{name}` selectors and `@custom-variant` declarations.

### ui-react build

Built by **Vite** (library mode) into dual ESM + CJS output (`dist/`), configured in `packages/ui-react/vite.config.ts`. The `@spotify/vite-svgr` plugin runs SVG generation as part of `buildStart` — no separate pre-step needed. The `@spotify/vite-svgr` plugin generates types via `vite-plugin-dts`. The web-player `prebuild` script runs `ui-react build` first via Turbo's `dependsOn: ["^build"]` pipeline, so `pnpm build` in root handles ordering automatically.

## Service ports

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/swagger |
| Web player | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Desktop (Vite) | http://localhost:1420 |
| Storybook (ui-react) | http://localhost:6006 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Environment

Copy `.env.example` to `.env` at the repo root for Docker Compose variables. The API validates its own env at startup via Zod (`apps/api/env.schema.ts`). Required API vars: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `WEB_HOST`.
