# ADR-0040: Scope instructions and make delegation proportional to the task

Status: Accepted — supersedes ADR-0021's mandatory dispatch policy

Date: 2026-09-23

## Context

The user requested implementation of eight changes to reduce unnecessary Claude Code
context and agent overhead. The entrypoint had 415 lines and 26,513 bytes; 19 rule files
held 193,227 bytes. Their `globs` metadata did not use Claude Code's documented `paths`
field. Review and troubleshooting manuals therefore lived in the unconditional rule set.
Mandatory delegation also added contexts to ordinary tasks. These findings justify the
change but do not establish an exact subscription-quota saving or explain a reported 10x
increase on their own.

## Decision

- Use `paths` for file-scoped rules. Keep only a short verification baseline unconditional.
- Move review, knowledge management and detailed verification guidance to
  `.claude/references/`, loaded by explicit workflow links. Keep history and tool setup
  outside the startup entrypoint; retain their safety requirements there.
- Keep `CLAUDE.md` below 200 lines. Avoid duplicate skill/rule catalogs and forced rereads
  of instructions already in context. Load terminology and token troubleshooting on demand.
- Ordinary tasks, scoped implementation and docs audits run in-session. Delegate only for
  a bounded specialist task, useful isolation, material risk or requested independent review.
  `--session` disables delegation; `--review --session` means disclosed in-session review.
- Preserve explicit `/br-auto` orchestration. `br-worker` remains available when explicitly
  requested. Do not require a planner/developer/tester/reviewer chain or automatic review
  based solely on line/file count. Reuse verification evidence for the unchanged revision;
  rerun when evidence is missing, the code changed or independent reproduction is needed.
- Set planner, developers, tester, librarian, DevOps, worker and manager to Sonnet/medium.
  Retain Opus/high for complex debugging and risk-focused independent review. Frontmatter
  is the source of model defaults; model availability depends on the user's account.
- Preserve worktree isolation for writing delegates, user-state protection, existing
  remote-action boundaries, secret protection and required verification.

## Consequences

Startup context is smaller and unrelated app rules need not load. File creation without
prior reads and commit/PR workflows require explicit links so applicable rules are not
missed. A focused task no longer starts extra agents merely because it edits code.
Routine work may need escalation when complexity appears; stronger review stays available.
Moving text alone does not remove cost once it is intentionally read.

Validate structure and references locally, then compare `/context` in new sessions before
and after opening representative app files. Measure comparable task quality, request count,
cache/input/output usage and actual plan usage. Do not promise a quota reduction from bytes.

## Alternatives considered

- Shorten every rule without fixing loading: unrelated instructions would still load.
- Split the entrypoint into `@` imports: improves organization but still loads the content.
- Disable all agents or weaken checks: removes useful independent review and safety.
- Keep mandatory Opus/high for routine coordination and tests: unnecessary default cost.
