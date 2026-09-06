# Claude Code

Compact entrypoint for Claude Code in this repository. Keep it small — detailed rules live
under `.claude/rules/*.md`, workflow/tool skills under `.claude/skills/`, and durable
architecture docs under `apps/docs/docs/architecture/`. There is no working-notes vault:
durable decisions go straight into ADRs; GitHub ticket/board state is queried live via
`gh`/MCP, never mirrored. The codebase graph (`graph.json`/`GRAPH_REPORT.md`/`graphify query`)
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

Monorepo: Turborepo + pnpm, packages use the `@bitrate/` namespace.

Main apps:
- `apps/api` — NestJS API, Prisma/PostgreSQL, Redis, BullMQ, Socket.io.
- `apps/web-player` — Next.js App Router frontend, Feature-Sliced Design.
- `apps/web-artists` — Next.js artist-facing frontend, same stack as web-player.
- `packages/ui-react` — shared React component library, Tailwind v4, Base UI, shadcn-style components.
- `packages/contracts` — generated OpenAPI TypeScript types.
- `packages/ui-react` also owns the design system: the Tailwind `@theme` layers are written
  by hand in `src/styles/` — there is no token generator and no `tokens.json`.

Scaffolded but unstarted — do not assume mature conventions in them:
- `apps/mobile` — React Native + Expo (roadmap v0.5.0).
- `apps/desktop` — Tauri 2 + React (roadmap v1.2.0).

Other packages exist (`docs`, `converter`, `ncs-parser`, `svgr`, `vite-svgr`), but do not
read them unless the task names them.

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
| `apps/mobile` — React Native + Expo | `.claude/rules/mobile-rules.md` |
| `apps/desktop` — Tauri 2 + React/Vite | `.claude/rules/desktop-rules.md` |
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

`/br-implement` reads this whole table (not each target file) as its mandatory first step —
see each developer agent's Step 0, e.g. `.claude/agents/br-frontend-developer.md`.

Each app's rule file states which web-player conventions do **not** apply to it — FSD,
`'use client'`, Tailwind, and `cn()` are web-player concepts, not universal law. The three
scaffolded apps still have large unestablished areas, so their agents propose a convention in
their report rather than inventing one silently.

## Skill Index

Skills are recipes for a specific technology or workflow; rules are project law. Load a skill
when you are working in that technology, on top of the rule its row names. Every command and
every agent may use **any** of these — the list is exhaustive, so scanning it (titles only)
never misses one.

| Technology / workflow | Skill | Paired rule |
|---|---|---|
| NestJS framework mechanics (DI, guards, pipes, lifecycle) | `nestjs` | `api-rules.md` |
| Prisma queries | `prisma-client-api` | `api-rules.md` |
| BullMQ background jobs | `bullmq` | `api-rules.md` |
| Socket.io gateways | `socketio` | `api-rules.md` |
| Zod schemas (both apps) | `zod` | `forms.md`, `api-rules.md` |
| FSD slice/component scaffolding | `fsd` | `fsd-web-player.md` |
| React Query + openapi data layer | `react-query` | `web-player-rules.md` |
| Zustand client state | `zustand` | `react.md` |
| Tailwind v4 + tokens | `tailwindcss` | `styling.md` |
| Base UI primitives | `base-ui` | `styling.md` |
| shadcn methodology / ui-react package | `shadcn`, `ui-react-rules` | `styling.md` |
| Storybook stories | `storybook` | — |
| React/Next.js performance | `vercel-react-best-practices` | `react.md` |
| Expo / React Native (`apps/mobile`) | `expo` | `mobile-rules.md` |
| Tauri 2 (`apps/desktop`) | `tauri` | `desktop-rules.md` |
| Jest (API tests) | `jest` | `testing.md` |
| Vitest (web-player, ui-react) | `vitest` | `testing.md` |
| Playwright (E2E, screenshots) | `playwright` | `testing.md` |
| Turborepo pipeline | `turborepo` | `monorepo.md` |
| Biome lint/format | `biome` | `code-style.md` |
| Changesets versioning | `changesets` | `commit-style.md` |
| Codebase graph / exploration | `graphify` | `knowledge-base.md` |
| UI design, audit, polish | `impeccable`, `web-design-guidelines` | `styling.md` |
| Documentation prose | `writing-guidelines` | — |

## Commands

`.claude/` contains the ticket-driven command set. Every command dispatches to an agent by
default (see [ADR-0021](apps/docs/docs/architecture/0021-default-agent-dispatch.md)); pass
`--session` to work in the current session instead for a task small enough that a dispatch
round-trip is pure overhead.

