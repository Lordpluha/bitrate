---
description: Find a ticket on the GitHub Projects board or a GitHub issue, confirm it with the user, move its board card, and check out a branch. Never mutates GitHub state without explicit confirmation. Self-contained — no separate agent file.
argument-hint: "[issue number or search]"
author: lordpluha
---

You connect a GitHub issue / GitHub Projects board card to local work: find it, confirm it
with the user, move it, and check out the branch. You do **not** write application code —
that is `/sp-implement`'s job.

## GitHub access — prefer MCP, fall back to `gh`

Check whether a GitHub MCP server is connected in this session (a tool name like
`mcp__github__*` or similar). If one is available, use it for issue/project reads and
mutations. Otherwise use the `gh` CLI directly, as below — it is the proven working path in
this repo.

## Step 0 — Prerequisites

`gh` must be authenticated with the `read:project` scope (`project` scope too if this run
needs to move a card). Check with:

```bash
gh auth status
gh project list --owner Lordpluha
```

If `gh project list` fails with a missing-scope error, stop and tell the user to run
`gh auth refresh -s read:project,project` themselves — this opens an interactive browser
OAuth flow you cannot complete on their behalf.

## Step 1 — Find the ticket

- If the user gave an issue number or URL, fetch it directly:
  `gh issue view <number> --json number,title,body,state,labels,assignees,url`.
- If the user gave a search term or nothing, list candidates from the board and open
  issues, then ask the user to pick one — do not guess:
  `gh project item-list <project-number> --owner Lordpluha --format json`
  `gh issue list --assignee @me --state open`

## Step 2 — Propose the move (confirm before any mutation)

State plainly what you are about to do and wait for a clear yes:

- Which board column/status the card will move to (e.g. "Todo" → "In Progress").
- The branch name you will create, following `.claude/rules/commit-style.md` branch
  naming (`feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `test/`, `hotfix/` + a short
  slug derived from the issue title).
- Whether you will leave a comment on the issue noting work has started.

Moving a Project card and commenting on an issue are both visible to the rest of the team —
never do either without the user's explicit go-ahead in this turn, even if a previous
`/sp-take-ticket` run was approved.

## Step 3 — Execute (only after confirmation)

```bash
# Move the card (requires the field id + target option id from `gh project field-list`)
gh project item-edit --project-id <id> --id <item-id> --field-id <field-id> --single-select-option-id <option-id>

# Create/checkout the branch
git checkout -b <type>/<slug>

# Optional: comment on the issue
gh issue comment <number> --body "Started work — branch <type>/<slug>"
```

Never push or open a PR here — that happens later, in `/sp-implement`.

## Step 4 — Hand off

Tell the user:
- The branch they are now on.
- That `/sp-implement` picks up the actual coding work, and that ticket state stays live
  (re-run `gh issue view <number>`/MCP whenever it's needed — nothing is mirrored to disk).

Report using a `sp-take-ticket: PASS / BLOCKED` verdict line — `BLOCKED` when the scope
isn't authenticated, no ticket was confirmed, or the user declined the move.
