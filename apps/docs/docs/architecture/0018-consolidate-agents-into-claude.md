# ADR-0018: Consolidate `.agents/`/`AGENTS.md` into `.claude/` only

Status: Accepted

Date: 2026-07-28

Supersedes: [ADR-0008](./0008-agent-layer.md) (the layer-structure portion — `AGENTS.md` as
tool-independent source of truth, `.agents/rules/`+`.agents/skills/` as canonical, `.claude/`
symlinking to them).

## Context

ADR-0008 made `.agents/` the canonical, tool-agnostic home for rules and skills, with
`.claude/rules/`/`.claude/skills/` symlinking to it and `AGENTS.md` at the repo root serving
as a Codex-compatible entrypoint — the premise being that a second AI tool (Codex, or any
other agent reading `AGENTS.md`) would read the same rules without loading a
Claude-branded directory.

In practice only Claude Code was ever used against this repository. The split never paid
for itself, and it actively caused a real bug: nine rule files
(`react.md`, `typescript.md`, `styling.md`, `forms.md`, `code-principles.md`, `monorepo.md`,
`commit-style.md`, `fsd-web-player.md`, `architecture-checklist.md`) existed only as plain
files in `.claude/rules/` with no `.agents/rules/` counterpart — silently contradicting
`AGENTS.md`'s own claim that "Claude Code sees the same shared rules through
`.claude/rules/*.md` symlinks" — for an unknown period before a routine audit caught it.
Two directories that must stay hand-synced is exactly the kind of drift class this project
otherwise goes out of its way to eliminate (see [ADR-0016](./0016-live-github-queries.md),
[ADR-0017](./0017-remove-obsidian-vault.md)).

## Decision

- Delete `.agents/` entirely. Every rule file moves to `.claude/rules/` as a real file; every
  skill moves to `.claude/skills/` as a real directory. No symlinks remain between the two.
- Delete `AGENTS.md`. Its still-useful content — Repository Map, the exhaustive Rule Index
  table, the Commands table, Model tier by task type, Non-Negotiables — folds directly into
  `CLAUDE.md`, which becomes the single compact entrypoint for this repository.
- Drop the Codex-specific carve-outs that existed only to accommodate a second tool that was
  never actually in use: the "Codex has no equivalent per-task subagent file" paragraph, and
  the "agents without a hook runtime (Codex, others) follow it as a hard rule instead"
  phrasing on the `.env` and formatting non-negotiables. Claude Code's hooks
  (`block-env-access.sh`, `format-on-edit.sh`) are simply how those two rules are enforced
  here, full stop.
- Every prior cross-reference to `.agents/rules/*.md`, `.agents/skills/*`, or `AGENTS.md`
  (across `.claude/`, `apps/docs/`, `CODE_STYLE.md`, `CONTRIBUTING.md`, `README.md`, and
  `scripts/setup-graphify.mjs`) was swept to point at `.claude/rules/*.md`,
  `.claude/skills/*`, and `CLAUDE.md`.

## Consequences

- One directory (`.claude/`) and one entrypoint file (`CLAUDE.md`) to keep in sync when a
  convention changes — the symlink-drift bug class this ADR was written in response to
  cannot recur, because there is no second copy to drift from.
- If a second AI tool is ever genuinely adopted against this repository, the content itself
  is unchanged — only its location moved — so re-introducing a tool-agnostic layer (a fresh
  `AGENTS.md` plus symlinks, or a generation step) is a mechanical, low-risk follow-up, not a
  rewrite.
- `.claude/README.md`'s "Multi-tool compatibility" section is removed; the project is
  Claude-Code-only until a concrete second-tool need reappears.

## Alternatives considered

- **Keep `.agents/` canonical, `.claude/` symlinks (status quo)** — rejected: the drift bug
  already happened once; keeping the split bets that manual "sync every layer" discipline
  holds indefinitely for a multi-tool benefit that was never realized in this repository's
  actual history.
- **Reverse the symlink direction — keep `AGENTS.md`, make `.claude/` canonical** — rejected:
  still two directories and one extra root file to maintain for Codex-compatibility that
  isn't in use. If that need reappears, deriving a clean tool-agnostic layer from one
  consolidated source is easier than un-tangling a still-partial split.
