# Required planning for large tasks

This is the user's standing preference: before a large task, run the `grill-me` interview,
then present the plan and obtain confirmation before implementation. It applies to ordinary
conversation, slash commands and explicitly invoked agents, even when the initial request
looks detailed. `--session` changes delegation, not this planning requirement.

## Trigger and ownership

Treat work as large when it introduces a substantial feature, changes architecture or a
public contract across components, involves a migration, spans multiple dependent stages
or sessions, or carries material security/data/concurrency risk. File count alone is not a
trigger: a mechanical rename or a small well-scoped fix stays lightweight.
If a small task grows into one of these cases, stop implementation and enter planning.
The user-facing session owns the interview. Delegates use the confirmed decisions and plan;
they must not independently repeat the same interview. A delegate lacking those decisions
returns the missing questions to the caller before implementation.

## Invoke the actual skill

The installed `mattpocock-skills` plugin provides `/grill-me` as a manual entrypoint with
`disable-model-invocation: true`. Its body calls `grilling`. For automatic pre-task interviews,
invoke the same underlying skill through the Skill tool: `mattpocock-skills:grilling`
(use an unqualified name only when the client actually lists it). Follow its interview
rounds; do not replace them with a generic three-question checklist. If invocation reports
an unknown skill, inspect the client/plugin inventory once and retry only with a verified
available name or after a confirmed reload. Do not cycle through guessed aliases or repeat
installation attempts. If still unavailable, report the missing capability and stop before
large-task implementation; do not skip the interview or edit plugin installation files.

## Interview → plan → confirmation

1. Establish the affected area with narrow read-only exploration. Find repository facts
   rather than asking the user to supply things the tools can determine.
2. Run the skill's decision-tree interview in rounds. Ask the currently answerable decisions
   with recommended answers; wait for real replies before asking dependent questions.
   Cover goals, scope, acceptance criteria, trade-offs and observable behavior as relevant.
   Do not impose a total three-question limit or invent questions about settled decisions.
3. Capture the canonical behavior specification using `spec-workflow.md`, then present
   the agreed decisions and an ordered plan: affected components, dependencies,
   implementation stages, test/validation strategy, and material migration/rollback risks.
   The user chooses the behavior and trade-offs; the agent owns factual investigation.
4. Wait for explicit confirmation of the shared understanding and plan. Do not start
   implementation, mutating setup, or writing delegates while answers/confirmation are pending.
   `--plan` ends with the plan; approval alone does not override its plan-only scope.
5. Implement within that plan. Reopen only materially changed decisions; do not repeat the
   interview when resuming the same approved scope. A current confirmed plan and completed
   interview in the conversation or linked issue/spec satisfy the gate.

## Unattended work

`/br-auto` can execute a large task only when the interview has already happened and the
user's confirmation plus the resulting decisions/plan are available in the task context
or a linked issue/spec. Pass that evidence to the worker as `PLANNING_CONTEXT`.
A `Todo` label/column alone is not evidence of the interview. If it is absent, report
`BLOCKED_REASON: planning` and hand the task back for interactive `grill-me`; do not invent
answers or wait for input in an unattended worker. Small tasks keep the usual pipeline.

## Cost and safety

Planning normally stays in the user-facing session; it does not require a separate planner
agent. Apply the project's bounded-delegation policy to the skill's factual research too:
resolve small local lookups in-session; use a delegate only for a justified independent task.
Keep exploration focused and carry the approved decisions forward. Preserve worktree,
secret and remote-action boundaries throughout. Store the canonical specification in the
issue, or one local file when there is no issue,
as agreed with the user. Do not mirror it in another plan/status journal. Drafting an issue
is not permission to publish it. Approval remains a user decision, never a generated flag.
