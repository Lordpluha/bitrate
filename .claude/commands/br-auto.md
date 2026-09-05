---
description: Poll the Projects board's Todo column and drive each issue end to end — branch, implement, commit, push, PR, board move, issue comment — across parallel workers. Resumes anything a previous run left half-finished and picks up issues a reviewer sent back for rework.
argument-hint: "[--limit N] [--issue NNN] [--dry-run] [--recover-only]"
author: lordpluha
---

You are the dispatcher for an unattended issue pipeline. You own every outward-facing
action — board transitions, issue comments, pull requests. Workers only write code and push.

Two properties matter more than throughput, because this runs without supervision:

- **Resumable.** A run can die at any point — session closed, crash, machine asleep. Never
  trust a stored journal; re-derive what stage each issue reached from git and GitHub, which
  are the only sources that cannot lie.
- **Idempotent.** Every stage below is safe to re-enter. Re-running the command must never
  double-post an issue comment, open a second PR, or restart finished work.
- **Honest on the board.** An issue's board status must match what is actually happening to
  it at that moment, not what happened last time you thought about it. Move it the moment the
  real state changes — into `In Progress` before a worker starts editing, out of it as soon
  as the work lands or stalls. Colleagues plan around this board; an issue parked in the
  wrong column is worse than one nobody touched, because it reads as information. This
  applies to every path below, including the ones that end in `BLOCKED`.

## Configuration

Edit this block to retune the pipeline; nothing else hardcodes these values.

| Setting | Value |
|---|---|
| Gate | the board column — an issue is eligible only from `Todo`, and only when assigned to the running user. No label is required |
| Repository | `Lordpluha/bitrate` |
| Projects board | number `6`, owner `Lordpluha` (user project) — https://github.com/users/Lordpluha/projects/6 |
| Status column | the board's `Status` single-select field |
| Parallel workers | 3 (override with `--limit N`) |
| Base branch | `develop` |
| Scripts | `.claude/scripts/auto/br-worktree.sh`, `.claude/scripts/auto/br-pr.sh` |

Candidate query — one query covers intake and rework:

```bash
gh issue list --state open --assignee @me \
  --json number,title,body,labels,projectItems,url --limit 100
```

**The board column is the gate, not a label.** An issue is only ever picked up from `Todo`
(plus the recovery and rework columns below). This is deliberately a wider net than a
dedicated opt-in label, so two safeguards carry the weight a label would have carried:

- **Stage 3 refuses vague issues.** No acceptance criteria means `BLOCKED_REASON:
  clarification`, not a guess. That check is what keeps a broad candidate set safe.
- **`--limit` bounds the blast radius** (default 3), and `--dry-run` shows the full plan and
  classification without touching anything. Run `--dry-run` first on any board you have not
  run this against before.

Moving a card out of `Todo` is therefore how a human keeps an issue away from this pipeline.

Board state lives on the GitHub Projects card, not the issue itself. Read it with
`gh project item-list 6 --owner Lordpluha --format json` and match by issue number. Board
writes go through `gh project item-edit`.

**Confirm the column names before using them.** As of the last check, board 6's `Status`
options are, in workflow order:

```
Backlog → Todo → In progress → Code review → Ready for testing → In testing
        → Ready for merge → Ready for release → Released
        (plus Reopened, the kick-back column, and Blocked, where this pipeline parks work)
```

They are project configuration, not fixed strings, so re-read them rather than trusting this
list if a move fails:

```bash
gh project field-list 6 --owner Lordpluha --format json
```

Two things to note about this board, because they shape every rule below:

- **`Blocked` must exist on the board** for the blocked path below to work. If
  `field-list` does not show it, report that and leave blocked issues in place with a
  comment rather than inventing a column or parking them somewhere misleading.
- **`Blocked` is where stopped work is parked.** Moving the card out of `Todo` is what stops
  the next run re-claiming it and re-blocking it forever. A human moves it back to `Todo`
  once they have answered.
- **`Reopened` is the rework signal** — the same role "Code review failed" plays in a Jira
  workflow. An issue there has been kicked back by a reviewer. Both need the `project` OAuth scope
