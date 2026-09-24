# Specification ownership

For a large task use grill-me to agree observable behavior, then an implementation plan.
The user confirms those decisions before implementation. Logic/API/bugs follow the
installed mattpocock TDD workflow; confirmed public seams do not need another interview.

The issue body is the canonical specification. Without an issue use exactly one local
file at `apps/docs/docs/specs/<task-slug>.md`, based on
[the template](../templates/task-spec.md). Do not create an issue just to satisfy this
workflow. Creating/editing an issue still follows the command's remote-action approval
boundary; until publication, a draft is explicitly a draft, not approved GitHub state.

Give acceptance criteria stable IDs (AC-1, AC-2). Link the plan, implementation and
verification evidence to those IDs. Keep the implementation plan in that same artifact
when persistent storage is needed. Reports link to the canonical spec rather than copy it.
Do not make a second task journal or mirror the board locally.

Before intake/claim, check actual interview answers, approved behavior and confirmed plan.
A Todo column, generated `approved: true` field or worker assertion is not user approval.
Resume within that scope without another interview. Reopen decisions only when behavior,
contracts, risk or scope materially changes. Internal implementation choices do not need
new approval when they preserve the agreed requirements.

Small fixes need only reproduction, expected behavior and a focused regression check.
Cosmetic/docs changes do not acquire a full SDD ceremony. Specification files contain no
secrets, credentials, production records or copied transcripts.
