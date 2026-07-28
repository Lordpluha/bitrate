---
name: project-conventions
description: READ THIS FIRST — canonical cross-cutting conventions for the spotify-clone monorepo, covering FSD layering in web-player, NestJS module structure in the API, TypeScript/React patterns, import rules, the Swagger-decorators-in-decorators/ rule, testing layers, and commit style. Use whenever writing, reviewing, or planning any change under apps/ or packages/, especially at the start of a task, before reaching for a narrower app/package rules reference.
metadata:
  type: reference
  author: lordpluha
---

# Project conventions — spotify-clone

Read this rule before writing or reviewing any file in `apps/`. It is a distillation of the deep docs in `.claude/rules/`; refer to those for full rationale.

## Repository overview

Turborepo + pnpm monorepo. Two main apps:
- `apps/api` — NestJS backend, PostgreSQL via Prisma, Redis, BullMQ, Socket.io
- `apps/web-player` — Next.js App Router + Feature-Sliced Design
- `packages/` — shared libraries (`ui-react`, `tokens`, `contracts`, `converter`, …)

## Web-player: FSD layer order

Imports flow **downward only**: `app → views → widgets → features → entities → shared`. A lower layer may never import from a higher one. Cross-slice imports at the same layer level are forbidden (feature → feature, entity → entity, etc.).

| Layer | What lives here |
|-------|-----------------|
| `app/` | Next.js App Router pages, layouts, providers |
| `views/` | Full-page view compositions (assemble widgets/features for one route) |
| `widgets/` | Self-contained page sections: `Header`, `Player`, `LeftSidebar` |
| `features/` | User interactions: `Album`, `Playlist`, `AuthModal`, `Track` |
| `entities/` | Domain objects: `Track`, `User`, `Player` — data shapes, stores, API calls |
| `shared/` | Cross-cutting: `api/`, `hooks/`, `store/`, `ui/`, `routes/`, `constants/`, `validation/` |

Cross-slice imports go through the target slice's `index.ts` barrel only.

Deep doc: `.claude/rules/fsd-web-player.md`.

New feature/entity slices are created by `implement` through the `fsd-scaffold` skill; its
templates are the canonical initial shape.

## Web-player: path aliases

`apps/web-player/tsconfig.json` defines `"@*": ["./src/*"]`. Every import inside `apps/web-player/src/` uses `@/` prefix. No relative paths (`./`, `../`).

```ts
// Bad
import { usePlayer } from '../entities/Player'
// Good
import { usePlayer } from '@/entities/Player'
```

## Web-player: API client

`shared/api/client/fetchClient.ts` — `openapi-fetch` client with JWT refresh middleware.
`shared/api/client/reactQueryClient.ts` — `openapi-react-query` wrapper; exports `useQuery`, `useMutation`.
Types from `@spotify/contracts` (generated from Swagger). Never call `fetch()` directly — use the client.

## NestJS API: module structure

Each module under `apps/api/src/modules/<name>/` follows:

```
<module>/
  <module>.module.ts       NestJS module decorator
  <module>.controller.ts   HTTP endpoints (thin — only input/output)
  <module>.service.ts      Business logic (or split into multiple services)
  <module>.guard.ts        Auth guard (if needed)
  decorators/              ALL Swagger decorators — never inline in controllers
  dtos/                    Input DTOs with Zod schemas
  entities/                Domain entity classes
  errors/                  Custom exception classes
  __tests__/               Fixtures and helpers
  index.ts                 Public barrel
```

**CRITICAL: Swagger decorators must go in `decorators/` — never inline in controllers.** Use separate decorator files per endpoint (e.g. `get-track.swagger.ts`).

Deep doc: `api-rules`.

## NestJS API: path aliases

`apps/api/tsconfig.json` defines:
- `@modules/*` → `src/modules/*`
- `@infra/*` → `src/infra/*`
- `@common/*` → `src/common/*`
- `@test/*` → `test/*`

Always use these aliases inside `apps/api/src/`. No relative paths crossing module boundaries.

## TypeScript

- `strict: true` in web-player; `strictNullChecks: true` + `noUncheckedIndexedAccess: true` in API (less strict than web-player: `noImplicitAny: false`).
- Named types for every shape — no inline `{ ... }` in signature positions.
- `async/await` over raw Promises.
- React: **named imports only** — `import { useState, useEffect } from 'react'`. Never `React.useState`.

