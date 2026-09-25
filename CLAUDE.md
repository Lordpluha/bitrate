# Bitrate — Claude Code instructions

Be concise and concrete. Stay within the requested scope and preserve user changes.
Claude Code is the project workflow; other clients are each developer's choice.

## Repository map

Turborepo + pnpm; workspace names use `@bitrate/`.

| Path | Stack / boundary |
|---|---|
| `apps/api` | NestJS, Prisma/PostgreSQL, Redis, BullMQ, Socket.io |
| `apps/web-player` | Next.js App Router, Feature-Sliced Design |
| `apps/web-artists` | TanStack Start, Vite + Nitro, FSD; no Next.js APIs |
| `apps/admin` | Angular zoneless SPA, spartan-ng, ESLint |
| `packages/ui-react` | Shared React, Tailwind v4, Base UI; tokens in `src/styles/` |
| `packages/player` | Svelte 5 custom element; framework-free contract, no host globals in engine |
| `packages/contracts` | Generated OpenAPI TypeScript contracts |
| `apps/mobile` | React Native + Expo scaffold; conventions still evolving |
| `apps/desktop` | Tauri 2 + React scaffold; conventions still evolving |

Read only affected workspaces. Check scope before applying React/FSD/Next.js conventions.

## Load instructions when needed

- Rules in `.claude/rules/` load by `paths`; only `code-style.md` is unconditional.
  Read a representative source file; before creating in a new area, read its app rule.
  Follow rules already in context without rereading. Never bulk-load rules, skills or templates.
- Use skills for their workflows, not merely because their technology appears in the task.
- Commit/changeset work: read `.claude/rules/commit-style.md` explicitly; shell commits
  do not trigger path rules. Reviews/PR changes: relevant sections of
  `.claude/references/architecture-checklist.md`; use `br-review` for the review workflow.
- Verification: `br-verify`. Exploration/ADRs/tracker: `.claude/references/knowledge-base.md`.
- On demand: `.claude/CONTEXT.md` (terminology), `.claude/TOKEN_BUDGET.md` (usage),
  `.claude/references/environment.md` (host tools), `.claude/references/mcp.md` (MCP).
- Keep optional references as plain links; `@` imports load contents at startup.

## Planning and behavior changes

- Before a large task, run the grill-me interview, present a plan and wait for explicit
  user confirmation. Large means substantial features, architecture/contracts, migrations,
  dependent stages or material risk; file count alone is insufficient.
- Automatically invoke `mattpocock-skills:grilling` through Skill; `/grill-me` is its manual
  wrapper. Follow `.claude/references/large-task-planning.md`. The user-facing session owns
  the interview, including `--session`; delegates reuse its confirmed decisions.
- Reuse completed interviews/plans for unchanged scope. Unattended large tasks without
  approval return `BLOCKED_REASON: planning`. Small tasks clarify only missing decisions.
- For logic, API behavior and bug fixes invoke `mattpocock-skills:tdd` before implementation:
  agree public seams/expected behavior (reuse approved decisions), then failing test → fix → green.
  Docs/cosmetic UI need no TDD; refactors use existing tests, not implementation-mirroring tests.
- Keep one canonical spec: issue body, or one local file without an issue. Preserve acceptance
  IDs and decisions; `.claude/references/spec-workflow.md` owns the process.

## Execution and delegation

- Ordinary implementation, planning, testing and review stay in-session. Delegate a bounded
  task only for a concrete benefit from isolation, specialist depth or independent review.
- `--session` disables delegation; `--review` requests independent review. Together, review
  in-session and disclose the limitation. Use `br-worker` for explicit orchestration or
  `/br-auto`, never an automatic planner → developer → tester → reviewer chain.
- Provide delegates goals, paths, constraints and acceptance criteria; reuse existing findings.
  Agent frontmatter owns defaults: routine work Sonnet/medium; difficult diagnosis or
  risk-focused review Opus/high (`br-debugger`, `br-reviewer`). Escalate on evidence of hard
  root causes or material security, migration, concurrency or cross-system risk.
- Require exact check commands, results and checked revision. Repeat checks only after
  relevant changes, missing evidence or justified independent reproduction; a bare PASS fails.
- `.claude/references/execution-policy.md` owns handoffs, evidence and stopping.
  Agent Teams and autonomous scheduling are opt-in.

## Worktree and user-state safety

- Never discard, stash, reset or overwrite user changes without explicit authorization.
- Writing delegates, branch changes and dependency installs use `isolation: "worktree"`
  unless the user explicitly requests the current checkout. Stay in an existing dedicated
  worktree; do not nest them. Read-only delegates may share the checkout.
- Current-session edits can stay on the task branch; use a worktree if another branch/base
  is needed. Preserve the developer's branch, dependencies and servers: feature branches may
  contain whole apps absent from `develop`. See `.claude/references/worktree-safety.md`.

## Command boundaries

| Command | Purpose |
|---|---|
| `/br-create-task` | Research and draft/update an issue; confirm GitHub mutations |
| `/br-implement` | Implement, verify and prepare a PR; delegate only when justified |
| `/br-sync-docs` | Scoped docs audit; librarian for an independent broad audit |
| `/br-auto` | Explicit unattended issue pipeline with prepared worktrees/workers |

`.claude/README.md` owns command details and agent roster. `/wayfinder` is user-invoked.
Preserve each command's remote-action approval boundaries: specialists do not push or
mutate GitHub; `br-manager` handles confirmed interactive tracker actions; `/br-auto`'s
dispatcher owns its GitHub actions. Unattended workers may commit/push only their assigned
branch. Never force-push or push `develop`.

## Search and verification

- Use narrow `rg` searches, focused reads and short outputs. For broad unfamiliar codebase
  questions, query graphify if a graph exists; known-file edits need no graph exploration.
  `/graphify` uses its skill. Read `GRAPH_REPORT.md` only if focused queries are insufficient;
  update an available graph once per completed batch of relevant structural changes.
- Exclude generated output, caches, build artifacts and other worktrees from routine searches.
- Choose checks by changed behavior/workspace; `code-style.md` owns verification safety.
  Root lint/typecheck/build/format/knip need matching scope; format only edited files.
  Example: `pnpm --filter @bitrate/web-player check-types` or `test:unit`.
- `Taskfile.yml` owns Docker/database/monitoring commands (`task` lists them); `pnpm dev`
  starts apps natively.
- Start fresh for unrelated tasks. Compact long tasks with decisions, changed files, check
  evidence and outstanding work; do not repeatedly compact solely on a fixed percentage.

## Critical constraints

- No production `any`, `@ts-ignore` or suppression-based fixes; use named signature types.
- Preserve FSD direction/public barrels where applicable; thin API controllers and Swagger
  decorators in `decorators/`. React UI reuses `@bitrate/ui-react`, design tokens and `ROUTES`.
- Never read/edit/quote real `.env`/`.env.*`; example/sample/template/dist files are allowed.
  Keep protection/formatting hooks enabled. Risky operations require native **Allow once**,
  one operation per tool call; scope/limits: `.claude/references/hook-policy.md`.
- Record durable architecture decisions in ADRs without rewriting historical decisions.
  Query live GitHub issue/board state; do not mirror it in notes. Keep rules/commands/agents
  consistent. Policies: ADR-0040/0041/0042/0045 under `apps/docs/docs/architecture/`.
