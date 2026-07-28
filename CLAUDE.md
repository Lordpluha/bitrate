# Claude Code

Compact entrypoint for Claude Code in this repository. Keep it small — detailed rules live
under `.claude/rules/*.md`, workflow/tool skills under `.claude/skills/`, and durable
architecture docs under `apps/docs/docs/architecture/`. There is no working-notes vault:
durable decisions go straight into ADRs; GitHub ticket/board state is queried live via
`gh`/MCP, never mirrored. The codebase graph (`graph.json`/`graph.html`/`graphify query`)
lives entirely in `graphify-out/`; an Obsidian-flavored export of the graph exists but is
opt-in, not part of the default workflow — see `.claude/rules/knowledge-base.md`.

## graphify

- **graphify** (`.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
  When the user types `/graphify`, use the installed graphify skill or instructions before
  doing anything else.

This project has a knowledge graph at `graphify-out/` with god nodes, community structure,
and cross-file relationships.

- For codebase questions, first run `graphify query "<question>"` when
  `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and
  `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph,
  usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source
  browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when
  query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API
  cost).

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

## Rule Index

Always start with `.claude/rules/project-conventions.md` for code changes under `apps/` or
`packages/`. This table is **exhaustive** — every rule file in the repository, one line
each — so a scan of it (cheap: titles + one-liners, not full file contents) never misses an
applicable rule. Read the row's file in full only when its scope actually applies to the
current task; do not read every row's target file up front.

| Scope | Read |
|---|---|
| **Any change under `apps/`/`packages/` (read first)** | `.claude/rules/project-conventions.md` |
| API module/controller/service/DTO/guard/error patterns | `.claude/rules/api-rules.md` |
| web-player component/hook/store/route | `.claude/rules/web-player-rules.md` |
| web-player — deep FSD layer/slice-anatomy/public-API rules | `.claude/rules/fsd-web-player.md` |
| Any test (API Jest, web-player/ui-react Vitest, Playwright E2E/screenshots) | `.claude/rules/testing.md` (routes to the `jest`/`vitest`/`playwright` skills) |
| ui-react/shadcn primitives | the `ui-react-rules` skill (project overrides) + the `shadcn` skill (generic reference) |
| React components — deep hooks/state/a11y/routing conventions | `.claude/rules/react.md` |
| TypeScript — named types, no `any`, imports, file naming, TSDoc | `.claude/rules/typescript.md` |
| Styling — Tailwind v4, tokens, CVA, `cn()` | `.claude/rules/styling.md` |
| Forms — React Hook Form + Zod | `.claude/rules/forms.md` |
| SOLID/DRY/KISS, component size/props/decomposition limits | `.claude/rules/code-principles.md` |
| Monorepo topology, Turborepo/pnpm scripts, env vars | `.claude/rules/monorepo.md` |
| lint/type/format/knip failures | `.claude/rules/code-style.md` |
| Commit message / branch naming | `.claude/rules/commit-style.md` |
| Mechanical review checklist before opening/updating a PR | `.claude/rules/architecture-checklist.md` |
| codebase exploration, working notes, decisions, GitHub ticket/board sync | `.claude/rules/knowledge-base.md` |

`/sp-implement` reads this whole table (not each target file) as its mandatory first step —
see `.claude/agents/sp-developer.md` Step 0.

## Commands

`.claude/` contains the ticket-driven command set. Commands run in the current session by
default and use subagents only with `--agent`.

| Command | Purpose |
|---|---|
| `/sp-take-ticket "<issue>"` | Find/confirm a GitHub ticket live, move its Projects board card, check out a branch. Self-contained — no agent file. |
| `/sp-implement "<task>" [--agent] [--plan] [--review]` | Write code with narrow scope detection, then open/update the PR. Dispatches to `sp-planner`/`sp-developer`/`sp-debugger`/`sp-tester`/`sp-reviewer` as needed. |
| `/sp-sync-docs [path]` | Find and (with confirmation) fix drift between `apps/docs/` and the rule/ADR sources. Run periodically — see `.claude/rules/monorepo.md` § "Documentation ownership". Self-contained. |

Only `/sp-implement` has `--agent`/named specialists behind it (`sp-planner`,
`sp-developer`, `sp-debugger`, `sp-tester`, `sp-reviewer` — see `.claude/agents/`). The
other two commands carry their own instructions directly and talk to GitHub themselves
(prefer an MCP GitHub server if one is connected, otherwise the `gh` CLI) — there is no
separate agent file for them. Every command and every specialist has access to any skill
under `.claude/skills/` (not a restricted subset) — pick whichever the task calls for.
`/sp-take-ticket` and `/sp-implement` mutate GitHub state (board cards, comments, PRs) only
after explicit confirmation for each action — a prior approval doesn't carry over to a
later action in the same conversation. Ticket/board state itself is never mirrored to a
file — it's queried live via `gh`/MCP whenever it's needed (see
`.claude/rules/knowledge-base.md` and
[ADR-0016](apps/docs/docs/architecture/0016-live-github-queries.md)).

## Model tier by task type

Planning is light and fast-turnaround; implementation is routine; debugging, testing, and
review are verification-heavy — a missed edge case there is expensive, so they get the
strongest reasoning tier:

| Task type | Tier |
|---|---|
| Planning | Fable |
| Development / implementation | Sonnet |
| Debugging, testing, review | Opus |

`sp-planner`/`sp-developer`/`sp-debugger`/`sp-tester`/`sp-reviewer` each pin their model in
their own agent frontmatter (see `.claude/README.md`) — dispatching one via `/sp-implement
--agent` always runs it on its assigned tier, not a per-invocation choice.

## Token-Budget Defaults

- Start by identifying the touched app/package.
- Read the smallest relevant rule set, not every rule file.
- Prefer `rg` under narrow paths before opening files.
- Do not read generated output, caches, build artifacts, `.env*`, or `.claude/worktrees`.
- Do not read `.claude/templates/` unless creating a new slice/component through the
  `fsd-scaffold` skill.
- Use subagents only when `--agent` is passed or explicitly requested.
- Keep logs short: pipe long command output through `head -200` or a focused `rg`.
- Before broad exploration of an unfamiliar area, try `graphify query "<question>"` first —
  it's faster than grepping across many files.
- After a nontrivial investigation or mid-task decision that's durable enough to matter
  later, write a real ADR (`apps/docs/docs/architecture/template.md`) — there's no interim
  notes layer, so a decision either gets an ADR or lives only in the PR/commit.

For detailed guidance, prefer the smallest relevant file under `.claude/rules/*.md`; see
`.claude/README.md` for the full command layer and `.claude/TOKEN_BUDGET.md` for more
token-saving rules.

## Shell commands

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
- Secrets: never read, edit, or quote the contents of `.env`/`.env.*` files (templates
  `.env.example`/`.env.sample`/`.env.template`/`.env.dist` are fine). Enforced mechanically
  via `.claude/hooks/block-env-access.sh`.
- Formatting: run `pnpm format` (or `biome format --write <file>`) on any file you edit
  before finishing. Enforced automatically via `.claude/hooks/format-on-edit.sh`.

## Documentation Hierarchy

1. `CLAUDE.md` — compact routing and shared non-negotiables.
2. `.claude/rules/*.md` — canonical project rules.
3. `.claude/skills/` — workflow/tool skills only.
4. `.claude/` — commands, agents, and templates.
5. `apps/docs/docs/architecture/` — durable decisions.
6. `apps/docs/docs/brand/` — design token and accessibility contracts.

Synchronize every affected layer when a convention changes.
