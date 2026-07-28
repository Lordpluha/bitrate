# AGENTS.md

Short entrypoint for AI agents in this repository. Keep this file compact; detailed rules
live in `.agents/rules/*.md` and durable architecture docs live under
`apps/docs/docs/architecture/`.

## Repository Map

Monorepo: Turborepo + pnpm, packages use the `@spotify/` namespace.

Main apps:
- `apps/api` — NestJS API, Prisma/PostgreSQL, Redis, BullMQ, Socket.io.
- `apps/web-player` — Next.js App Router frontend, Feature-Sliced Design.
- `packages/ui-react` — shared React component library, Tailwind v4, Base UI, shadcn-style components.
- `packages/contracts` — generated OpenAPI TypeScript types.
- `packages/tokens` and `packages/tokens-generator` — design token source and CSS generator.

Other apps/packages exist (`admin`, `desktop`, `mobile`, `docs`, `converter`,
`ncs-parser`, `performance-test`), but do not read them unless the task names them.

## Token-Budget Defaults

- Start by identifying the touched app/package.
- Read the smallest relevant rule set, not every rule file.
- Prefer `rg` under narrow paths before opening files.
- Do not read generated output, caches, build artifacts, `.env*`, or `.claude/worktrees`.
- Do not read `.claude/templates/` unless creating a new slice/component through the
  `fsd-scaffold` skill.
- Use subagents only when `--agent` is passed or explicitly requested.
- Keep logs short: pipe long command output through `head -200` or a focused `rg`.

## Rule Routing

Always start with `.agents/rules/project-conventions.md` for code changes under `apps/`
or `packages/`, then add only the relevant rule:

| Scope | Read |
|---|---|
| API module/controller/service/DTO/guard | `.agents/rules/api-rules.md` |
| API tests | `.agents/rules/jest-rules.md` + `.agents/rules/api-rules.md` |
| web-player component/hook/store/route | `.agents/rules/web-player-rules.md` |
| web-player or ui-react Vitest | `.agents/rules/vitest-rules.md` |
| Playwright, E2E, screenshots | `.agents/rules/playwright-rules.md` |
| ui-react/shadcn primitives | `.agents/rules/shadcn-rules.md` |
| lint/type/format/knip failures | `.agents/rules/biome-rules.md` |

Claude Code sees the same shared rules through `.claude/rules/*.md` symlinks.

## Claude Commands

`.claude/` contains Claude Code-specific adapters. Commands run in the current session by
default and use subagents only with `--agent`.

| Command | Purpose |
|---|---|
| `/sp-plan "<task>" [--agent]` | Plan a non-trivial task. Plan-only. |
| `/sp-develop "<task>" [--review] [--agent]` | Implement code with narrow scope detection. |
| `/sp-debug "<symptom>" [--agent]` | Reproduce, isolate, fix, and verify a bug. |
| `/sp-review [scope] [--agent]` | Review current diff with targeted checks. |
| `/sp-test "<scenario or scope>" [--unit\|--int\|--e2e\|--screenshot] [--agent]` | Write or run one focused Jest, Vitest, or Playwright test. |

## Commands

Use root commands only when the changed surface justifies them:

```bash
pnpm lint
pnpm format
pnpm check-types
pnpm build
pnpm knip
```

Prefer package/app-specific commands:

```bash
pnpm --filter @spotify/api test
pnpm --filter @spotify/api test:int
pnpm --filter @spotify/web-player check-types
pnpm --filter @spotify/web-player test:unit
pnpm --filter @spotify/ui-react test:unit
pnpm --filter @spotify/ui-react test:screenshot
```

Infrastructure for local development:

```bash
docker-compose -f infra/docker-compose.dev.yaml up -d
pnpm dev
```

## Non-Negotiables

- TypeScript: named types for signature shapes, `async/await`, no production `any`,
  `@ts-ignore`, or suppression-based fixes.
- React: named exports for components, named React imports, deep `'use client'` boundary.
- web-player FSD: imports flow `app -> views -> widgets -> features -> entities -> shared`;
  cross-slice imports go through public `index.ts` barrels.
- API: controllers are thin, Prisma lives in services, Swagger decorators live in
  `decorators/`, not inline in controllers.
- UI: no hardcoded hex colors; use token-backed Tailwind utilities and `cn()` from
  `@spotify/ui-react`.
- Routes: use `ROUTES`, not inline path strings.
- Tests: choose the narrowest useful test layer and smoke-run the exact file when possible.
- Git: use Conventional Commits; use `pnpm commit` for the wizard when committing manually.

## Documentation Hierarchy

1. `AGENTS.md` — compact routing and shared non-negotiables.
2. `.agents/rules/*.md` — canonical project rules.
3. `.agents/skills/` — workflow/tool skills only.
4. `.claude/` — Claude Code commands, agents, symlinks, and templates.
5. `apps/docs/docs/architecture/` — durable decisions.
6. `apps/docs/docs/brand/` — design token and accessibility contracts.

Synchronize every affected layer when a convention changes.