— `br-pr.sh verify` reports whether it is granted, and a missing scope stops the run
(see Stage 1); it is a one-time `gh auth refresh -s read:project,project` by the user, not
something this command can grant itself.

## Flags

| Flag | Effect |
|---|---|
| `--limit N` | Max concurrent workers (default 3) |
| `--issue NNN` | Process exactly this issue, skipping the poll and the `Todo`-column gate |
| `--dry-run` | Print the plan and classification table, change nothing anywhere |
| `--recover-only` | Run stage 2 only; do not take on new issues |

## Stage 1 — preflight

Stop the whole run if any of these fail; a half-configured pipeline must not touch GitHub.

```bash
.claude/scripts/auto/br-pr.sh verify          # gh installed, authenticated, scopes
.claude/scripts/auto/br-worktree.sh scan      # what is already in flight
git fetch origin develop
```

`verify` failing on `gh CLI is not reachable` or `gh is not authenticated` is a hard stop —
report it to the user with the fix and run nothing else.

`verify` also prints `GH_TRANSPORT`. When it says `flatpak-host`, this session is running
inside the VS Code Flatpak sandbox and `gh` is being reached on the host via
`flatpak-spawn`. That works, with one constraint that will otherwise bite you: **host `gh`
cannot see sandbox `/tmp`**. Every PR body or comment file must be written under
`.br-scratch/` in the repo (gitignored), which the host can see. `br-pr.sh` refuses a body
file outside the repo rather than letting `gh` fail with a confusing "no such file". `PROJECT_SCOPE=no` is also a hard
stop for board moves: either the user grants the scope, or they explicitly accept a run that
leaves cards unmoved (say so in every report line).

`scan` tags each issue with `lock`, `worktree`, and/or `branch`. **Only `lock` or `worktree`
means this pipeline has work in flight.** An issue tagged `branch` alone is an old branch
from manual work — never adopt it as an interrupted run.

## Stage 2 — recovery, before anything new

Run the candidate query, then for every issue that is either tagged `lock`/`worktree` by
`scan` or sits in a dev-owned board column (`In progress`, `Reopened`), collect ground truth:

```bash
.claude/scripts/auto/br-worktree.sh state NNN   # LOCK/WORKTREE/BRANCH/REMOTE/DIRTY/COMMITS/UNPUSHED
.claude/scripts/auto/br-pr.sh state <branch>    # PR_STATE/PR_URL/PR_REVIEW/PR_MERGEABLE/PR_CHECKS
```

Classify each issue, then resume from the first incomplete step. Every row is reachable
after a crash at that exact point:

| `Status` column | Ground truth | Class | Resume action |
|---|---|---|---|
| `Backlog` / `Todo` | no branch, no PR | `NEW` | Stage 3 intake |
| `Backlog` / `Todo` | branch or PR exists | `REWORK` | reviewer kicked it all the way back |
| `Reopened` | any | `REWORK` | explicit kick-back — feedback is on the PR |
| `In progress` | lock, no branch | `RESUME_CLAIM` | worktree died before any work — re-claim and dispatch |
| `In progress` | no lock, no branch | `AMBIGUOUS` | **do not touch** — see below |
| `In progress` | branch, `COMMITS=0` | `RESUME_IMPL` | dispatch worker; it continues in place |
| `In progress` | `UNPUSHED>0` | `RESUME_PUSH` | dispatch worker to finish the mechanical pass and push |
| `In progress` | pushed, `PR_STATE=none` | `RESUME_PR` | stage 5 from the PR step |
| `In progress` | pushed, PR open, never reached review | `RESUME_REVIEW` | stage 5 from the board-move step |
| `In progress` | pushed, PR open, `PR_REVIEW=CHANGES_REQUESTED` | `REWORK` | stage 4 |
| `Code review` | PR open, no changes requested | `IN_REVIEW` | leave it — a human owns it now |
| `Ready for testing` / `In testing` / `Ready for merge` | any | `IN_QA` | leave it — a human owns it |
| `Ready for release` / `Released` | any | `DONE` | release the worktree if one is left over |
| `Blocked` | any | `PARKED` | leave it; a human must answer and move it back to `Todo` |

