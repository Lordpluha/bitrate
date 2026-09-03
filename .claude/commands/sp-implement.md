---
description: Drive one task end to end with a human in the loop — the single-task counterpart of /sp-auto. Same stages (understand, branch, implement via sp-worker, verify, changeset, PR), but one task at a time, in the current checkout, asking instead of blocking. Only uses a git worktree when the current checkout genuinely cannot be used. Confirms before every push or PR action.
argument-hint: "<task description or issue number> [--issue NNN] [--worktree] [--session] [--plan] [--review]"
author: lordpluha
---

`/sp-implement` is `/sp-auto` for a single task with you present. Same pipeline, same
specialists, same verification discipline — three differences:

| | `/sp-implement` | `/sp-auto` |
|---|---|---|
| Concurrency | one task | up to `--limit` in parallel |
| Ambiguity | **ask you** (`/grill-me`, or a direct question) | block with `BLOCKED_REASON: clarification` |
| Checkout | the current one; a worktree only when needed | always a dedicated worktree |
| GitHub | confirms with you before every mutation | owns them unattended, gated by the board's `Todo` column |

If you find yourself running this repeatedly over a queue of well-specified issues, that is
what `/sp-auto` is for.

## Stage 1 — Understand the task

If given `--issue NNN` or a bare number, read it first — acceptance criteria usually live in
the body and comments, not the title:

```bash
gh issue view NNN --json number,title,body,labels,comments,url
```

`gh` missing or unauthenticated is not fatal here (unlike `/sp-auto`) — say so and continue
from the description the user gave.

**Is it clear enough to build?** You must be able to state, in one sentence each, what
observable condition means done and what is out of scope. If you cannot, ask now rather than
after implementing:

- complex or large, still fuzzy → **`/grill-me`**, which walks the decision tree branch by
  branch until nothing material is unresolved;
- one narrow fork with two reasonable readings → a single direct question;
- already unambiguous → skip both and move on. Grilling a clear task wastes your time.

**Too big for one task?** More than a handful of stages, or work whose shape is still fogged
after grilling, belongs on a map: recommend `/wayfinder`, or `/sp-create-task --epic` to
split it into real issues first. Do not start an unbounded effort here.

## Stage 2 — Branch

Work on a branch, never directly on `develop`. If the current branch is already the task's
branch, stay on it.

```bash
git rev-parse --abbrev-ref HEAD     # already on the task branch? stay
git switch -c <type>/<issue>-<slug> # otherwise create it, per commit-style.md
```

`<type>` ∈ `feat|fix|docs|chore|refactor|test|hotfix`, matched to the task.

**Uncommitted changes in the checkout are the user's — never discard them.** If they block
the branch switch, say so and let the user decide. Do not `stash`, `reset`, or `restore` on
their behalf.

### When to use a worktree (`--worktree`)

Default is **no worktree** — the current checkout, no `pnpm install`, no duplicated tree.
Use one only when the current checkout genuinely cannot be used:

- the user passed `--worktree`;
- the working tree has uncommitted changes the user wants to keep on the current branch;
- the task must be built and run side by side with the current branch.

```bash
.claude/scripts/auto/sp-worktree.sh claim NNN <type> "<title>"   # needs an issue number
```

Remember to `release` it when the work lands.

## Stage 3 — Implement

**Default: dispatch `sp-worker`** (Agent tool, `subagent_type: "sp-worker"`), the
orchestrator. It plans the task, delegates each stage to the specialist that owns that
surface, and re-verifies their claims rather than trusting the reports. Do **not** pass
`WORKTREE` unless Stage 2 actually created one — its presence is what puts `sp-worker` into
unattended mode, where it stops asking questions.

Go straight to a single specialist instead when the task is unambiguously one stage — that
skips a layer of orchestration for no loss:

