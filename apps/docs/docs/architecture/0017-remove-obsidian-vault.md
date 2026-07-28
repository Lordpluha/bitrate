# ADR-0017: Remove the obsidian/ working-notes vault

Status: Accepted

Date: 2026-07-25

Supersedes: [ADR-0014](./0014-obsidian-storage-scope.md) (entirely — its subject no longer
exists), [ADR-0012](./0012-ticket-driven-agent-commands.md) (the Obsidian-vault portion
only — the command/agent split it defines stays in force).

## Context

By the time [ADR-0016](./0016-live-github-queries.md) retired the `Tickets/`/`Board/`
mirror, `obsidian/` held only one thing: `Decisions/`, a folder for dated, hand/session-
authored notes on non-obvious design choices and root-cause analyses, promoted to a real
ADR if a decision turned out to be durable.

In practice, `Decisions/` was never used — the folder held nothing but its own
`_template.md`. Every actual decision worth recording during this project's active
development ended up going straight into an ADR under `apps/docs/docs/architecture/`
instead, because the "write a quick note now, maybe promote it to an ADR later" two-step
added a step without adding value: if a decision was worth writing down at all, writing
the ADR directly was no more effort than writing an interim note plus a later promotion
pass, and skipped the risk of good analysis sitting stale in an unpromoted note nobody
reads.

`graphify`'s own, unrelated `--obsidian` export flavor (`graphify export obsidian`,
writing to `graphify-out/obsidian/`) is a completely separate feature — an optional,
opt-in way to browse the *codebase graph* in Obsidian's UI, sharing nothing but a tool
name with the working-notes vault this ADR removes. See
[ADR-0015](./0015-graphify-obsidian-decoupled.md), which is otherwise unaffected by this
decision.

## Decision

- The `obsidian/` directory (vault README, `Decisions/`, local `.obsidian/` app state) is
  deleted from the repository. It was never committed (fully gitignored/untracked
  throughout its life), so removing it has no git-history cost.
- There is no replacement working-notes mechanism. A decision worth recording goes
  straight into a real ADR (`apps/docs/docs/architecture/template.md`). A decision not
  durable enough to justify an ADR lives only in the PR description or commit body for
  the change that made it — it is not persisted anywhere else.
- `.claude/rules/knowledge-base.md` is trimmed to cover only graphify (codebase
  query/map, including its own unrelated optional Obsidian export) and live GitHub
  ticket/board queries — the two capabilities that are actually used. It is no longer
  "graphify + obsidian/"; there is no vault left to pair it with.
- `graphify`'s `--obsidian` export feature, `pnpm graphify:obsidian`, and
  `scripts/organize-knowledge.mjs` were entirely unaffected by this decision — they never
  depended on the project's `obsidian/` vault (see ADR-0015). The convenience wrapper
  (`pnpm graphify:obsidian` + `scripts/organize-knowledge.mjs`) was itself later removed,
  unrelated to this ADR — see
  [ADR-0019](./0019-remove-obsidian-export-convenience.md).

## Consequences

- One less directory, one less "is this the write place to note this?" decision for
  every session — durable decisions have exactly one home (ADRs), everything else has
  none by design.
- Any nontrivial analysis that isn't worth a full ADR is no longer captured anywhere
  outside the PR/commit it belongs to. This is an accepted trade-off, not an oversight —
  the alternative (a notes layer nobody used) wasn't providing that capture either.
- `AGENTS.md`, `CLAUDE.md`, `.claude/README.md`, `.claude/TOKEN_BUDGET.md`, and
  `README.md` drop their `obsidian/`/`Decisions/` references.
- If a genuine need for lightweight, no-PR-review notes resurfaces later, the GitHub wiki
  (see the "Alternatives considered" note in [ADR-0016](./0016-live-github-queries.md)) is
  the most likely candidate — evaluated fresh at that point, not resurrected as this ADR's
  vault.

## Alternatives considered

- **Move `Decisions/` to the GitHub wiki** — discussed earlier in the same conversation
  that led to ADR-0016; not pursued here because the deeper finding was that the
  notes-then-promote workflow itself wasn't being used, not that it was in the wrong
  storage location. Relocating an unused workflow doesn't fix that.
- **Keep `obsidian/` but drop only the vault README/`.obsidian/` app state** — rejected;
  a single-purpose folder holding nothing but an empty template directory isn't worth
  keeping "just in case."
