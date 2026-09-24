# ADR-0042: Hooks for mechanical protection, skills for workflows

**Status:** Accepted
**Date:** 2026-09-23

## Context

ADR-0040 reduced always-loaded instructions. Their detailed verification and review
workflows still need discoverable entrypoints. Existing hooks missed shell secret paths,
ignored linked worktrees and always selected Biome even for Prettier workspaces.
The user requested blocking risky operations with approval for one operation, TDD for
logic/API/bugs and visible worktrees in VS Code.

## Decision

- Use a shared Claude pre-tool guard for explicit secret paths and risky shell/Git
  calls. Request native one-call approval, never a persistent bypass. Deny risky calls
  in noninteractive bypass modes; force push remains prohibited.
- Resolve formatter from the edited file's checkout/workspace and format that file only.
  Report failures briefly; successful hooks are silent.
- Load `br-verify` and `br-review` on demand, retaining detailed reference documents.
  Measure Linux resources before heavy checks without disturbing running processes.
- Use the installed mattpocock TDD skill for logic, API and bug fixes; reuse public seam
  decisions from the confirmed grill-me plan. No compulsory TDD for cosmetic/docs edits.
- Enable project-level VS Code worktree detection. Preserve existing worktrees.

## Consequences

Mechanical checks do not require injecting the full manuals into each session. Semantic
decisions remain in scoped rules and skills. Hooks are bounded tool-call checks, not an
OS sandbox; Codex does not automatically run Claude hooks. Resource measurements are
snapshots, not locks. Native prompt behavior and UI discovery require interactive clients.
Tests use temporary repositories and orphan worktrees without creating commits.
See [.claude/references/hook-policy.md](https://github.com/Lordpluha/bitrate/blob/develop/.claude/references/hook-policy.md).
