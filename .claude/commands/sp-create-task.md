---
description: Read the whole GitHub Projects board and repository context, then draft a detailed, correctly-scoped issue — or restructure an existing one — that fits the work already on the board instead of duplicating or contradicting it. Never creates or edits a GitHub issue without explicit confirmation.
argument-hint: "\"<idea or issue number>\" [--update NNN] [--epic] [--dry-run]"
author: lordpluha
---

You turn a loose idea into a task that fits the board. The value here is **not** filling in a
template — it is knowing what is already planned, what has already been decided, and what the
codebase actually looks like, so the task you write is the next real piece of work rather
than a duplicate, a contradiction, or a restatement of something already closed.

Writing the issue is the last step, not the first.

## Hard rule — confirm before every GitHub mutation

You may read GitHub freely. You may **not** create an issue, edit an issue, add a label, move
a card, or comment without showing the exact payload and getting an explicit yes for that
specific action. A prior approval never carries to a later mutation in the same conversation.
`--dry-run` skips the confirmation step by never offering the mutation at all.

## Preflight

```bash
.claude/scripts/auto/sp-pr.sh verify    # resolves gh, reports transport + scopes
```

`gh` is required. Note that `command -v gh` failing does **not** mean it is missing: under
the VS Code Flatpak sandbox `gh` lives on the host and is reached with
`flatpak-spawn --host gh …`. `sp-pr.sh verify` resolves this for you and prints
`GH_TRANSPORT`; use the same transport it reports for the queries below. If it is missing or unauthenticated, stop and tell the user how to fix it —
do not fall back to guessing the board's contents from files in the repo, which are not a
mirror of it (see [ADR-0016](../../apps/docs/docs/architecture/0016-live-github-queries.md)).

Board access additionally needs the `read:project` scope
(`gh auth refresh -s read:project,project`). Without it you can still read issues; say
explicitly in your output that board columns were unavailable, rather than silently omitting
them.

## Step 1 — Load the board and the repo's shape

Do all of this before forming any opinion about the task:

```bash
# Every open issue, with labels and body — this is the duplicate-detection corpus
gh issue list --state open --limit 200 --json number,title,labels,assignees,url,body

# Recently closed work — what was already done, and what was rejected and why
gh issue list --state closed --limit 60 --json number,title,labels,closedAt,url

# The board itself: its status field's options, and what sits in each column
# Project 6, owner Lordpluha — https://github.com/users/Lordpluha/projects/6
gh project field-list 6 --owner Lordpluha --format json
gh project item-list 6 --owner Lordpluha --format json --limit 200

# Open PRs — work in flight that a new task could collide with
gh pr list --state open --json number,title,headRefName,url
```

Then orient in the code the idea touches. Prefer one `graphify query "<question>"` over
grepping many files; fall back to narrow `rg` under the specific app.

Finally, read the decisions that constrain the idea:

```bash
ls apps/docs/docs/architecture/*.md
```

An ADR that already settled this question changes the task — either the task is unnecessary,
or it is a proposal to supersede that ADR, which is a much bigger thing and must say so.

## Step 2 — Classify against what exists

Before drafting, place the idea in exactly one of these. This is the step that makes the
command worth running:

| Finding | What you do |
|---|---|
| **Duplicate** — an open issue already covers it | Do not draft. Report the issue and ask whether to add detail to it instead |
| **Already done** — a closed issue or merged PR covers it | Do not draft. Report it with the link; ask whether something regressed |
| **Already decided against** — an ADR or a closed-as-not-planned issue rules it out | Do not draft. Report the decision and what superseding it would take |
| **Blocked by unplanned work** — it needs something nobody has ticketed | Draft **the prerequisite** too, and state the dependency in both |
| **Too big for one task** — spans apps or many sessions | Propose an epic + child tasks (see `--epic`), or hand off to `/wayfinder` for a decision map |
| **Fits cleanly** | Draft it |

Never skip straight to drafting because the idea sounds new. Search the corpus by keyword
**and** by the code area it touches — duplicates usually have different wording.

## Step 3 — Scope it to one session

A good task is one an `sp-worker` or a developer can finish in one sitting, with an
unambiguous done condition. If the draft has more than one "and then", split it.

Detect the scope from the code the idea touches, and pick the matching issue template — the
repo has one per surface and the template's `labels:` are the board's real taxonomy:

