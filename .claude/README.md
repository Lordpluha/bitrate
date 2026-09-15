# `.claude/` — bitrate agent layer

This folder wires up the ticket-driven command set for Claude Code users. It is one layer
on top of `CLAUDE.md`, the compact routing and shared non-negotiables entrypoint.

The command layer defaults to agent dispatch: every command invokes its matching specialist
by default (see [ADR-0021](../apps/docs/docs/architecture/0021-default-agent-dispatch.md));
pass `--session` to keep a task in the current session instead. This applies to ordinary
tasks outside any command too — see `CLAUDE.md`'s "Default to agent dispatch, even outside a
command". See `TOKEN_BUDGET.md` for the cost trade-off this implies.

## Commands

| Command | Args | What it does |
|---------|------|-------------|
| `/br-create-task` | `"<idea>" [--update NNN] [--epic] [--dry-run]` | Read the whole Projects board + repo context, classify the idea against what already exists, then draft or restructure one issue. Confirms before every GitHub mutation. |
| `/br-implement` | `"<task>" [--session] [--plan] [--review]` | Write or modify web-player, API, or package code, then open/update the pull request. Confirms before pushing or touching the PR. Dispatches to a named specialist by default. |
| `/br-auto` | `[--limit N] [--issue NNN] [--dry-run] [--recover-only]` | Unattended pipeline over the board's `Todo` column: worktree per issue, one `br-worker` each, then PR + board move + issue comment. Resumable and idempotent by design. |
| `/br-sync-docs` | `[path] [--session]` | Find and (with confirmation) fix drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`, and root onboarding docs. Dispatches discovery to `br-librarian`; confirms and applies fixes at the command level. Run periodically. |

Eleven specialists back these four commands — a planner, four app-scoped implementation
agents, debugging/testing/review personas, an infrastructure agent, the unattended pipeline
worker, and a read-only documentation-order agent — dispatched by default, or invoked
directly by name via the Agent tool:

| Agent | Model | Effort | Role |
|---|---|---|---|
| `br-planner` | Fable | low | Decomposes a non-trivial task into ordered steps before any code is written. Plan-only. |
| `br-frontend-developer` | Sonnet | medium | `apps/web-player`, `apps/web-artists`, `packages/ui-react` — Next.js + FSD + Tailwind v4. Auto-invokes `br-reviewer` on substantial diffs. |
| `br-backend-developer` | Sonnet | medium | `apps/api` — NestJS, Prisma, BullMQ, Socket.io. Owns the Swagger-decorator and thin-controller rules. |
| `br-mobile-developer` | Sonnet | medium | `apps/mobile` — React Native + Expo. Flags conventions this scaffolded app has not established. |
| `br-desktop-developer` | Sonnet | medium | `apps/desktop` — Tauri 2 shell + React renderer. Owns the capability/CSP boundary. |
| `br-debugger` | Opus | high | Reproduce → isolate root cause → surgical fix → verify. |
| `br-tester` | Opus | high | Writes or runs one focused Jest/Vitest/Playwright/screenshot spec. |
| `br-reviewer` | Opus | high | Mechanical pass + architecture checklist walk + goal-achievement check. |
| `br-devops` | Opus | high | `.github/workflows`, `.github/actions`, `infra/`, `turbo.json`, `lefthook.yml`, Changesets release. Reviews its own diff for permissions, secrets, and injection. |
| `br-worker` | Opus | high | Orchestrator. Owns a task 0→100%: clarifies it (`/grill-me`), plans it, delegates each stage to the owning agent, re-verifies every claim, reports to the developer. Interactive, or unattended under `/br-auto` inside a worktree. |
| `br-librarian` | Sonnet | medium | Keeps `.claude/`, `.changeset/`, `apps/docs/`, and `PRODUCT.md` in order. Read-only — never edits. |

Model and effort are both fixed per agent in its own frontmatter, not chosen per invocation:
light, fast-turnaround planning on Fable at low effort; routine implementation and
documentation discovery on Sonnet at medium effort; the unattended worker on Sonnet at high
effort; and the verification-heavy roles — bugs, tests, review, DevOps, and orchestration,
where a missed edge case is expensive or blocks the whole team — on Opus at high effort.
`br-worker` sits on that tier because its job is to catch what the other agents missed.

None of these twelve have their own slash command — each of the four commands is the single
entrypoint that dispatches to its matching specialist/specialists by default (see each
command's own file for its routing table). Every specialist that finds/proposes rather than
executes (`br-planner`, `br-librarian`) hands its findings back to the orchestrating command,
which confirms with the user and performs the mutation/fix itself — specialists never push,
open a PR, move a board card, or edit a doc file on their own. The one deliberate exception is
`br-worker`, which commits and pushes its own branch inside its own worktree when running
unattended; even it never touches GitHub state, which the `/br-auto` dispatcher owns.
`br-worker` is also the one agent that dispatches other agents — it is an orchestrator, not
a peer of the specialists it delegates to.

## Large or vague efforts — `grill-me` and `wayfinder`

Two user-invoked skills from the `mattpocock-skills` plugin sit outside this command set:

- **`/grill-me`** sharpens a complex or large task by interview before it is planned. Run it
  ahead of `/br-create-task` or `/br-implement --plan`.
- **`/wayfinder`** drives implementation of an effort spanning more than one agent session,
  charting it as a map of decision tickets on the issue tracker.

Install once per machine: `claude plugin install mattpocock-skills`. It is user-scope, so it
is not committed here and each developer installs it themselves.

## Recommended workflow

```text
/br-create-task → /br-implement → PR (confirmed)   # human in the loop
/br-auto                                            # unattended, board Todo column
```

1. `/br-create-task "<idea>"` — if the task doesn't exist yet: research the board, then
   draft it. Skip when you already have an issue number.
2. `/br-implement "<task>"` — write the code (dispatched to a specialist agent by default),
   run `pnpm lint && pnpm check-types`, add a changeset if the change is user-visible (see
   `.claude/rules/commit-style.md` § "Changesets"), then confirm before opening/updating the
   PR.

Ticket/board state is never mirrored to a file — re-run a `gh`/MCP query whenever the
current state is needed, at any point in the workflow.

Pass `--session` on any of the four commands only when you deliberately want to skip the
agent round-trip for a task small enough that dispatch is pure overhead.

## Concepts from the agent workflow

- **Rules are project law.** Architecture, framework, test, style, and review conventions
  live under `.claude/rules/`.
- **Skills are recipes.** Every command and every specialist agent has access to **any**
  skill under `.claude/skills/` — `fsd`, `shadcn`,
  `prisma-client-api`, `graphify`, `web-design-guidelines`, `writing-guidelines`,
  `vercel-react-best-practices` — plus any global skill. Pick whichever fits the task, not
  a fixed subset.
- **Commands are entrypoints.** They decide scope, load the smallest useful recipe set, and
  dispatch to their matching specialist(s) by default — `--session` keeps a task in the
  current Claude session instead.
- **Every command has at least one named specialist behind it.** `br-planner`,
  the five `br-*-developer` agents, `br-debugger`, `br-tester`, `br-reviewer`, `br-devops`
  for `/br-implement`; `br-worker` for `/br-auto`; `br-librarian` for `/br-sync-docs`.
  Dispatched automatically, or invoked directly by name via the Agent tool.
- **No working-notes vault.** Durable decisions go straight into ADRs
  (`apps/docs/docs/architecture/`); see
  [ADR-0017](../apps/docs/docs/architecture/0017-remove-obsidian-vault.md). GitHub
  ticket/board state is queried live via `gh`/MCP, never mirrored (see
  [ADR-0016](../apps/docs/docs/architecture/0016-live-github-queries.md)). graphify's own
  outputs (`graph.json`/`graph.html`/`graphify query`) live in `graphify-out/`; an
  Obsidian-flavored export of the graph exists but is opt-in, generated only on request,
  not part of the default workflow — see `.claude/rules/knowledge-base.md`.
- **MCP is context plumbing.** Keep repository MCP disabled by default. Enable a server only
  when the task truly needs external structured context such as Figma.
- **Hooks enforce policy mechanically.** `.claude/hooks/block-env-access.sh` (PreToolUse)
  blocks Read/Edit/Write/MultiEdit on `.env`/`.env.*`; `.claude/hooks/format-on-edit.sh`
  (PostToolUse) runs `biome format --write` after every Edit/Write/MultiEdit. Both are
  wired in `.claude/settings.json` — see `CLAUDE.md`'s Non-Negotiables.

## Folder layout

| Path | Purpose |
|------|---------|
| `TOKEN_BUDGET.md` | Token-saving workflow for Claude Code: current-session commands, narrow scope, short logs. |
| `rules/` | Project convention docs, one file per concern. Read by agents and humans. |
| `skills/` | Workflow/tool skills only. |
| `agents/` | Eleven named specialists: `br-planner`, `br-frontend-developer`, `br-backend-developer`, `br-mobile-developer`, `br-desktop-developer`, `br-debugger`, `br-tester`, `br-reviewer`, `br-devops` (`/br-implement`); `br-worker` (`/br-auto`); `br-librarian` (`/br-sync-docs`). |
| `scripts/auto/` | `br-worktree.sh` and `br-pr.sh` — the worktree/branch lifecycle and `gh` wrapper the `/br-auto` pipeline is built on. |
| `commands/` | Three commands, each dispatching to its matching specialist(s) in `agents/` by default. |
| `templates/` | Canonical feature/entity/widget/view trees and the ui-react component tree, consumed internally by `br-frontend-developer` and `br-worker` through the `fsd` skill. |

## What this layer does NOT automate

- **Running the full test suite** — that's CI.
- **Pushing to remote / opening PRs without confirmation** — `/br-implement` always confirms
  first; a prior approval does not carry over to a later push/PR action.
- **Moving a board card or commenting on an issue without confirmation** — same rule for
  `/br-create-task` and `/br-auto`.
- **Database migrations** — run `pnpm --filter @bitrate/api db:migration:start` manually.
- **External skill locking** — `skills-lock.json` records installed external skills only;
  repository-owned rules and skills live directly under `.claude/`.

## Conventions hierarchy

1. Compact shared routing and non-negotiables → `CLAUDE.md`.
2. Project rules → `.claude/rules/`.
3. Workflow/tool skills → `.claude/skills/`.
4. Mechanical review row → `.claude/rules/architecture-checklist.md`.
5. One-way architectural decision → `apps/docs/docs/architecture/`.
6. Human onboarding → `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`, and Docusaurus.

Synchronise all affected layers when a convention changes.
