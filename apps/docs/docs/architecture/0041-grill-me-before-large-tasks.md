# ADR-0041: Interview and confirm a plan before large tasks

Status: Accepted — extends ADR-0040 with required large-task planning

Date: 2026-09-23

## Context

The user requires a planning stage with the `grill-me` skill before every large task.
ADR-0040 keeps routine work in-session and avoids unnecessary agent chains; that does not
remove the need to agree substantial behavior, architecture and trade-offs before building.

## Decision

The user-facing session runs the `grill-me` interview before a large task, presents the
resulting decisions and implementation/validation plan, then waits for explicit confirmation.
Large includes substantial features, architecture or contract changes, migrations, multiple
dependent stages/sessions and material risk. Mere file count is not sufficient.

Use the installed plugin's model-invocable `grilling` skill: its manual `/grill-me` wrapper
is marked `disable-model-invocation`. Follow the actual skill's rounds and wait for answers;
do not replace it with a capped generic Q&A. If the skill is unavailable, report the missing
capability instead of silently proceeding. Operational details live in
`.claude/references/large-task-planning.md`, outside automatically loaded rules.

This applies without an explicit slash command and with `--session`. The main session owns
user interaction. Delegates and resumed sessions reuse an already completed interview and
confirmed plan while scope remains unchanged. Reopen only materially changed decisions.
Unattended large tasks without prior interview/plan evidence report `BLOCKED_REASON: planning`;
board state alone is not sufficient. Small tasks retain the lightweight default workflow.

## Consequences

Large tasks incur deliberate planning interaction before implementation. Clear initial
requests still receive a decision check, but settled facts and answers are not asked again.
No extra planning agent, plugin copy, automatic model upgrade or permanent plan file is
required. Existing isolation, verification and remote-action boundaries remain in force.

## Alternatives considered

- Interview only vague requests: does not meet the user's requirement for every large task.
- Force interviews for every edit: adds overhead to small, reversible tasks.
- Interview separately in every agent: repeats questions and consumes extra context.
