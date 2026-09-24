# Worktree safety and incident history

## Every dispatched agent runs in a worktree by default

**Pass `isolation: "worktree"` when dispatching an agent that writes files, switches branches
or installs dependencies, unless the user explicitly asks for the current checkout.** Reuse
an already prepared dedicated task worktree rather than creating a nested worktree.
Read-only agents may share the checkout. A writing agent works on its own copy, and the
developer's branch, working tree, `node_modules` and running dev servers are untouchable by
it. The worktree is cleaned up automatically when the agent changed nothing.

This is not a precaution against a hypothetical. On 2026-09-22 an agent dispatched into the
primary checkout stashed the developer's state, checked out a new branch off `develop`, and
`apps/admin/` — 399 files that exist only on `feat/artists-tanstack-start` — disappeared from
disk while its dev server was running. The developer saw the admin panel break with no
explanation, since nothing in the agent's task mentioned the admin panel. `pnpm install` on
the other branch's lockfile then desynced `node_modules` for every workspace.

Three consequences worth holding onto:

- **This repo's long-lived feature branches carry whole apps `develop` does not have.** Check
  with `git ls-tree -r --name-only develop -- apps/<app> | wc -l` before assuming a path is on
  both. A branch switch here is not a cheap operation.
- **The blast radius is invisible from inside the agent's task.** An agent combining
  dependency PRs has no reason to think about the admin panel, so no prompt wording prevents
  this. Isolation does.
- **Read-only agents may share the checkout** — planning, review, search, `br-librarian`. The
  rule binds anything that branches, merges, rebases, installs dependencies, or writes files.

`/br-auto` already prepares a worktree per issue; this extends the same guarantee to every
agent dispatched outside it. When an agent genuinely must run in place, say so to the
developer and get confirmation first — never assume it.

## Mechanical checks and editor discovery

The Claude pre-tool guard requests **Allow once** for risky Git operations and branch
switches in the main checkout; bypass modes deny them. Submit each risky operation as
its own tool call. [Hook policy](hook-policy.md) documents coverage and limitations.
Project VS Code settings enable `git.detectWorktrees`; reload the window and inspect
Source Control Repositories. This does not create or prune worktrees.
