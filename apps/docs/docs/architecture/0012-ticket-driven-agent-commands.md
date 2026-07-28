# ADR-0012: Ticket-driven agent commands, GitHub Projects, and Obsidian sync

Status: Accepted

Date: 2026-07-20

Supersedes: [ADR-0008](./0008-agent-layer.md) (the command-set portion only — the layer
structure it defined, `AGENTS.md`/`.agents/`/`.claude/` ownership, stayed in force until
[ADR-0018](./0018-consolidate-agents-into-claude.md) later folded it entirely into
`.claude/`).

**Partially superseded** by [ADR-0016](./0016-live-github-queries.md): `/sp-sync-ticket`
and `/sp-sync-board`, described below as mirroring GitHub state into `obsidian/Tickets/`
and `obsidian/Board/board.md`, were deleted — ticket/board state is now queried live. The
five-command framing and the sync-command sections below describe the design as decided at
the time; the current command set is three (`/sp-take-ticket`, `/sp-implement`,
`/sp-sync-docs`). Everything else in this ADR (the specialist-agent split, model
assignments, `/sp-implement` routing, self-contained-command pattern, confirm-before-mutate
rule) is unaffected and still in force. [ADR-0017](./0017-remove-obsidian-vault.md) later
removed the `obsidian/` vault entirely — every mention of it below (as a sync target or as
"source of truth for ticket state") is historical only.

## Context

ADR-0008 defined five coarse dev-task commands (`/sp-plan`, `/sp-develop`, `/sp-debug`,
`/sp-review`, `/sp-test`), each a 1:1 pairing of a slash command with its own heavy `--agent`
specialist. That pairing had no connection to how work is actually tracked — a GitHub
Projects board with issues and pull requests. Picking up a ticket, syncing its state, and
opening a PR were all manual steps outside the agent layer.

The project also added a working knowledge base (`obsidian/`, see
`.claude/rules/knowledge-base.md`) and a `graphify`-generated codebase map, but nothing tied
GitHub ticket state to that vault.

## Decision

- Replace the five `sp-*` **commands** with five ticket-driven commands:
  `/sp-take-ticket`, `/sp-implement`, `/sp-sync-ticket`, `/sp-sync-board`, `/sp-sync-docs`.
  Commands are the entrypoints — they decide scope and stay in the current session by
  default.
- Keep the classic specialist **agents**, renamed for clarity: `sp-planner` (was `sp-plan`),
  `sp-developer` (was `sp-develop`), `sp-debugger` (was `sp-debug`), `sp-tester` (was
  `sp-test`), `sp-reviewer` (unchanged name). Their bodies are otherwise unchanged from
  ADR-0008: `sp-planner` is plan-only and asks clarifying questions; `sp-developer` writes
  code and auto-invokes `sp-reviewer` on diffs over 100 lines/5 files; `sp-debugger`
  reproduces → isolates → fixes → verifies; `sp-tester` writes/runs one focused spec;
  `sp-reviewer` does the mechanical pass + architecture checklist walk.
- Model is fixed per agent, in its own frontmatter: `sp-planner` → Fable (light,
  fast-turnaround planning); `sp-developer` → Sonnet (routine implementation); `sp-debugger`,
  `sp-tester`, `sp-reviewer` → Opus (the three verification-heavy roles, where a missed edge
  case in a bug repro, a test, or a review is expensive). This is not a per-invocation
  choice — changing it means editing the agent file.
- What changed is the **pairing**: these five no longer each have their own 1:1 slash
  command. `/sp-implement [--agent] [--plan] [--review]` is the single entrypoint that
  routes to whichever specialist the task needs (`sp-planner` for `--plan` or a non-trivial
  task, `sp-developer` for a feature, `sp-debugger` for a bug, `sp-reviewer` for `--review`
  or a large diff), or does the equivalent narrow-scope work itself in-session when no
  isolated agent is warranted.
- `/sp-take-ticket` finds a GitHub issue (via `gh`, from the GitHub Projects board or a
  direct reference), moves its board card, and checks out a branch.
- `/sp-sync-ticket` and `/sp-sync-board` mirror GitHub issue/PR/board state into
  `obsidian/Tickets/` and `obsidian/Board/board.md`. Both are strictly read-only on GitHub.
  `/sp-sync-docs` finds and (with confirmation) fixes drift between `apps/docs/` and the
  rule/ADR sources — see [ADR-0013](./0013-docs-sync.md).
