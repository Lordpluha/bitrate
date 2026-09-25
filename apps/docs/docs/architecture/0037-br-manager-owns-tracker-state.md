# ADR-0037: `br-manager` owns tracker state beside `br-worker`

Status: Accepted

Date: 2026-09-16

## Context

Until now the agent layer drew one hard line around GitHub: **commands mutate it, agents never
do.** `/br-create-task`, `/br-implement` and `/br-auto` created issues, opened PRs and moved board
cards, each after confirming the action with the developer; every agent under `.claude/agents/`
only read GitHub and handed its findings back to the command
([ADR-0012](./0012-ticket-driven-agent-commands.md),
[ADR-0021](./0021-default-agent-dispatch.md)).

That line kept mutations safe, but it left two gaps that showed up as soon as work started
happening outside a single command invocation.

- **Nothing asked whether a task had an issue.** Work that arrived as an ordinary request in
  conversation — which is most of it — was built, committed and pushed with no issue behind it.
  Nobody noticed until the board no longer described what had been built, the condition the
  2026-09-04 board triage spent a whole pass repairing.
- **Linking had no owner.** Opening a PR, linking it to its issue with the right keyword, and
  moving the card were each done by whichever command happened to run, or by hand, or not at all.
  `br-worker` owned a task's code end to end, but was barred from the one side of it the tracker
  can see.

## Decision

Add **`br-manager`**, a tracker coordinator that sits beside `br-worker` and owns the GitHub side
of a task, while `br-worker` keeps the code side.

- **It checks tracking before work starts.** `br-worker` dispatches it at the start of an
  interactive task. If the task has no issue, `br-manager` first searches the board for an existing
  match, then asks the developer whether the scope is right and whether to create an issue, link an
  existing one, or proceed without one. "Proceed without an issue" is a legitimate answer.
- **It creates issues through `/br-create-task`, never by hand**, so an issue is drafted from the
  whole board and the repository rather than written blind. For a large effort it dispatches
  `br-planner` first and feeds the plan to `/br-create-task --epic`.
- **It opens PRs and links them to their issues**, choosing `Closes` for work that resolves the
  issue and `Refs` for work that does not, and verifies GitHub actually registered the link.
- **It keeps cards true**, proposing a fix for each disagreement between issues, PRs and the board.

`br-manager` is therefore the **one agent allowed to mutate GitHub**. The safety property that the
command-only rule existed to guarantee is kept intact rather than traded away: **every mutation is
confirmed individually**, with the exact payload shown, and an approval never carries forward. What
moves is where the mutation runs, not whether a human approves it.

Three boundaries keep the exception narrow:

- **Interactive only.** Unattended there is nobody to confirm, and under `/br-auto` the dispatcher
  already owns every GitHub action; `br-manager` refuses to run in that mode.
- **It never pushes, commits, or edits application code.** A PR needs a pushed branch; pushing
  stays with `br-worker` or the developer.
- **It never judges code.** Whether the code is done is `br-worker`'s evidence to weigh.

## Consequences

- Every other agent keeps the old rule unchanged: it never mutates GitHub.
- An untracked task is caught at its start, when creating the issue costs one question, instead of
  after the board has drifted.
- The confirmation burden is the same as with the commands, and deliberately so. A developer who
  finds the prompts heavy should answer "proceed without an issue" for throwaway work, not ask for
  the confirmations to be batched.
- `br-manager` runs on the Opus tier at high effort alongside `br-worker`: its mutations are shared,
  outward-facing and awkward to reverse, so a missed edge case is expensive.
- The board is still queried live on every run and never mirrored to a file
  ([ADR-0016](./0016-live-github-queries.md)).
- `CLAUDE.md`, `.claude/README.md`, `.claude/CONTEXT.md` and `.claude/rules/knowledge-base.md` now
  name `br-manager` as the exception wherever they state the mutation rule.

## Alternatives considered

- **Give `br-worker` GitHub access directly.** It already owns the task end to end, so this looked
  like the smallest change. Rejected because it merges two jobs with different evidence: whether
  code is correct, and whether the tracker reflects it. It would also put outward-facing mutations
  inside the agent that runs unattended under `/br-auto`, where nobody can confirm them.
- **Keep all mutations in commands and add a tracking check to `/br-implement`.** Rejected because
  most work does not start through a command at all. A check that only fires when `/br-implement`
  is invoked misses exactly the untracked tasks it is meant to catch.
- **Batch confirmations per run.** Rejected: a single approval covering several mutations is how an
  issue gets closed that the developer did not mean to close. Per-action confirmation is the reason
  agents could be trusted with mutations at all.
