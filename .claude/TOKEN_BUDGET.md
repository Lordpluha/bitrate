# Token Budget

Use this guide when working in Claude Code on this repository.

## Defaults

- Stay in the current session for `/sp-take-ticket`, `/sp-implement`, `/sp-sync-docs`.
- Use a subagent only when the user passes `--agent` or explicitly asks for one.
- Each `/sp-implement` specialist has a fixed model, set in its own agent frontmatter — not
  a per-invocation choice: `sp-planner` → Fable, `sp-developer` → Sonnet, `sp-debugger` /
  `sp-reviewer` / `sp-tester` → Opus. In-session (no `--agent`) work runs on whatever model
  the current Claude Code session is using.
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
workflows or external/tool references (e.g. `fsd-scaffold` for a new slice, `graphify` for
codebase orientation).

Do not read every rule or skill at the start of a small task — the Rule Index exists so a
cheap scan replaces reading everything.

Do not read `.claude/templates/` unless the task is creating a new slice/component and the
`fsd-scaffold` skill is active.

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

- `/sp-take-ticket` finds and confirms a GitHub ticket, moves its board card, and checks out
  a branch.
- `/sp-implement` writes code in-session by default, or dispatches to a named `--agent`
  specialist (`sp-planner`, `sp-developer`, `sp-debugger`, `sp-tester`, `sp-reviewer`) for
  isolated work — none of the five have their own slash command. It may apply the
  `fsd-scaffold` skill internally for new slices/components. It opens/updates the PR only
  after confirmation.
- Ticket/board state is never mirrored to a file — query it live via `gh`/MCP whenever
  it's needed (see `.claude/rules/knowledge-base.md`).

Do not add a new command only because a new tool exists. Add one only when the workflow is
semantically different for humans.

## Avoid

- Broad prompts like "analyze the whole project".
- Reading generated output, build artifacts, caches, or `.claude/worktrees`.
- Leaving browser/Figma/Playwright MCP tools enabled for ordinary file-only tasks.
- Feeding thousands of lines of build/test output into the model.
- Running subagents as a default post-change reflex.

## Maintenance

- Delete stale local `.claude/worktrees/*` directories after agent runs finish.
- Keep project-level `.mcp.json` empty unless the whole team wants a server enabled by
  default.
- Prefer global or user-local MCP setup for occasional tools.
- `skills-lock.json` tracks installed external skills only. Repository-owned rules and
  skills under `.claude/` are versioned directly and do not need lock entries.
