# ADR-0021: Default to agent dispatch across all commands and ordinary tasks

Status: Accepted — the default-to-dispatch principle stands; the roster it names is superseded by [ADR-0022](./0022-app-scoped-agent-roster.md)

Date: 2026-07-30

## Context

[ADR-0012](./0012-ticket-driven-agent-commands.md) established two things that this ADR
partially reverses:

- `/br-implement` defaulted to in-session work, dispatching to `br-planner`/`br-developer`/
  `br-debugger`/`br-tester`/`br-reviewer` only when the user passed `--agent` (or, for
  `br-planner`, when the task looked non-trivial — a condition that in practice created a
  real ambiguity against the command's own "stay in-session by default" preamble, since
  "non-trivial" is an agent judgment call, not an explicit user ask).
- `/br-take-ticket` and `/br-sync-docs` were deliberately left without their own agent
  files: "these four are mechanical (fetch, write, confirm), not the kind of isolated
  multi-step reasoning the `--agent` pattern exists for, so a 1:1 command↔agent split just
  duplicated near-identical content across two files per command for no behavioural
  benefit."

The user's explicit preference, stated directly: agent usage should be the default, not an
opt-in gated behind a flag or an agent's own judgment call — for all three commands, and for
ordinary coding tasks handled outside any slash command too.

## Decision

- **`/br-implement`** now dispatches to the matching specialist by default. The `--agent`
  flag is removed (dispatch no longer needs gating); a new `--session` flag is the explicit
  opt-out for narrow in-session work. The `br-planner` ambiguity ADR-0012 left open is
  resolved the same direction: non-trivial tasks always get a plan first, no flag needed.
- **`/br-take-ticket`** and **`/br-sync-docs`** each get a new, narrower read-only discovery
  agent — `br-ticket` and `br-docs` respectively (`.claude/agents/br-ticket.md`,
  `.claude/agents/br-docs.md`) — reversing ADR-0012's "give them their own agent files"
  rejection specifically. Both new agents follow the same split every other specialist
  already uses: the agent finds/proposes, the orchestrating command confirms with the user
  and executes the mutation (board move, branch checkout, issue comment, or a doc-drift fix)
  itself. Neither new agent ever mutates GitHub state, the local repo, or a file — that
  discipline is unchanged from ADR-0012, only which layer does the finding moved.
- **Ordinary tasks outside any `/br-*` command** — a task in normal conversation that touches
  `apps/api/` or `apps/web-player/` code — also route to the matching `br-*` specialist via
  the Agent tool by default now, not just work handled through `/br-implement`. Work
  in-session only when the user explicitly asks to skip the agent for that task. This is
  recorded in `CLAUDE.md` itself (the entrypoint every session reads), not just in the
  command files, since it applies whether or not a slash command was invoked.
- Confirm-before-mutate discipline is unchanged everywhere: specialists (existing and new)
  never push, open/update a PR, move a board card, or apply a doc fix themselves — that
  stays at the orchestrating layer (command or main session), after the user says yes.

## Consequences

- Every task that would previously have run in-session by default now costs an extra agent
  round-trip (dispatch latency + the token cost of a fresh agent context) — accepted
  trade-off for the specialist depth (the full architecture-checklist walk, the
  reproduce-first debugging discipline, narrow test-authoring focus) applying by default
  instead of only when explicitly requested.
- `br-ticket` and `br-docs` duplicate some prose with their respective commands (the same
  "near-identical content across two files" cost ADR-0012 flagged) — accepted now that the
  user's stated preference outweighs that duplication cost.
- `--session` is the one remaining escape hatch across all three commands, for tasks small
  enough that a dispatch round-trip is genuine overhead — kept narrow and opt-in rather than
  removed, so the fully-manual path still exists when explicitly asked for.
- Every doc surface describing the old "self-contained, no agent file" design (`CLAUDE.md`,
  `.claude/README.md`, `.claude/rules/knowledge-base.md`, `.claude/TOKEN_BUDGET.md`,
  `CONTRIBUTING.md`, `README.md`) needed a sweep alongside this ADR — see the commit that
  introduced it.

## Alternatives considered

- **Keep `--agent` as an opt-in flag, just change its default value to true** — rejected;
  a flag whose default is "on" reads as more confusing than removing the flag and adding a
  clearly-named opt-out (`--session`) for the one case that still needs it.
- **Only change `/br-implement`, leave `/br-take-ticket`/`/br-sync-docs` and
  ordinary-task routing alone** — rejected per the user's explicit "all three commands" and
  "ordinary tasks too" instructions; ADR-0012's mechanical-work reasoning for those two
  commands was sound at the time but the user's preference for agent depth by default now
  outweighs the duplication cost it was written to avoid.
- **Fold `br-ticket`/`br-docs`'s logic directly into `br-implement`'s existing specialists**
  — rejected; ticket discovery and doc-drift detection are distinct domains from
  code implementation/debugging/testing/review, and forcing them through an
  unrelated specialist would blur each agent's focused scope.
