---
description: Implement one task in-session, with bounded delegation when useful. Verify the changed scope and prepare a PR. Preserve user changes and confirm remote actions.
argument-hint: "<task description or issue number> [--issue NNN] [--worktree] [--session] [--plan] [--review]"
author: lordpluha
---

Execution policy: `.claude/references/execution-policy.md`. Large-task specifications:
`.claude/references/spec-workflow.md`. Reuse confirmed decisions and verification evidence;
do not make an extra agent chain to apply these workflows.


## 1. Understand and scope

Read the supplied issue with `gh issue view NNN --json number,title,body,comments,url` when
available; otherwise use the supplied task and report the missing issue context.
State the acceptance criteria and affected workspaces. Before a large task, follow
`.claude/references/large-task-planning.md`: invoke the underlying `grilling` skill used
by `/grill-me`, interview the user, present a plan and wait for confirmation before Stage 2.
This applies with `--session` and even to a detailed initial request. Reuse an existing
completed interview and approved plan for unchanged scope. Small tasks only need blocking
clarifications. `/wayfinder` remains user-invoked.
For `--plan`, produce the plan and stop before implementation; plan in-session unless a
separate specialist investigation has a concrete benefit.

## 2. Protect the checkout

Inspect branch and working-tree status. Stay on the task branch when appropriate; never
discard, stash, reset or restore user changes. Do not switch the developer's checkout to
another base while apps are running. Use a worktree when a different branch/base is needed,
the user passed `--worktree`, or parallel work must remain isolated. Never work on `develop`.
For tracked work use `.claude/scripts/auto/br-worktree.sh claim NNN <type> "<title>"`.
Read `.claude/references/worktree-safety.md` if choosing or recovering a worktree.

## 3. Implement

For logic/API/bugs, invoke `mattpocock-skills:tdd` before production edits. Reuse confirmed
public seams; implement one failing behavior test at a time. Cosmetics/docs are exempt.

Work in-session by default. Follow applicable `paths` rules already loaded; before creating
files in a new area, explicitly read its app rule and relevant shared conventions.
Do not read an exhaustive index or reload rules already in context. Load skills/templates
only when their specific workflow is needed.

Delegate a bounded task only when specialist depth, isolation or independent review is
useful. Explain its scope briefly. `--session` disables delegation. `br-worker` is for
explicit end-to-end orchestration, not the default route for this command.

| Separate task, when justified | Agent |
|---|---|
| Complex independent planning | `br-planner` |
| Difficult unknown root cause | `br-debugger` |
| Web-player, web-artists, ui-react, Svelte player | `br-frontend-developer` |
| API | `br-backend-developer` |
| Mobile / desktop | matching implementation agent |
| CI / infrastructure | `br-devops` |
| Independent focused test task | `br-tester` |
| Requested or materially risky independent review | `br-reviewer` |

Writing delegates use `isolation: "worktree"` unless the user explicitly asked for the
current checkout. Reuse a dedicated task worktree if already prepared. Give the delegate
the goal, paths, constraints and acceptance criteria. Inspect/integrate its result before
verification; a report alone does not mean the change reached the task branch.
For API + UI changes, establish the API contract before implementing its consumer.

## 4. Verify

Use `br-verify` for scoped checks and `br-review` for review/PR preparation.

Choose the smallest relevant tests and workspace gates. Read
`.claude/references/verification.md` before heavy checks or when a gate fails.
For docs-only edits validate structure, links and whitespace; do not launch app suites.
For code changes, typical gates are workspace lint, type-check and the affected tests;
Knip applies when files, exports or dependencies change. Broaden checks for shared changes.

Inspect exact commands, exit status and revision checked. Reuse valid delegate evidence for
unchanged code; rerun after changes, missing evidence or when independent reproduction is
needed. A bare PASS is not evidence. For bug fixes, verify the failing behavior is resolved.

Read matching sections of `.claude/references/architecture-checklist.md` before a PR.
Review routine changes in-session. `--review` requests `br-reviewer`; material security,
migration, concurrency or cross-system risk also justifies independent review. With
`--session`, review in-session and disclose the absence of independent review. Line/file
count alone is not a dispatch trigger. Fix findings and rerun affected checks.

Read `.claude/rules/commit-style.md` before changesets or commits. Add a changeset when
workspace behavior changes; pure documentation/rules/tests/chore changes do not need one.

## 5. Land the work

Confirm before each push or GitHub mutation under this command's existing policy; show
the concrete result for review. Do not force-push or push `develop`.
Use `.claude/scripts/auto/br-pr.sh` and the established `br-manager` ownership boundary.
Write PR bodies in `.br-scratch/`, not `/tmp`, when using the Flatpak host transport.
Put unresolved decisions before validation details and link the issue with `Closes #NNN`.

Try normal hooks first. If pre-push fails for an environmental reason, the existing
`LEFTHOOK=0 git push` fallback requires the same push authorization and an explicit report
of what was not verified. Never create a real `.env` to make checks pass.
Release only the task worktree, after its work has landed and no changes would be lost.

## Report

Report what changed and why, remaining decisions, exact validation results and limitations,
branch/worktree/PR status, and `/br-implement: PASS | PARTIAL | BLOCKED`.