| Situation | Route |
|---|---|
| `--plan` passed, or non-trivial and you want the plan first | `sp-planner`, surface its plan, wait |
| A bug fix with an unknown root cause | `sp-debugger` |
| Feature/change in `apps/web-player`, `apps/web-artists`, `packages/ui-react` | `sp-frontend-developer` |
| Feature/change in `apps/api` | `sp-backend-developer` |
| Feature/change in `apps/mobile` / `apps/desktop` | the matching `sp-*-developer` |
| `.github/workflows`, `.github/actions`, `infra/`, `turbo.json`, `lefthook.yml`, release | `sp-devops` |
| Write or run one focused spec, nothing else | `sp-tester` |
| Spans API + a UI | `sp-backend-developer` first, then the UI agent, so the UI types against the regenerated contract |
| `--session` passed, or the user asked to skip the agent | do it yourself — see below |

## Stage 4 — Verify (yours to do, whatever the report said)

A specialist's report is a claim. Re-run the checks:

```bash
pnpm --filter @bitrate/<workspace> lint
pnpm --filter @bitrate/<workspace> check-types
pnpm knip                 # when files, exports, or dependencies changed
git diff --stat           # does the diff match the task, and nothing else?
```

Re-run the exact test command that was reported and read the output. A `TESTS:` line naming
a command is not a passing test. A bug fix needs a spec that fails before the fix and passes
after.

`--review`, or a diff over 100 lines / 5 files → dispatch `sp-reviewer` and treat findings as
work, routed back to the owning agent, then verify again.

**Changeset**: if any workspace's behaviour changed, `.changeset/<slug>.md` must exist and
list every touched workspace — `.claude/rules/commit-style.md` § "Changesets". Not needed for
pure docs/rules/test-only/chore diffs.

Never report PASS with a red mechanical pass.

## Stage 5 — Land it

**Confirm before every GitHub or remote action, every time** — a prior yes in this
conversation does not carry to the next action.

```bash
git push -u origin <branch>
.claude/scripts/auto/sp-pr.sh create <branch> "<type>(<scope>): <summary>" <body-file>
```

Write the PR body to `.sp-scratch/pr-<issue>.md` (gitignored, inside the repo). It must be
inside the repo, not `/tmp`: when `sp-pr.sh verify` reports `GH_TRANSPORT=flatpak-host`,
`gh` is running on the host and cannot read the sandbox's `/tmp`.

PR body:

```markdown
## Summary
- <what changed and why — why matters more than what>

## Test plan
- [ ] pnpm --filter @bitrate/<workspace> check-types
- [ ] <the spec that actually ran>

Closes #NNN
```

**Open questions go directly under `## Summary`**, never after the test plan. Anything a
reviewer must decide or know before merging goes first.

If the lefthook `pre-push` hook fails for an environmental reason, `LEFTHOOK=0 git push` is
the fallback — and then say so explicitly: the build is unverified and CI is the gate. Never
create an `.env` to make a hook pass, never `--force`, never push `develop`.

Release the worktree if Stage 2 created one: `.claude/scripts/auto/sp-worktree.sh release NNN`.

## In-session implementation (`--session` only)

- Read `CLAUDE.md`'s **Rule Index** first — exhaustive and cheap — mark every row whose scope
  matches, then read `project-conventions` plus only those rows' files in full. Do not read
  unrelated rows and do not skip the sweep.
- Use any skill that fits (`fsd`, `nestjs`, `react-query`, `zustand`, `tailwindcss`,
  `shadcn`, `prisma-client-api`, `graphify`, …) — not a fixed list. Do not read
  `.claude/templates/` or `.claude/skills/` up front, only when a matched rule points there.
- Stages 4 and 5 above still apply in full. `--session` skips the dispatch, not the
  verification.

## Report

```text
## /sp-implement: <task>

### Needs your attention
- <open question, trade-off, or improvised convention — or "nothing">

### What changed
- `<path>` — <what and why>

### Verified (re-run by me)
- lint / check-types / knip: <result>
- tests: <exact command> — <result> | none — <why>
- review: <sp-reviewer verdict, or "below threshold">

### Branch / PR
branch: <name>   worktree: <path or "none">   PR: <url or "not opened — awaiting confirmation">

/sp-implement: PASS | PARTIAL | BLOCKED
```
