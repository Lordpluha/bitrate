---
name: knowledge-base
description: How this repo's codebase-navigation tool (graphify) works, and how GitHub ticket/board state is queried live rather than mirrored to files. Use before deep exploration of an unfamiliar area, whenever graphify-out/ exists, or when working with /br-create-task, /br-implement, or /br-auto.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Knowledge base — graphify + live GitHub state

This repo has no working-notes vault — durable decisions go straight into ADRs under
`apps/docs/docs/architecture/`, and everything else (ticket/board state, codebase
structure) is queried live rather than mirrored into a local store. See
[ADR-0017](../../apps/docs/docs/architecture/0017-remove-obsidian-vault.md) for why the
project's `obsidian/` working-notes vault was removed.

## graphify — codebase query and map

Installed automatically by `scripts/setup-graphify.mjs`, wired into the root `postinstall`
script — running `pnpm i` installs it via `uv` (preferred) or `pip` if not already on
`PATH`. No-op in CI (`CI` env var); skip locally with `SKIP_GRAPHIFY_INSTALL=1 pnpm i`.
Never fails the install — prints a one-line message and exits 0 if neither `uv` nor `pip`
is available.

**Before broad exploration** of an unfamiliar area of the codebase, prefer a graphify query
over ad hoc grepping across many files:

```bash
graphify query "<question>"
```

This is the same trigger already defined by the `graphify` skill — invoke it directly
rather than re-deriving the same context by reading files one at a time.

**After a non-trivial change** (new module, cross-cutting refactor, new package), refresh
the graph:

```bash
graphify update .
```

`update` re-extracts only new/changed files — it does not rebuild the whole graph. This
regenerates `graph.json` and `GRAPH_REPORT.md` — graphify's own native formats. **This is
the default and only workflow** — `graphify query` and `GRAPH_REPORT.md` are how Claude and
developers actually consume graphify in this repo. Output lives entirely in `graphify-out/`,
gitignored, local-only, fully regenerable from source in one command.

`graph.html` is **not** produced any more: this repo's graph is past graphify's 5000-node
visualization limit (currently ~15.4k nodes / ~30.4k edges), so `update` skips it and says
so. Raise `GRAPHIFY_VIZ_NODE_LIMIT` if you genuinely want the HTML view; don't treat its
absence as a broken run.

### Obsidian-flavored export — removed

graphify also supports exporting the graph as an Obsidian-compatible vault
(`graphify export obsidian`) — one markdown note per graph node, wiki-linked, plus a
`.canvas` visualization. This repo previously wired that up as an opt-in convenience
(`pnpm graphify:obsidian`, post-processed by `scripts/organize-knowledge.mjs` into
folders). Both were removed — see
[ADR-0019](../../apps/docs/docs/architecture/0019-remove-obsidian-export-convenience.md).
`graphify export obsidian` itself still exists as a graphify feature and can be run
directly if someone wants a one-off Obsidian view; this repo just no longer wires or
documents a convenience wrapper around it.

## GitHub ticket/board state — query live, don't mirror

Ticket and board state is queried directly from GitHub on demand — via an MCP GitHub
server if one is connected in the session, otherwise the `gh` CLI — never written to a
file. See [ADR-0016](../../apps/docs/docs/architecture/0016-live-github-queries.md) for
why: a file mirror is stale the moment anyone else touches the board, and GitHub is
already one `gh` call away, so persisting a copy added staleness risk without saving
anything real.

Useful lookups, run whenever the current state is needed (not cached anywhere):

```bash
gh issue view <number> --json number,title,body,state,labels,assignees,url,comments
gh project item-list 6 --owner Lordpluha --format json   # board: /users/Lordpluha/projects/6
gh pr list --search "linked:<number>" --json number,title,state,url
```

`gh` needs the `read:project` OAuth scope (`project` too for writes) — a one-time
per-developer `gh auth refresh -s read:project,project`, not something the agent layer can
grant itself.

Only `/br-create-task`, `/br-implement`, and `/br-auto` mutate GitHub state (issue
create/edit, board card moves, comments, PR create/edit), and only after explicit user
confirmation for each mutating action — a prior approval never carries over to a later
mutation in the same conversation. `/br-auto` is the one exception to per-action prompting:
starting it is the approval for the whole unattended cycle it describes. Its gate is the
board's `Todo` column rather than the agent's judgement, so what a human puts in `Todo` is
what the pipeline may take — bound the run with `--limit` and preview it with `--dry-run`.

| Command | What it does |
|---|---|
| `/br-create-task "<idea>"` | Reads the whole board + repo context, then drafts or restructures one issue that fits the work already planned. Confirms before every mutation. |
| `/br-implement "<task>"` | Checks out the branch, dispatches to a specialist by default, writes the code, then open/update the PR (confirm before pushing). |
| `/br-auto` | Unattended: claims issues from the board's `Todo` column into worktrees, runs `br-worker` on each, then owns the PR, board move, and issue comment. |
| `/br-sync-docs` | Dispatches discovery to `br-librarian`, finds/fixes drift across `.claude/`, `.changeset/`, `apps/docs/`, `PRODUCT.md`, and root onboarding docs. Read-mostly, confirms fixes. |

All four dispatch to an agent by default now — see
[ADR-0021](../../apps/docs/docs/architecture/0021-default-agent-dispatch.md).

## Durable decisions go to ADRs, not a notes vault

There is no informal decision-notes layer. A nontrivial root-cause analysis, design
choice, or rejected approach that future sessions would otherwise have to re-derive gets
written up as a real ADR using `apps/docs/docs/architecture/template.md` — or, if it's not
durable enough to justify one, it lives only in the PR description / commit body for that
change.

## Related rules and skills

- `graphify` skill (`~/.claude/skills/graphify/SKILL.md`) — the extraction/query pipeline
  this rule builds on.
- `apps/docs/docs/architecture/README.md` — the canonical ADR index; promote durable
  decisions there.
- `project-conventions` — repository-wide documentation ownership rules.