- `/sp-take-ticket`, `/sp-sync-ticket`, `/sp-sync-board`, and `/sp-sync-docs` are **fully
  self-contained** — their instructions live directly in the command file, there is no
  separate agent file, and there is no `--agent` flag for them. They talk to GitHub
  themselves: prefer an MCP GitHub server if one is connected in the session, otherwise the
  `gh` CLI (the only proven working path at the time this was written — no GitHub MCP was
  connected). Only `/sp-implement` has named specialist agents behind it.
- Every command and every agent (the five `/sp-implement` specialists plus the four
  self-contained commands) has access to **any** skill under
  `.claude/skills/`, not a fixed subset — `tools:` frontmatter includes
  `Skill` on every agent file that has one.
- `/sp-take-ticket` and `/sp-implement` (whether in-session or via a dispatched specialist)
  are the only paths that mutate GitHub state (board card moves, issue comments,
  `git push`, PR create/edit), and both confirm with the user before every such action — a
  prior approval in the conversation does not carry over to a later mutating action. The
  five specialist agents themselves never push or open/update a PR; that responsibility
  stays at the `/sp-implement` orchestration level.
- GitHub Projects access requires the `read:project` OAuth scope (`project` for writes) on
  the local `gh` token; this is a per-developer one-time `gh auth refresh` step, not
  something the agent layer can grant itself.

## Consequences

- The specialist personas (plan/develop/debug/test/review) keep their full depth —
  `sp-reviewer`'s architecture-checklist walk and `sp-debugger`'s reproduce-first discipline
  are unchanged from ADR-0008 — while the commands a developer actually types collapse to
  the five ticket-workflow ones. Routing logic (which specialist a given task needs) now
  lives in `/sp-implement` instead of being implicit in "which command did you type."
  `/sp-implement`'s in-session (no `--agent`) path still does lint/type-check as the
  baseline gate for small tasks that don't warrant dispatching a specialist.
- The four GitHub/Obsidian-sync commands stay simple on purpose: they're mechanical (fetch
  data, write a file, confirm before mutating), not reasoning-heavy, so a dedicated agent
  file added indirection without adding capability. Their instructions living directly in
  the command means one file to read, not two.
- The Obsidian vault (`obsidian/`) becomes the source of truth for "what's the state of
  ticket #N locally," independent of and read-only against GitHub — `obsidian/Tickets/*.md`
  preserves a `## Notes` section across syncs specifically so working notes survive.
- Changing any of the five agents or five commands requires synchronising: the command doc
  (and its agent doc, for `/sp-implement`'s five), `AGENTS.md`'s command table,
  `.claude/README.md`, `.claude/TOKEN_BUDGET.md`, `.claude/rules/knowledge-base.md`, and any
  rule file's "Related rules and skills" section that names a command or agent.

## Alternatives considered

- **Fold planning/debug/review/test into `sp-implement` as inline, non-specialist work** —
  tried first in this session, then rejected: it discarded the specialist personas'
  accumulated depth (the full architecture-checklist walk, the reproduce-first debugging
  discipline) for no benefit once the real fix was just re-pairing existing agents with new
  commands, not removing the agents.
- **Keep `sp-*` (one command per agent) alongside the four new ticket commands** —
  rejected; two overlapping command sets for "do development work" would fragment the
  workflow and confuse routing. Keeping the agents but retiring their 1:1 commands in favor
  of `/sp-implement`'s routing gets the same specialist depth without the fragmentation.
- **Let `/sp-implement` push and open PRs without confirmation** — rejected; opening/updating
  a PR and moving a board card are both visible to the rest of the team and stay behind an
  explicit per-action confirmation, consistent with this session's safety defaults.
- **Give `sp-take-ticket`/`sp-sync-ticket`/`sp-sync-board`/`sp-sync-docs` their own agent
  files too** — tried first in this session, then rejected: these four are mechanical
  (fetch, write, confirm), not the kind of isolated multi-step reasoning the `--agent`
  pattern exists for, so a 1:1 command↔agent split just duplicated near-identical content
  across two files per command for no behavioural benefit.
