# ADR-0019: Remove the `graphify:obsidian` convenience wrapper

Status: Accepted

Date: 2026-07-28

Supersedes: [ADR-0015](./0015-graphify-obsidian-decoupled.md) (the convenience-wrapper
portion only — the decoupling decision itself stands).

## Context

[ADR-0015](./0015-graphify-obsidian-decoupled.md) made graphify's `--obsidian` export
opt-in and wired a `pnpm graphify:obsidian` script that ran `graphify export obsidian`
followed by `scripts/organize-knowledge.mjs` (a post-processor that reorganized the flat
vault graphify writes into folders mirroring each note's source path). Nothing in this
project's default workflow ever depended on either piece — `graphify . --update`,
`graphify query`, and `graph.html` are the only graphify surface actually used day to day.

With no realized use of the Obsidian-browsing path, the convenience wrapper was pure
maintenance surface: a script to keep working, a package.json entry to explain, and a
"Optional: Obsidian-flavored export" section in `.claude/rules/knowledge-base.md` to keep
accurate — for a capability nobody was exercising.

## Decision

- Delete `scripts/organize-knowledge.mjs`.
- Remove the `graphify:obsidian` script from the root `package.json`.
- Trim `.claude/rules/knowledge-base.md`'s Obsidian-export subsection to a short pointer:
  `graphify export obsidian` still exists as a graphify feature and can be run directly by
  anyone who wants a one-off Obsidian view of the codebase graph; this repo simply no
  longer wires or documents a wrapper around it.
- `graphify . --update`, `graphify query`, `graph.html`, and `GRAPH_REPORT.md` — the
  default, actually-used workflow — are entirely unaffected.

## Consequences

- One fewer script, one fewer package.json entry, one shorter doc section to keep in sync.
- Anyone who wants the Obsidian view of the codebase graph in the future runs `graphify
  export obsidian --dir <path>` directly; the flat vault graphify produces natively is
  usable as-is, just not folder-organized. Re-adding an organizer script later, if someone
  actually wants it, is a small, independent addition — it doesn't require undoing
  anything else in this ADR.

## Alternatives considered

- **Keep the wrapper "just in case"** — rejected; an unused convenience path is exactly the
  kind of maintenance surface this project has repeatedly cut elsewhere (see
  [ADR-0016](./0016-live-github-queries.md), [ADR-0017](./0017-remove-obsidian-vault.md),
  [ADR-0018](./0018-consolidate-agents-into-claude.md)) once it was confirmed nobody was
  relying on it.
- **Remove `graphify export obsidian` support from documentation entirely** — rejected; the
  underlying graphify feature is real and someone may want it later. Only the
  project-specific wrapper and its organizing script are removed, not knowledge of the
  feature itself.
