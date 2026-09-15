# Token Budget

Use this guide when working in Claude Code on this repository.

## Defaults

- Dispatch to the matching specialist for `/br-create-task`, `/br-implement`, `/br-auto`,
  `/br-sync-docs` — and for ordinary tasks outside any command that touch application code
  (see `CLAUDE.md`'s "Default to agent dispatch, even outside a command"). This is the
  default; it costs an extra agent round-trip per task.
- Stay in the current session only when the user passes `--session` or explicitly asks to
  skip the agent.
- Each specialist has a fixed model, set in its own agent frontmatter — not a per-invocation
  choice: `br-planner` → Fable; the five `br-*-developer` agents and `br-librarian` →
  Sonnet; `br-debugger`/`br-reviewer`/`br-tester`/`br-devops`/`br-worker` → Opus.
  `br-worker` delegates to the others, so a task run through it costs the orchestrator's
  tokens *plus* each specialist's — use it when you want one agent accountable end to end,
  not for a single-stage task.
  In-session (`--session`) work runs on whatever model the current Claude Code session is
  using.
- Run `/clear` between unrelated tasks and `/compact` before continuing a long task.

## Scope First

Before reading broadly:

1. Identify the app/package touched by the request.
2. Use `CLAUDE.md`'s Rule Index only as a routing index.
3. Read the smallest relevant rule set.
4. Search with `rg` under narrow paths.
5. Ask before expanding into unrelated apps/packages.

Useful scope examples:

```text
apps/api/src/modules/playlists
apps/web-player/src/features/AuthModal
packages/ui-react/src/components/ui/button
```

## Rules and skills

Every command has access to any skill under `.claude/skills/` — not a
fixed subset. `CLAUDE.md`'s **Rule Index** table is the single, exhaustive scope→rule
mapping — read it there, not duplicated here. Read skills only when they are real
workflows or external/tool references (e.g. `fsd` for a new slice, `graphify` for
codebase orientation).

Do not read every rule or skill at the start of a small task — the Rule Index exists so a
cheap scan replaces reading everything.

Do not read `.claude/templates/` unless the task is creating a new slice/component and the
`fsd` skill is active.

## Commands

Prefer targeted commands and short logs:

```bash
pnpm check-types 2>&1 | head -200
pnpm lint 2>&1 | head -200
pnpm test 2>&1 | rg "FAIL|Error|error|failed" -C 5 | head -200
```

Run full monorepo checks only before a commit/PR or when the changed surface justifies it.

## Consolidated commands

Keep entrypoints broad and let them detect scope:

- `/br-create-task` reads the board and repo context, then drafts or restructures one
  issue. It confirms before every GitHub mutation.
- `/br-implement` checks out the branch, then dispatches to a named specialist by default
  (`br-planner`, the matching `br-*-developer`, `br-debugger`, `br-tester`, `br-reviewer`,
  `br-devops`) — none of them have their own slash command. It may apply the `fsd`
  skill internally for new slices/components. It opens/updates the PR only after
  confirmation.
- `/br-auto` runs the unattended pipeline: one `br-worker` per claimed issue in its own
  worktree, with the dispatcher owning every GitHub action.
- Ticket/board state is never mirrored to a file — query it live via `gh`/MCP whenever
  it's needed (see `.claude/rules/knowledge-base.md`).

Do not add a new command only because a new tool exists. Add one only when the workflow is
semantically different for humans.

## Avoid

- Broad prompts like "analyze the whole project".
- Reading generated output, build artifacts, caches, or `.claude/worktrees`.
- Leaving browser/Figma/Playwright MCP tools enabled for ordinary file-only tasks.
- Feeding thousands of lines of build/test output into the model.

## Maintenance

- Delete stale local `.claude/worktrees/*` directories after agent runs finish.
- Keep project-level `.mcp.json` empty unless the whole team wants a server enabled by
  default.
- Prefer global or user-local MCP setup for occasional tools.
- `skills-lock.json` tracks installed external skills only. Repository-owned rules and
  skills under `.claude/` are versioned directly and do not need lock entries.
