# `.claude/` — spotify-clone agent layer

This folder wires up the ticket-driven command set for Claude Code users. It is one layer
on top of `CLAUDE.md`, the compact routing and shared non-negotiables entrypoint.

The command layer defaults to token-budget mode: commands run in the current session and
invoke subagents only when `--agent` is passed or the user explicitly asks for one. See
`TOKEN_BUDGET.md`.

## Commands

| Command | Args | What it does |
|---------|------|-------------|
| `/sp-take-ticket` | `"<issue number or search>"` | Find/confirm a GitHub issue on the Projects board (live query), move its card, and check out a branch. Confirms before any mutating GitHub action. Self-contained. |
| `/sp-implement` | `"<task>" [--agent] [--plan] [--review]` | Write or modify web-player, API, or package code, then open/update the pull request. Confirms before pushing or touching the PR. Dispatches to a named specialist with `--agent`. |
| `/sp-sync-docs` | `[path]` | Find and (with confirmation) fix drift between `apps/docs/` and the rule/ADR sources. Run periodically. Self-contained. |

Only `/sp-implement` has agent specialists behind it — planning/coding/debugging/testing/
review personas, dispatched with `--agent` or invoked directly by name via the Agent tool:

| Agent | Model | Role |
|---|---|---|
| `sp-planner` | Fable | Decomposes a non-trivial task into ordered steps before any code is written. Plan-only. |
| `sp-developer` | Sonnet | Writes/modifies code across web-player, API, and packages. Auto-invokes `sp-reviewer` on substantial diffs. |
| `sp-debugger` | Opus | Reproduce → isolate root cause → surgical fix → verify. |
| `sp-tester` | Opus | Writes or runs one focused Jest/Vitest/Playwright/screenshot spec. |
| `sp-reviewer` | Opus | Mechanical pass + architecture checklist walk + goal-achievement check. |

Model is fixed per agent in its own frontmatter, not chosen per invocation: light,
fast-turnaround planning on Fable; routine implementation on Sonnet; the three
verification-heavy roles (bugs, tests, review — where a missed edge case is expensive) on
Opus.

None of these five have their own slash command — `/sp-implement [--agent] [--plan]
[--review]` is the single entrypoint that routes to the right one (see its own file for the
routing table). `/sp-take-ticket` and `/sp-sync-docs` carry their own instructions directly
in the command file — no separate agent file, no `--agent` flag — and talk to GitHub
themselves: prefer an MCP GitHub server if one is connected in the session, otherwise the
`gh` CLI.

## Recommended workflow

1. `/sp-take-ticket "<issue>"` — pick up the ticket, confirm the board move, get a branch.
2. `/sp-implement "<task>"` — write the code (dispatching to a specialist agent if
   `--agent`/`--plan`/`--review` is used), run `pnpm lint && pnpm check-types`, add a
   changeset if the change is user-visible (see `.claude/rules/commit-style.md` §
   "Changesets"), then confirm before opening/updating the PR.

Ticket/board state is never mirrored to a file — re-run a `gh`/MCP query whenever the
current state is needed, at any point in the workflow.

On `/sp-implement`, add `--agent` only when you deliberately want an isolated specialist
run and accept the extra token cost.

## Concepts from the agent workflow

- **Rules are project law.** Architecture, framework, test, style, and review conventions
  live under `.claude/rules/`.
- **Skills are recipes.** Every command and every specialist agent has access to **any**
  skill under `.claude/skills/` — `fsd-scaffold`, `shadcn`,
  `prisma-client-api`, `graphify`, `web-design-guidelines`, `writing-guidelines`,
  `vercel-react-best-practices` — plus any global skill. Pick whichever fits the task, not
  a fixed subset.
- **Commands are entrypoints.** They decide scope, load the smallest useful recipe set, and
  keep routine work in the current Claude session. Two of the three (`sp-take-ticket`,
  `sp-sync-docs`) are fully self-contained — no agent file backs them.
- **Subagents are `/sp-implement`'s named specialists.** `sp-planner`, `sp-developer`,
  `sp-debugger`, `sp-tester`, `sp-reviewer`. Dispatch them with `--agent`, or invoke any of
  them directly by name via the Agent tool.
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
| `agents/` | `/sp-implement`'s five named `--agent` specialists: `sp-planner`, `sp-developer`, `sp-debugger`, `sp-tester`, `sp-reviewer`. |
| `commands/` | Three commands: `sp-implement` delegates to `agents/`; `sp-take-ticket`, `sp-sync-docs` are self-contained. |
| `templates/` | Canonical feature/entity/widget/view trees and the ui-react component tree, consumed internally by `sp-developer` through the `fsd-scaffold` skill. |

## What this layer does NOT automate

- **Running the full test suite** — that's CI.
- **Pushing to remote / opening PRs without confirmation** — `/sp-implement` always confirms
  first; a prior approval does not carry over to a later push/PR action.
- **Moving a board card or commenting on an issue without confirmation** — same rule for
  `/sp-take-ticket`.
- **Database migrations** — run `pnpm --filter @spotify/api db:migration:start` manually.
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
