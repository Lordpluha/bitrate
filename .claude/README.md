# `.claude/` — spotify-clone agent layer

This folder wires up the `sp-*` command set for Claude Code users. It is one layer on top of `AGENTS.md`, the compact routing and shared non-negotiables entrypoint for all AI agents.

The command layer defaults to token-budget mode: `/sp-*` commands run in the current
session and invoke subagents only when `--agent` is passed or the user explicitly asks for
one. See `TOKEN_BUDGET.md`.

## Commands

| Command | Args | What it does |
|---------|------|-------------|
| `/sp-plan` | `"<task>" [--agent]` | Plan a non-trivial task in the current session. Asks 1-3 questions when scope is unclear. Returns concrete `/sp-*` steps. Plan-only — no code written. |
| `/sp-develop` | `"<task>" [--review] [--agent]` | Write or modify web-player, API, or package code in the current session. Detects scope, reads only relevant rules/files, and runs targeted checks. |
| `/sp-debug` | `"<symptom>" [--agent]` | Reproduce → isolate root cause → surgical fix → verify in the current session. Works across API and web-player. |
| `/sp-review` | `[scope hint] [--agent]` | Review the current diff in the current session: targeted mechanical checks + relevant checklist items + goal check. |
| `/sp-test` | `"<scenario or scope>" [--unit\|--int\|--e2e\|--screenshot] [--agent]` | Write or run one focused test across Jest, Vitest, or Playwright. Detects the framework from scope and smoke-runs the exact file. |

## Recommended workflow

**For a non-trivial task:**
1. `/sp-plan "<task>"` — get an ordered plan. Answer any clarifying questions.
2. Run the planned steps in order — most are `/sp-develop` or `/sp-test`.
3. `/sp-review` — before opening a PR.
4. `git push` and open a PR manually.

**For a trivial change** (one-liner, copy tweak, single-file edit): skip the planner, go straight to `/sp-develop`, then commit manually.

**For a bug:** go straight to `/sp-debug`. It reproduces, isolates, and fixes without a planning step.

Add `--agent` only when you deliberately want an isolated subagent run and accept the
extra token cost.

## Concepts from the agent workflow

- **Rules are project law.** Architecture, framework, test, style, and review conventions
  live under `.agents/rules/` and are exposed to Claude through `.claude/rules/`.
- **Skills are recipes.** They are reusable workflows or external/tool references under
  `.agents/skills/` and `.claude/skills/`.
- **Commands are entrypoints.** They decide scope, load the smallest useful recipe set, and
  keep routine work in the current Claude session.
- **Subagents are coarse specialists.** Keep the list short: planner, developer, debugger,
  reviewer, and tester. Use them explicitly with `--agent`.
- **MCP is context plumbing.** Keep repository MCP disabled by default. Enable a server only
  when the task truly needs external structured context such as Figma.

## Folder layout

| Path | Purpose |
|------|---------|
| `TOKEN_BUDGET.md` | Token-saving workflow for Claude Code: current-session commands, narrow scope, short logs. |
| `rules/` | Deep convention docs plus symlinks to shared `.agents/rules/`. Read by agents and humans. |
| `skills/` | Symlinks to shared `.agents/skills/` workflow/tool skills only. |
| `agents/` | Named heavy `--agent` specialists: planning, implementation, debugging, reviewing, and testing. |
| `commands/` | Thin command delegates. |
| `templates/` | Canonical feature/entity/widget/view trees and the ui-react component tree, consumed internally by `sp-develop` through the `fsd-scaffold` skill. |

## What this layer does NOT automate

- **Running the full test suite** — that's CI. Test authoring commands smoke-run only the
  changed spec.
- **Pushing to remote / opening PRs** — push manually via `git push`. Use `pnpm commit` for the commit wizard.
- **Database migrations** — run `pnpm --filter @spotify/api db:migration:start` manually.
- **External skill locking** — `skills-lock.json` records installed external skills only;
  repository-owned rules and skills live directly under `.agents/`.

## Multi-tool compatibility

- **Claude Code** uses this `.claude/` directory directly (agents, commands, skills, rules).
- **Codex** reads `AGENTS.md` at the repo root for routing and shared non-negotiables, then opens only the relevant `.agents/rules/*.md` files.
- **Any other agent** reading `AGENTS.md` can find the right detailed rule file without loading this Claude-specific directory.

## Conventions hierarchy

1. Compact shared routing and non-negotiables → `AGENTS.md`.
2. Shared project rules → `.agents/rules/` (`.claude/rules/` symlinks here).
3. Deep Claude review/implementation docs → `.claude/rules/`.
4. Workflow/tool skills → `.agents/skills/` (`.claude/skills/` symlinks here).
5. Mechanical review row → `.claude/rules/architecture-checklist.md`.
6. One-way architectural decision → `apps/docs/docs/architecture/`.
7. Human onboarding → `README.md`, `CONTRIBUTING.md`, `CODE_STYLE.md`, and Docusaurus.

Synchronise all affected layers when a convention changes.