| Command | Purpose |
|---|---|
| `/br-create-task "<idea>" [--update NNN] [--epic] [--dry-run]` | Read the whole Projects board + repo context, then draft a correctly-scoped issue — or restructure an existing one — that fits the work already planned. Confirms before every GitHub mutation. |
| `/br-implement "<task>" [--session] [--plan] [--review]` | Write code, then open/update the PR. Checks out the branch itself, then dispatches to `br-planner`/the matching `br-*-developer`/`br-debugger`/`br-tester`/`br-reviewer` as needed. |
| `/br-auto [--limit N] [--issue NNN] [--dry-run] [--recover-only]` | Unattended pipeline: poll the board's `Todo` column and drive each issue end to end — worktree, `br-worker`, commit, push, PR, board move, issue comment — with crash recovery. |
| `/br-sync-docs [path] [--session]` | Find and (with confirmation) fix drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`, and root onboarding docs. Dispatches discovery to `br-librarian`. Run periodically — see `.claude/rules/monorepo.md` § "Documentation ownership". |

Eleven named specialists live under `.claude/agents/`. Four implementation agents split by
app — `br-frontend-developer` (web-player, web-artists, ui-react), `br-backend-developer`
(api), `br-mobile-developer`, `br-desktop-developer` — plus
`br-planner`, `br-debugger`, `br-tester`, `br-reviewer` (dispatched by `/br-implement`),
`br-devops` (CI/CD, Docker, infra, release tooling), `br-worker` (the orchestrator: owns a
task 0→100%, delegates each stage to the agent that owns it, verifies the result itself
rather than trusting reports, and reports back to the developer — interactively, or
unattended under `/br-auto`), and `br-librarian` (read-only documentation-order discovery
for `/br-sync-docs`).

Every command and every specialist has access to any skill under `.claude/skills/` (not a
restricted subset) — pick whichever the task calls for. `/br-create-task`, `/br-implement`
and `/br-auto` mutate GitHub state (issues, board cards, comments, PRs) only after explicit
confirmation for each action, executed at the command level (specialists never mutate GitHub
or push/open a PR themselves; `br-worker` commits and pushes its own branch only, and the
`/br-auto` dispatcher owns every outward-facing action) — a prior approval doesn't carry over
to a later action in the same conversation. Ticket/board state itself is never mirrored to a
file — it's queried live via `gh`/MCP whenever it's needed (see
`.claude/rules/knowledge-base.md` and
[ADR-0016](apps/docs/docs/architecture/0016-live-github-queries.md)).

## Planning and implementing large efforts

Two installed skills from the `mattpocock-skills` plugin carry work that is too big or too
vague for a single command:

- **`/grill-me`** — use when a complex or large task is not yet sharp enough to plan. It is a
  relentless interview that walks the decision tree branch by branch until nothing material
  is unresolved. Run it *before* `/br-create-task` or `/br-implement --plan`, not after.
  `br-worker` invokes it itself in interactive mode when the task it was handed is too
  ambiguous to build.
- **`/wayfinder`** — use to drive implementation of an effort spanning more than one agent
  session. It charts the work as a map of decision tickets on the issue tracker and resolves
  them one at a time, so a new session can tell what is actually finished without re-reading
  the repo.

Both are user-invoked only. Install with `claude plugin install mattpocock-skills` — it is a
user-scope plugin, not committed to this repo, so each developer installs it once.

## Default to agent dispatch, even outside a command

This isn't limited to the slash commands: any task that touches application code — including
ordinary conversation with no `/br-*` command invoked — routes to the matching specialist via
the Agent tool by default. `br-planner` first for non-trivial multi-file/cross-cutting work;
then the developer agent that owns the surface (`br-frontend-developer`,
`br-backend-developer`, `br-mobile-developer`, `br-desktop-developer`,
or `br-devops` for CI/infra); `br-debugger` for a bug fix; `br-tester`
for focused test authoring/running; `br-reviewer` before a PR or on a substantial diff. Work
in the current session only when the user explicitly asks to skip the agent for that task.
See [ADR-0021](apps/docs/docs/architecture/0021-default-agent-dispatch.md).

## Model tier by task type

Planning is light and fast-turnaround; implementation is routine; debugging, testing, review,
and infrastructure are verification-heavy — a missed edge case there is expensive, so they get
the strongest reasoning tier:

| Task type | Tier | Effort |
|---|---|---|
| Planning | Fable | low |
| Development / implementation, documentation discovery | Sonnet | medium |
| Debugging, testing, review, DevOps, orchestration (`br-worker`) | Opus | high |

All twelve specialists pin their model and effort in their own agent frontmatter (see
`.claude/README.md`) — dispatching one always runs it on its assigned tier, not a
per-invocation choice.

## Token-Budget Defaults

- Start by identifying the touched app/package.
- Read the smallest relevant rule set, not every rule file.
- Prefer `rg` under narrow paths before opening files.
- Do not read generated output, caches, build artifacts, `.env*`, or `.claude/worktrees`.
- Do not read `.claude/templates/` unless creating a new slice/component through the
  `fsd` skill.
- Dispatch to a subagent by default (see "Default to agent dispatch, even outside a
  command" above); work in-session only when `--session` is passed or explicitly requested.
- Keep logs short: pipe long command output through `head -200` or a focused `rg`.
- Before broad exploration of an unfamiliar area, try `graphify query "<question>"` first —
  it's faster than grepping across many files.
- After a nontrivial investigation or mid-task decision that's durable enough to matter
  later, write a real ADR (`apps/docs/docs/architecture/template.md`) — there's no interim
  notes layer, so a decision either gets an ADR or lives only in the PR/commit.

For detailed guidance, prefer the smallest relevant file under `.claude/rules/*.md`; see
`.claude/README.md` for the full command layer and `.claude/TOKEN_BUDGET.md` for more
token-saving rules.

## Sandbox: host tools via `flatpak-spawn`

This project is often opened from VS Code installed as a **Flatpak**, so the shell tools run
in the `com.visualstudio.code` sandbox whose `/usr` is the Flatpak runtime's, not the host's.
Consequences worth knowing before concluding a tool is missing:

- `gh`, `docker`, and `graphify` are installed on the host but **not usable directly here**.
  `command -v gh` failing does not mean the user lacks it, and `graphify` is worse than
  missing: its launcher resolves but dies with `ModuleNotFoundError` because its uv venv is
  outside the sandbox. Reach all three with `flatpak-spawn --host <tool> …`.
  `.claude/scripts/auto/br-pr.sh` and `.claude/hooks/graphify-guard.sh` do this
  automatically and report which transport they used.
- So the mandated `graphify query "<question>"` above is
  `flatpak-spawn --host graphify query "<question>"` in this environment.
- The repo is shared with the host, but **sandbox `/tmp` is not**. Any file handed to a host
  command must live inside the repo — use the gitignored `.br-scratch/`, never the session
  scratchpad, for PR bodies and issue comments.
- `pnpm`, `node`, `git`, and `rg` all resolve normally; only host-installed system tools are
  affected.

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
pnpm --filter @bitrate/api test
pnpm --filter @bitrate/api test:int
pnpm --filter @bitrate/web-player check-types
pnpm --filter @bitrate/web-player test:unit
pnpm --filter @bitrate/ui-react test:unit
pnpm --filter @bitrate/ui-react test:screenshot
```

Infrastructure for local development. `Taskfile.yml` at the repo root is the **only**
interface for Docker, database, and monitoring workflows — there are no `pnpm docker:*`
scripts, and `task` with no arguments lists everything:

```bash
task infra:up      # postgres, postgres_test, redis, mailhog — nothing else
pnpm dev           # apps natively

task dev:up        # or: the whole stack in Docker
task db:migrate    # Prisma inside the api container (dev:up first)
task monitor:health
```

Under the VS Code Flatpak sandbox `docker` is host-only, so these run from a host terminal
or via `flatpak-spawn --host` (see "Sandbox" above).

## Non-Negotiables

- TypeScript: named types for signature shapes, `async/await`, no production `any`,
  `@ts-ignore`, or suppression-based fixes.
- React: named exports for components, named React imports, deep `'use client'` boundary.
- web-player FSD: imports flow `app -> views -> widgets -> features -> entities -> shared`;
  cross-slice imports go through public `index.ts` barrels.
- API: controllers are thin, Prisma lives in services, Swagger decorators live in
  `decorators/`, not inline in controllers.
- UI: no hardcoded hex colors; use token-backed Tailwind utilities and `cn()` from
  `@bitrate/ui-react`.
- Routes: use `ROUTES`, not inline path strings.
- Tests: choose the narrowest useful test layer and smoke-run the exact file when possible.
- Git: use Conventional Commits; use `pnpm commit` for the wizard when committing manually.
- Secrets: never read, edit, or quote the contents of `.env`/`.env.*` files (templates
  `.env.example`/`.env.sample`/`.env.template`/`.env.dist` are fine). Enforced mechanically
  via `.claude/hooks/block-env-access.sh`.
- Formatting: run `pnpm format` (or `biome format --write <file>`) on any file you edit
  before finishing. Enforced automatically via `.claude/hooks/format-on-edit.sh`.

## Documentation Hierarchy

`.claude/CONTEXT.md` defines the shared vocabulary these layers use — issue vs task, rule vs
skill, module vs slice, worker vs agent. Read it once, then use those words exactly; a
synonym makes a grep miss and sends an agent to the wrong document.

1. `CLAUDE.md` — compact routing and shared non-negotiables.
2. `.claude/rules/*.md` — canonical project rules.
3. `.claude/skills/` — workflow/tool skills only.
4. `.claude/` — commands, agents, and templates.
5. `apps/docs/docs/architecture/` — durable decisions.
6. `apps/docs/docs/brand/` — design token and accessibility contracts.

Synchronize every affected layer when a convention changes.
