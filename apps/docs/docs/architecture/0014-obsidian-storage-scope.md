# ADR-0014: What in obsidian/ is committed vs local-only

Status: Accepted — superseded by [ADR-0017](./0017-remove-obsidian-vault.md)

Date: 2026-07-20

**Fully superseded.** `Tickets/`/`Board/` were retired first by
[ADR-0016](./0016-live-github-queries.md) (live GitHub queries), and `Decisions/` — the
only thing left in `obsidian/` after that — was removed by
[ADR-0017](./0017-remove-obsidian-vault.md), which deleted the `obsidian/` vault entirely.
This ADR's subject no longer exists. Read the sections below as describing the design as
decided at the time, not the current state.

## Context

`obsidian/` (see [ADR-0008](./0008-agent-layer.md), [ADR-0015](./0015-graphify-obsidian-decoupled.md),
and `.claude/rules/knowledge-base.md`) has three segments: `Decisions/`, `Tickets/`,
`Board/`. (An earlier version also nested graphify's codebase map at `obsidian/Knowledge/`;
[ADR-0015](./0015-graphify-obsidian-decoupled.md) moved that entirely out of the vault, to
`graphify-out/obsidian/` — out of scope for this ADR.) The first pass committed everything
in `obsidian/`. In practice:

- `obsidian/Board/board.md` is fully regenerated wholesale by `/br-sync-board` every run.
- This repository is **public** on GitHub (`gh repo view` → `visibility: PUBLIC`).

Committing `Board/board.md` means: every regeneration is a large, low-signal diff in
`git log`/`git blame`; two developers running `/br-sync-board` independently and both
committing produces near-guaranteed merge conflicts in a file neither of them wrote by hand.

`obsidian/Decisions/` and `obsidian/Tickets/` are different in kind: `Decisions/` is
entirely hand/session-authored, and `Tickets/` mixes synced fields with a `## Notes` section
the sync logic explicitly preserves — both carry content that doesn't exist anywhere else
and isn't cheaply regenerable.

## Decision

- `obsidian/Decisions/` and `obsidian/Tickets/` are **committed**.
- `obsidian/Board/board.md` is **gitignored, local-only**, regenerated on demand
  (`/br-sync-board`).
- Because `obsidian/Tickets/` is committed to a **public** repo, `/br-sync-ticket` and
  `/br-sync-board` withhold the body of any issue/PR labeled `security`, `confidential`, or
  similar — they sync only metadata (number, title, status, URL, labels) for those, never
  the full text.

## Consequences

- A fresh clone does not have `obsidian/Board/board.md` until someone runs
  `/br-sync-board` — it isn't "clone and go" the way `Decisions/`/`Tickets/` are. Accepted
  trade-off for not carrying a high-churn, fully-derived snapshot in git.
- `git log`/`git blame`/clone size for `obsidian/` stay proportional to hand-authored +
  synced content.
- A security-labeled issue's discussion never lands in public git history via the sync
  path; anyone who needs the full detail reads it on GitHub directly (where the
  repo/org's own access controls on sensitive issues apply, if any).

## Alternatives considered

- **Commit everything, including graphify's codebase map inside the vault** (the original
  design) — rejected once actual output size (26 MB / ~6,000 files from a single run) and
  the public-repo sensitive-data question were known. This also motivated
  [ADR-0015](./0015-graphify-obsidian-decoupled.md): once the codebase map moved out of
  `obsidian/` entirely, this ADR's remaining scope (`Decisions/`/`Tickets/`/`Board/`) got
  much smaller and the committed/local-only split became easy.
- **Gitignore all of `obsidian/`** — rejected; `Decisions/` and `Tickets/` carry real,
  non-regenerable content and are exactly the kind of small, high-value data a knowledge
  base should persist in git for other sessions and collaborators to read.
- **Redact sensitive issues instead of withholding them entirely** — rejected as
  over-engineering; withholding the body and keeping only metadata is simpler and doesn't
  require judging what counts as "safe to partially show."
