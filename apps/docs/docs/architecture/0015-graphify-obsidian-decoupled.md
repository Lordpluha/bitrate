# ADR-0015: graphify and the obsidian/ vault are decoupled

Status: Accepted — the decoupling decision stands. The specific convenience wrapper this
ADR describes (`pnpm graphify:obsidian` + `scripts/organize-knowledge.mjs`) was later
removed by [ADR-0019](./0019-remove-obsidian-export-convenience.md); `graphify export
obsidian` itself is unaffected and still available to run directly.

Date: 2026-07-20

## Context

The first version of this repository's knowledge-base setup wrote graphify's `--obsidian`
codebase-map export directly into `obsidian/Knowledge/` — a subfolder of the project's
working notes vault (see [ADR-0008](./0008-agent-layer.md),
[ADR-0014](./0014-obsidian-storage-scope.md)). That physically coupled two independent
tools:

- **graphify** is a general-purpose codebase-query tool. It works standalone — `graphify
  query`, `graph.html`, `GRAPH_REPORT.md` — with no dependency on Obsidian or on this
  project's `obsidian/` vault existing at all.
- **`obsidian/`** is a working knowledge base for hand-written decisions and a GitHub
  ticket/board mirror (`Decisions/`, `Tickets/`, `Board/`). None of that content depends on
  graphify — `Decisions/` is pure session/human notes, `Tickets/`/`Board/` sync from GitHub.

Nesting graphify's export inside `obsidian/` made the vault's structure hostage to
graphify's own export format (a flat, ~6,000-file dump — see ADR-0014's original
"Knowledge/ naming and structure" section, now superseded by this ADR) and implied a
dependency that doesn't actually exist: you don't need graphify to have a useful
`obsidian/` vault, and you don't need `obsidian/` to get value from graphify.

## Decision

- **Default workflow uses only graphify's native formats**: `graphify . --update` refreshes
  `graph.json`, `graph.html`, `GRAPH_REPORT.md` — no Obsidian involved at any point. This is
  how Claude and developers actually consume graphify. Relocating the export (below) fixed
  the *physical* nesting but initially left graphify's default output still shaped as an
  Obsidian vault; representing graphify's data through another tool's format by default was
  itself a residual coupling, corrected here.
- graphify's Obsidian-flavored export (`graphify export obsidian`) is **opt-in only** — not
  run by default, not part of the `--update` refresh command, generated only when someone
  explicitly wants to browse the graph in Obsidian's UI. When generated, it goes to
  `graphify-out/obsidian/` (reorganized into folders by `scripts/organize-knowledge.mjs` —
  see that script and `.claude/rules/knowledge-base.md` for the naming/structure rationale
  that used to live in ADR-0014). It is a complete, independent Obsidian vault in its own
  right, with no path dependency on the project's `obsidian/` working-notes vault.
- The project's `obsidian/` vault (`Decisions/`, `Tickets/`, `Board/`) has zero structural
  or workflow dependency on graphify — it never gets populated by a graphify command, opt-in
  or not.
- "graphify and obsidian work together" means: Claude uses both as independent capabilities
  in the same session — e.g. `graphify query` to orient in unfamiliar code, then write the
  finding into `obsidian/Decisions/` — not that one tool's storage or output format is
  nested inside the other's.

## Consequences

- Either tool can be adopted, disabled, or replaced without touching the other's files or
  conventions. Removing graphify from a future dev environment doesn't touch `obsidian/`;
  clearing `obsidian/` doesn't touch `graphify-out/`.
- `obsidian/`'s structure is no longer coupled to graphify's export format — its shape is
  fully owned by this project (`Decisions/`/`Tickets/`/`Board/`), not partially dictated by
  a third-party tool's `--obsidian` flag.
- Anyone wanting the graph-browsing UX opens two vaults in Obsidian instead of one
  (`obsidian/` for notes, `graphify-out/obsidian/` for the codebase map, generated on
  request) — a minor UX cost in exchange for the decoupling.
- `.claude/rules/knowledge-base.md` documents both systems side by side rather than
  presenting graphify as a sub-feature of the vault, and marks the Obsidian export as an
  explicit "optional" subsection, not a step in the standard refresh instructions.
- `graphify-out/obsidian/` does not exist after a plain `graphify . --update` — only after
  someone explicitly runs `graphify export obsidian`. A session that never asks for the
  Obsidian view never generates it.

## Alternatives considered

- **Keep graphify's export nested in `obsidian/Knowledge/`** (the original design) —
  rejected per direct correction: two genuinely independent tools were made to look like
  one depended on the other's directory structure, which they don't.
- **Relocate the export but keep generating it by default** (the first fix attempt) —
  rejected per a second, sharper correction: moving the folder fixed the path coupling but
  left the deeper issue — graphify's data was still routinely re-represented in another
  tool's format as standard practice. Decoupling two tools means neither one's default
  behavior is shaped by the other, not just that their files live in different folders.
- **Drop the `--obsidian` export entirely, rely only on `graphify query`/`graph.html`** —
  rejected; the Obsidian-flavored export has real value (wiki-linked browsing of the
  codebase graph) for anyone who wants it. Making it strictly opt-in gets that value without
  making it the default lens through which graphify's output is produced.
