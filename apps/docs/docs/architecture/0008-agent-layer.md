# ADR-0008: Repository-owned AI agent layer

Status: Accepted

Date: 2026-06-24

## Context

Generic coding agents do not know this monorepo's FSD boundaries, NestJS Swagger placement,
test runners, generation pipelines, or Changesets workflow.

## Decision

- `AGENTS.md` is the tool-independent source of truth.
- `CLAUDE.md` is a small Claude Code entrypoint and links to `AGENTS.md` on demand.
- `.agents/rules/` owns shared project rules.
- `.agents/skills/` owns workflow/tool skills only.
- `.claude/rules/` owns deep Claude review and implementation docs and symlinks to
  `.agents/rules/`.
- `.claude/skills/` contains symlinks to `.agents/skills/` for Claude Code.
- `.claude/agents/` owns coarse expensive isolated `--agent` workflows.
- `.claude/commands/` provides token-budget commands that run in the current session by
  default.
- Commands stay coarse: `/sp-test` selects Jest, Vitest, or Playwright from scope, and
  `/sp-review` covers FSD, style/design-system, mechanical checks, and goal review.
- `.claude/templates/` is the canonical FSD scaffold source.
- `.mcp.json` is empty by default; repository MCP servers are enabled only when the team
  deliberately wants them loaded for everyone.
- `skills-lock.json` records installed external skills only. Repository-owned rules and
  skills under `.agents/` are versioned directly.

Project rules override generic agent habits. Agents never push, open PRs, or create releases
unless the user explicitly requests those external changes.

## Consequences

Changing a convention requires synchronising its shared rule, relevant rules reference,
checklist, Claude adapter docs, and human-facing documentation.

## Alternatives considered

- **Global prompts only** — rejected because project conventions need version control.
- **One giant prompt** — rejected because progressive context is easier to maintain.