## React (web-player)

- Function components only. Named exports only (no default exports for components).
- `import { ... } from 'react'` — never `React.` namespace.
- `cn()` from `@spotify/ui-react` for conditional class merging.
- Tailwind v4 + design tokens from `@spotify/ui-react` CSS variables. No hardcoded hex.
- **≤ 100 logic lines per `.tsx`**, **≤ 5 own props**, **≤ 2 `useEffect`** — decompose as you build.
- **Zustand** for cross-component state.
- `createPersistedStore` and the reset registry live in `shared/store/`; concrete stores live
  in their owning slices.
- Forms: React Hook Form + Zod (`@hookform/resolvers` + `zodResolver`). Schemas in `entities/<entity>/model/<entity>.schema.ts`.

Deep doc: `.claude/rules/react.md`, `.claude/rules/code-principles.md`, `.claude/rules/styling.md`, `.claude/rules/forms.md`.

## Comments

Use `/** */` TSDoc for all meaningful docs. Short factual descriptions; no verbose prose. API: comments are allowed but should document the WHY, not restate the code.

## NestJS API: testing

Three layers, all using Jest:
- **Unit** (`*.unit-spec.ts`) — mocked services with `jest-mock-extended` (`mockDeep`). Co-located with the module file.
- **Integration** (`*.int-spec.ts`) — `Test.createTestingModule()` + `supertest`. Real HTTP, mocked services. Co-located.
- **E2E** (`test/e2e/**/*.e2e-spec.ts`) — running API instance, real DB.

Import jest globals explicitly: `import { describe, it, expect, beforeEach, jest } from '@jest/globals'`.

Deep doc: the `jest` skill, the `api-rules` rule.

## UI package: testing

`packages/ui-react` uses Vitest projects:

- `.unit-spec.tsx` — isolated component behaviour in jsdom
- `.int-spec.tsx` — user interaction/composition in jsdom
- `.snapshot-spec.tsx` — DOM snapshots
- `.screenshot-spec.tsx` — Chromium screenshots through
  `@vitest/browser-playwright`

All four are co-located with the component.

`apps/web-player` uses co-located Vitest unit and integration specs, co-located Playwright
route screenshots, and Playwright E2E (full route flows) under the global `tests/e2e/`.

Deep docs: the `vitest` skill, the `playwright` skill.

## Accessibility

User-facing web UI targets WCAG 2.2 AA. Semantic controls, labels, keyboard operation,
visible focus, reduced motion, target size, and 320px/400%-zoom reflow are release
constraints.

Deep doc: `apps/docs/docs/brand/a11y.md`.

## Shared UI / shadcn

shadcn ownership lives in `packages/ui-react`, not `apps/web-player`. Search package
exports first, run the CLI from `packages/ui-react/`, use Base UI APIs established by
neighbouring components, and export public primitives from `@spotify/ui-react`.

Deep doc: the `ui-react-rules` skill (project overrides); generic reference: the `shadcn` skill.

## Biome (linting + formatting)

Run from monorepo root:
- `pnpm lint` — Biome lint all
- `pnpm format` — Biome format all
- `pnpm check-types` — `tsc --noEmit` across all apps

Deep doc: the `code-style` rule.

## Commit style

Conventional Commits without Jira prefix:

```
feat(api): add track streaming endpoint
fix(web-player): correct player state on track end
chore(packages): bump ui-react to 2.1.0
```

Scope is the app/package name: `api`, `web-player`, `ui-react`, `contracts`, `tokens`, `desktop`, `mobile`. Omit scope for repo-wide changes.

Deep doc: `.claude/rules/commit-style.md`.

## Deep docs

`.claude/rules/fsd-web-player.md`, `.claude/rules/typescript.md`, `.claude/rules/react.md`, `.claude/rules/code-principles.md`, `.claude/rules/styling.md`, `.claude/rules/forms.md`, `.claude/rules/monorepo.md`, `.claude/rules/commit-style.md`, `.claude/rules/architecture-checklist.md`, `.claude/rules/testing.md`. Sibling references: `api-rules`, `web-player-rules`, `code-style`. Workflow skills: `fsd-scaffold`, `jest`, `vitest`, `playwright`, `ui-react-rules`.
