# ADR-0016: Retire the obsidian/ ticket/board mirror for live GitHub queries

Status: Accepted

Date: 2026-07-24

Supersedes: [ADR-0012](./0012-ticket-driven-agent-commands.md) (the `/sp-sync-ticket` and
`/sp-sync-board` command-and-mirror portion only — the rest of ADR-0012's command/agent
split stays in force), [ADR-0014](./0014-obsidian-storage-scope.md) (the `Tickets/`/`Board/`
committed-vs-local-only portion only — the `Decisions/` portion stays in force).

## Context

`/sp-sync-ticket` and `/sp-sync-board` (added by [ADR-0012](./0012-ticket-driven-agent-commands.md))
mirrored GitHub issue, PR, and Projects-board state into `obsidian/Tickets/*.md` and
`obsidian/Board/board.md`. [ADR-0014](./0014-obsidian-storage-scope.md) then worked out
which half of that mirror to commit.

In practice the mirror only ever added a staleness window: any agent working a ticket
already has `gh`/MCP available and one command away from the live state, so a file copy
was never the fastest path to current information — it was a second, out-of-date source
that had to be refreshed before being trusted. Two developers (or an agent and a human)
both moving cards or re-syncing independently was also a standing source of merge conflicts
in `obsidian/Tickets/*.md`, the exact failure mode ADR-0014 already had to design around for
`Board/board.md`.

`/sp-take-ticket` already queried GitHub live for its own step (find/confirm a ticket,
move its card) — the mirror commands were a separate, redundant read path layered on top,
not something other commands depended on.

## Decision

- `/sp-sync-ticket` and `/sp-sync-board` are deleted. There is no command, agent, or hook
  that writes GitHub ticket/board state to a file anywhere in this repository.
- `obsidian/Tickets/` and `obsidian/Board/` no longer exist. `obsidian/` now contains only
  `Decisions/` (unaffected by this ADR — see [ADR-0014](./0014-obsidian-storage-scope.md)).
- Ticket/board state is queried live, on demand, every time it's needed — via an MCP GitHub
  server if one is connected in the session, otherwise the `gh` CLI:
  ```bash
  gh issue view <number> --json number,title,body,state,labels,assignees,url,comments
  gh project item-list <project-number> --owner Lordpluha --format json
  gh pr list --search "linked:<number>" --json number,title,state,url
  ```
- `/sp-take-ticket` keeps its existing live-query behavior unchanged. `/sp-implement`
  re-queries ticket state live if it needs it mid-implementation, rather than reading a
  vault note.
- The command set shrinks from five to three: `/sp-take-ticket`, `/sp-implement`,
  `/sp-sync-docs`. Nothing about `/sp-implement`'s specialist-agent routing
  (`sp-planner`/`sp-developer`/`sp-debugger`/`sp-tester`/`sp-reviewer`) or `/sp-sync-docs`
  changes.
- The sensitive-label withholding rule ADR-0014 added for `Tickets/` (never commit the
  body of a `security`/`confidential`-labeled issue) is moot — there is no committed copy
  to withhold anything from. Reading a sensitive issue live still goes through GitHub's own
  access controls, same as browsing it in a web browser.

## Consequences

- Ticket/board state shown to the user is always current — there's no "last synced at"
  window to account for, and no risk of acting on a stale mirror.
- No more merge-conflict risk in `obsidian/Tickets/*.md`/`obsidian/Board/board.md` from
  concurrent syncs — those files don't exist to conflict.
- A `## Notes` section under a ticket note (session/human working notes surviving repeated
  syncs) is no longer available as a pattern — anyone who wants durable notes on a ticket
  now either comments on the GitHub issue itself or writes a dated note under
  `obsidian/Decisions/` if the content is a decision, not a ticket-status log.
- Every ticket/board lookup now costs a live `gh`/MCP round trip instead of a file read —
  a minor latency cost, accepted because the mirror's core promise (accurate state) was
  never fully reliable anyway.
- `.claude/rules/knowledge-base.md`, `AGENTS.md`, `README.md`, `CLAUDE.md`,
  `CONTRIBUTING.md`, `.claude/README.md`, `.claude/TOKEN_BUDGET.md`, and
  `.claude/agents/sp-planner.md` all drop their `/sp-sync-ticket`/`/sp-sync-board`
  references — anywhere a command/agent count or table is stated, it now reflects three
  commands, not five.

## Alternatives considered

- **Keep the mirror, just sync more often** — rejected; more frequent syncing raises the
  merge-conflict/staleness-window problem's likelihood, not lowers it, and doesn't remove
  the fundamental redundancy of maintaining a second copy of data that's one `gh` call away.
- **Move the mirror to the GitHub wiki instead of `obsidian/`** — considered in the
  discussion that led here; rejected for ticket/board data specifically because the wiki is
  freeform documentation storage with no relationship to Issues/Projects, so "mirroring
  issues into wiki pages" would still be a second, syncable copy with the same staleness
  problem, just relocated. (The wiki remains a reasonable home for genuinely freeform,
  no-PR-needed content — that question is separate from this ADR and unresolved as of this
  writing.)
- **Keep `/sp-sync-ticket`/`/sp-sync-board` as read-only "print current state, don't write a
  file" commands** — rejected as unnecessary indirection: the `gh`/MCP calls they'd run are
  already documented in `.claude/rules/knowledge-base.md`, and any command or agent that
  needs ticket/board context can issue them directly without a wrapper command whose only
  job would be to format the same output.