| Scope | Template |
|---|---|
| `apps/web-player`, `apps/web-artists` | `web-feature.md` / `web-bug-report.md` |
| `apps/api` | `api-feature.md` / `api-bug-report.md` |
| `apps/mobile` | `mobile-feature.md` / `mobile-bug-report.md` |
| `apps/desktop` | `desktop-feature.md` / `desktop-bug-report.md` |
| UI/UX, design, a11y | `ui-ux.md` |
| CI/CD, workflows | `cicd.md` |
| `infra/`, Docker, deployment | `infrastructure-feature.md` |
| performance | `performance-improvement.md` |
| `apps/docs`, README, rules | `documentation.md` |
| vulnerability | `security.md` — **stop and read it**; a public issue may be the wrong channel |

Read the chosen template and follow its actual section headings and `title:` prefix. Do not
invent your own structure.

## Step 4 — Draft

The draft must be specific enough that a worker does not have to re-derive your research:

- **Problem / motivation** — the user-visible problem, not the implementation.
- **Acceptance criteria** — a checklist of observable conditions. This is the field that
  decides whether `/sp-auto` can take the task or must block it as `clarification`. Vague
  criteria are the single most common reason automated work fails.
- **Affected code** — the actual files/slices/modules you found, as paths.
- **Constraints** — the ADRs and rules that bind the implementation, linked.
- **Out of scope** — what this task deliberately does not do, so it does not grow.
- **Dependencies** — `Blocked by #N` / `Blocks #N` for anything you found in Step 2.

Propose labels from this repo's **actual** taxonomy — do not invent one. Type: `bug`,
`feature`, `docs`. Scope: `api`, `web-player`, `web-artists`, `mobile`, `desktop`, `admin`,
`ui`, `infra`, `general`. (`dependencies`, `javascript`, `rust` are applied to PRs by
automation, not to new issues.) Verify against `gh label list` before using anything else;
a label that does not exist makes `gh issue create` fail.

New cards land in `Todo` (or `Backlog` for work that is real but not next). The board's
`Status` options in workflow order are `Backlog → Todo → In progress → Code review →
Ready for testing → In testing → Ready for merge → Ready for release → Released`, plus
`Reopened` for
kick-backs, and `Blocked`, where `/sp-auto` parks work it cannot finish. A task whose card
sits in `Todo` is eligible for the unattended `/sp-auto` pipeline, so its
acceptance criteria are what decide whether that pipeline can act or must block. Put work
that is real but not next into `Backlog` instead.

## Step 5 — Show, confirm, then act

Print the full draft — title, body, labels, target column, dependencies — and the
classification from Step 2 that justifies it. Then ask.

On confirmation:

```bash
gh issue create --title "<title>" --body-file <file> --label "<labels>"
gh project item-add 6 --owner Lordpluha --url <issue-url>   # then set its column
```

With `--update NNN`, `gh issue edit NNN --body-file <file>` instead, and show a diff of what
changes rather than only the new body — the user needs to see what they are losing.

With `--epic`, create the parent first, then each child with `Part of #<parent>`, confirming
the whole set once rather than one prompt per child.

## Flags

| Flag | Effect |
|---|---|
| `--update NNN` | Restructure an existing issue instead of creating one |
| `--epic` | Propose a parent issue plus child tasks |
| `--dry-run` | Research and draft only; never offer to mutate GitHub |

## Report

```text
## /sp-create-task: <idea>

### Board context
Open issues scanned:   <n>    Closed scanned: <n>    Open PRs: <n>
Related existing work:
  - #<n> <title> — <how it relates>

### Classification
<duplicate | already done | decided against | blocked by unplanned work | too big | fits cleanly>
<one line of justification, with the link that proves it>

### Draft
<full title, labels, column, body>

### Dependencies
Blocked by: #<n>   Blocks: #<n>   (or "none")

Awaiting confirmation before creating anything on GitHub.
```

When the classification is not "fits cleanly", the draft section is replaced by the
recommendation and no issue is offered. Reporting "this already exists as #214" is a
successful run of this command, not a failure.

## Related

- `/sp-implement` — implements a task once it exists.
- `/sp-auto` — takes tasks from the board's `Todo` column end to end, unattended.
- `/grill-me` — when the idea itself is not yet clear enough to task; interview first,
  then come back here.
- `/wayfinder` — when the effort is too big for one task set and needs a decision map on the
  tracker instead.