`AMBIGUOUS` is the one case you must not resolve on your own. An issue sitting in
`In progress` with no lock and no branch has two indistinguishable causes: a previous run
died in the gap between the board move and `claim`, **or a human started the issue by hand**
— nothing stops an issue's owner from working on it themselves. Adopting it would mean two
agents editing one issue. Report it, name both possibilities, and let the
user say which; `--issue NNN` is how they hand it back to the pipeline.

To tell `RESUME_REVIEW` from `REWORK`, read the PR's review state
(`br-pr.sh state` → `PR_REVIEW`) and its threads (`br-pr.sh notes`). No reviews and no
unresolved threads → the previous run died before moving the card. `CHANGES_REQUESTED` or
unresolved threads → a reviewer returned it.

Clear orphan locks: a lock with no worktree, no branch, and a board column outside
`In progress` is debris from a crashed claim. Release it with `br-worktree.sh release` and
report it.

## Stage 3 — intake

Fill the remaining worker slots (`--limit` minus everything already in flight) from `NEW`
issues, oldest first. Before claiming each one:

- Take only issues whose card is in `Todo`. Anything in `Backlog` is not next up; anything
  in `Blocked` was parked by a human or a previous run.
- Skip issues with an empty body — a stub is not an implementable change. Report it.
- Skip an issue with no acceptance criteria **and** a one-line title; that is a
  `clarification` block, not work. With no gate label this check is doing real safety work,
  so apply it strictly rather than charitably.
- Skip anything whose body has no acceptance criteria **and** whose title is a one-liner;
  that is a `clarification` block, not work.

Then, per issue, in this order:

1. `gh issue view NNN --json number,title,body,labels,comments,url` for the full description
   and comments — acceptance criteria usually live there, not in the title.
2. Move the board card to `In progress`. **Move before creating the worktree**: the column
   change is what removes the issue from every other run's candidate set, so it is the real
   claim.
3. Pick the Conventional Commits branch type from the issue's labels — this repo's real
   type labels are `bug` → `fix`, `feature` → `feat`, `docs` → `docs`, otherwise `chore`.
   (Scope labels `api`, `web-player`, `web-artists`, `mobile`, `desktop`, `ui`,
   `infra`, `general` tell you which specialist will own it.) Then:

   ```bash
   .claude/scripts/auto/br-worktree.sh claim NNN <type> "<title>"
   ```

   → gives `WORKTREE` and `BRANCH`. If `claim` fails because the lock exists, another run
   has it — skip.

## Stage 4 — rework

An issue a reviewer sent back. The reviewer's comments are the new specification, and they
usually live on the PR rather than the issue, so gather both:

```bash
.claude/scripts/auto/br-pr.sh notes <branch>       # unresolved review threads first
.claude/scripts/auto/br-worktree.sh adopt NNN      # re-attach a worktree to the branch
gh issue view NNN --json comments
```

Move the card to `In progress` **before** dispatching the worker, so the board never shows
an issue as waiting on review while an agent is editing its code. From `Code review` or
`Reopened` this is a single move; do not leave it sitting in `Reopened` while work is
underway.

Then dispatch a worker in `rework` mode with the collected feedback. If there is no feedback
anywhere, do not guess — post an issue comment asking what needs changing and leave it alone.

## Stage 5 — dispatch and completion

Spawn one `br-worker` per issue via the Agent tool, **all in one message** so they run
concurrently, `run_in_background: true`. Pass `MODE`, `ISSUE`, `TITLE`, `BODY`, `WORKTREE`,
`BRANCH`, and `FEEDBACK` in rework mode.

`br-worker` is an orchestrator, not a single-stage implementer: it plans the issue, delegates
each stage to the specialist that owns that surface, and re-verifies their claims before
reporting. Passing `WORKTREE` is what puts it in `unattended` mode, where it never asks a
question and blocks instead — so an issue that turns out to be ambiguous comes back as
`BLOCKED_REASON: clarification` rather than stalling. Your job is unchanged: you own every
GitHub action, it owns the code.

Do not use the Agent tool's `isolation: worktree` — the worktree is already prepared off a
freshly fetched `origin/develop`, while `isolation` would branch from the session's current
dirty HEAD.

Handle each worker as its report arrives, not after all of them finish.

### On `STATUS: DONE`

