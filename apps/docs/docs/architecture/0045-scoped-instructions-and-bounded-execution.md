# ADR-0045: Scoped instructions and bounded execution

Status: Accepted

Date: 2026-09-23

## Context

Path-scoped rules still loaded large overlapping manuals, including web-player conventions
in other frameworks. The unattended dispatcher retained mandatory stage delegation and
checked planning after worktree setup. Resource measurements did not serialize workers.
The user approved a Claude-only refactor, component thresholds as review signals and a
canonical specification in the issue (one local file when no issue exists).

## Decision

- Keep requirements in concise scoped rules; load detailed guides by relevant section.
  Preserve architecture/security boundaries; size/props/effects are review signals with
  rationale in review, not source comments or automatic failures.
- Ordinary work has one owner; br-auto defaults to one worker with explicit parallel override.
  Delegation requires bounded independent work. Apply the
  planning gate before intake/rework mutations; reuse actual approved decisions.
- Store behavior and acceptance IDs in one canonical spec. Keep GitHub mutation approvals;
  generated status fields cannot manufacture user approval.
- Serialize participating heavy checks across worktrees using an OS lock in the common
  Git directory before resource sampling. Bound execution and preserve command exit status.
- Reuse verification only with observed results and matching relevant inputs, including
  dirty/untracked files, configurations, dependency inputs and environment/tool identity.
- Provide an optional concise output style. Teams, personal plugin packaging, extra memory
  stores, new LSP installations, provider routing and CI/SDK automation are separate choices.
  No Codex configuration is a project requirement.

## Consequences

Smaller scoped instruction sets reduce avoidable text, but byte counts do not establish
subscription savings. Rules still guide a model rather than implement a state machine.
The execution lock covers participating commands in this repository, not the whole host;
commands must stay in the foreground and not daemonize or deliberately close the lock FD.
Verification records compare declared inputs, not proof of execution or complete dependency
discovery. Live Claude behavior and provider usage require interactive follow-up validation.

## Alternatives considered

- Always-on Teams and role pipelines: extra requests before their benefit is established.
- Full lint/types/tests after each edit: redundant work and resource contention.
- Duplicate specifications/memory journals: conflicting sources of task truth.

See [execution policy](../../../../.claude/references/execution-policy.md),
[spec workflow](../../../../.claude/references/spec-workflow.md) and
[platform options](../../../../.claude/references/claude-platform.md).
