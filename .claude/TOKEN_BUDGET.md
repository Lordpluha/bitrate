# Token Budget

Use this guide when working in Claude Code on this repository.

## Defaults

- Stay in the current session for `/sp-*` commands.
- Use a subagent only when the user passes `--agent` or explicitly asks for one.
- Use Sonnet for normal coding. Use Opus only for difficult architecture, planning, or
  debugging where the extra reasoning is worth the cost.
- Run `/clear` between unrelated tasks and `/compact` before continuing a long task.

## Scope First

Before reading broadly:

1. Identify the app/package touched by the request.
2. Use `AGENTS.md` only as a routing index.
3. Read the smallest relevant rule set.
4. Search with `rg` under narrow paths.
5. Ask before expanding into unrelated apps/packages.

Useful scope examples:

```text
apps/api/src/modules/playlists
apps/web-player/src/features/AuthModal
packages/ui-react/src/components/ui/button
```

## Skills

Read rules first, skills only when they are real workflows or external/tool references:

- API work: `project-conventions` + `api-rules`.
- Web-player work: `project-conventions` + `web-player-rules`.
- API tests: `project-conventions` + `jest-rules` + `api-rules`.
- Web/ui tests: `project-conventions` + `vitest-rules` or `playwright-rules`.
- Shared UI primitives: `project-conventions` + `shadcn-rules`.
- New FSD slice/component: rule set above + `fsd-scaffold` skill.

Do not read every rule or skill at the start of a small task.

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

- `/sp-test` covers Jest, Vitest, Playwright, screenshots, and test selection.
- `/sp-review` covers FSD, style/design-system, mechanical checks, and goal review.
- `/sp-develop` writes code and may apply the `fsd-scaffold` skill internally for new
  slices/components.

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
  skills under `.agents/` are versioned directly and do not need lock entries.