1. **Verify before believing.** Confirm the branch is really on the remote:
   `br-worktree.sh state NNN` → `REMOTE=yes`, `UNPUSHED=0`. If not, the worker's report is
   wrong — treat it as a failure.
2. **PR** — skip if `br-pr.sh state <branch>` already reports an open PR (a re-run must not
   open a second one). Write the body to a scratch file, then:

   ```bash
   .claude/scripts/auto/br-pr.sh create <branch> "<type>(<scope>): <summary>" <body-file>
   ```

   Title follows `.claude/rules/commit-style.md`. Body:

   ```markdown
   ## Summary
   - <what changed and why — why matters more than what>

   ## Test plan
   - [ ] pnpm --filter @bitrate/<workspace> check-types
   - [ ] <the spec the worker actually ran>
   - [ ] <manual check of the affected UI, when applicable>

   Closes #NNN
   ```

   In rework mode, use `br-pr.sh update` instead, append a `## Rework` section listing each
   feedback item and how it was addressed, and post it as a PR comment too
   (`br-pr.sh comment`) so the reviewer sees it in the thread.
3. **Board** → move the card to `Code review`.
4. **Issue comment** — check existing comments first and skip if one already covers this
   PR URL:

   ```markdown
   Automated implementation — PR: <url>

   **What changed**
   <the worker's SUMMARY, in plain language>

   **Files**
   - `<path>` — <what changed>

   **Checks**
   - lint / check-types: <result>
   - tests: <command> — <result>

   Branch `<branch>`. Raised by /br-auto; needs human review before merge.
   ```
5. `br-worktree.sh release NNN` — drops the worktree, keeps the branch.

**Caveats go at the top, never at the bottom.** The worker's `CAVEATS` block always contains
at least a build line. Anything beyond that — a trade-off, a reversed earlier decision, a
reason the change may not achieve the issue's goal — goes in its own section immediately
after the PR's `## Summary`, under a heading that asks the reviewer a direct question, and is
repeated in the issue comment. A caveat placed after the test plan is a caveat nobody reads.

Do not paraphrase a caveat into something milder than the worker wrote, and do not report the
issue to the user as a clean success when one is present — say what the open question is.

### On `STATUS: BLOCKED`

Never leave a blocked issue silently sitting in `In Progress`.

Parking an issue is **move the card to `Blocked` + comment**, both every time: the column
move is what stops the next run re-claiming it and stops it reading as work in flight, and
the comment is what tells a human what to do. Moving it back to `Todo` is the human's signal
that it is ready again.

| `BLOCKED_REASON` | Issue comment |
|---|---|
| `intent` | both options spelled out — what the issue's literal remedy does, what its goal actually needs, and the worker's recommendation. Tag the author; this is a product decision, not a technical one |
| `clarification`, `scope` | the worker's specific question |
| `blocked` | the missing dependency |
| `technical`, `conflict` | the failure with its output |

Push any partial work first if the worker committed something, so the next run resumes.
Then `br-worktree.sh release` (keep the branch — it holds real work). Only use `abandon`
when there are no commits at all.

### On worker crash or no report

Change nothing on GitHub. Leave the lock and worktree in place — stage 2 of the next run
reconstructs the state and resumes. Report it as `INTERRUPTED`.

## Report

One row per issue, then a verdict line:

```text
#312  NEW       → DONE      PR #340  Code review   4 files, 1 spec passed
#298  REWORK    → DONE      PR #331  Code review   3 feedback items addressed
#305  NEW       → BLOCKED   Blocked — no acceptance criteria
#287  RESUME_PR → DONE      PR #341  Code review   recovered from interrupted run

/br-auto: 3 done, 1 blocked, 0 interrupted — 2 slots free
```

Relay what each worker found; its report is not shown to the user. Name every issue you
skipped and why — a silently dropped issue is indistinguishable from one that was never
there.

## Continuous mode

Polling only runs while the session is open:

```text
/loop 15m /br-auto
```

Each firing runs the full command, so an interrupted previous cycle is recovered by stage 2
before any new issue is taken on. Because the gate is the `Todo` column rather than an opt-in
label, be deliberate about leaving this looping: anything a human drops into `Todo` becomes
eligible on the next firing.
