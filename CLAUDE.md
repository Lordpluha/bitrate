# Claude Code

Use this file as the small Claude entrypoint. Do not eagerly load the full project handbook.

## Read On Demand

- `AGENTS.md` — compact routing index for all agents; not the full handbook.
- `.claude/README.md` — Claude command layer and workflow.
- `.claude/TOKEN_BUDGET.md` — token-saving rules.
- `.agents/rules/` — shared project rules; `.claude/rules/` symlinks here for Claude Code.
- `.agents/skills/` — workflow/tool skills only; `.claude/skills/` symlinks here.

## Defaults

- Keep `/sp-*` commands in the current session unless `--agent` is passed.
- Start with narrow `rg` searches in the app/package named by the task.
- Read only the smallest relevant rule set before editing; load skills only for workflows
  or tool-specific references.
- Avoid `.claude/worktrees`, build output, caches, generated files, and `.env*`.
- Prefer targeted checks and short logs before full monorepo gates.

Open `AGENTS.md` when you need routing or shared non-negotiables. For detailed guidance,
prefer the smallest relevant file under `.claude/rules/*.md`.
