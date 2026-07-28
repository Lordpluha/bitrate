---
description: Write or modify web-player, API, or package code in the current session for the current ticket/branch, then open or update the pull request. Dispatches to the sp-developer/sp-debugger/sp-tester/sp-reviewer/sp-planner specialists via --agent for isolated work; does the equivalent narrow-scope work itself in-session by default.
argument-hint: "<task description> [--agent] [--plan] [--review]"
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

## Routing

This command is the single entrypoint for implementation work. It doesn't have its own
heavy agent — it dispatches to the named specialists:

| Situation | Route |
|---|---|
| `--plan` passed, or the task is non-trivial (multi-file, new module, cross-cutting) | Invoke `sp-planner` (Agent tool, `subagent_type: "sp-planner"`) first; surface its plan and wait before implementing |
| Ordinary coding task | Implement it yourself, narrow scope (see below) |
| `--agent` passed, task is a bug fix | Invoke `sp-debugger` |
| `--agent` passed, task is a feature/change | Invoke `sp-developer` |
| Task explicitly asks to write/run a test, nothing else | Invoke `sp-tester` (or write the spec yourself in-session, same as any other narrow task) |
| `--review` passed, or the diff exceeds 100 lines / 5 files | Invoke `sp-reviewer` before the PR step |

## In-session implementation (no `--agent`)

- read `CLAUDE.md`'s **Rule Index** table first — it's exhaustive and cheap (one line per
  rule file) — mark every row whose scope matches the task, then read `project-conventions`
  plus only those rows' files in full; do not read unrelated rows or skip the sweep;
- use any skill that fits (`fsd-scaffold`, `shadcn`, `prisma-client-api`, `graphify`,
  `web-design-guidelines`, `writing-guidelines`, or others), not a fixed list;
- do not read `.claude/templates/` or `.claude/skills/` up front — only when a matched rule
  calls for a specific skill;
- run `pnpm lint` and `pnpm check-types` as the baseline gate; write tests inline when the
  task needs them (or delegate to `sp-tester` for a dedicated focused spec); self-check
  against `.claude/rules/architecture-checklist.md`, or delegate to `sp-reviewer` for a full
  structured pass on a substantial diff;
- write a changeset (`.changeset/<slug>.md`) when the change affects observable behaviour of
  an app or package — see `.claude/rules/commit-style.md` § "Changesets";
- before `git push`, `gh pr create`, or `gh pr edit`, state what you're about to do and wait
  for a clear yes — every time, not just the first time in a conversation.

## `--agent` dispatch

Invoke the Agent tool with the `subagent_type` chosen per the routing table above, and pass
the user-supplied arguments verbatim. The dispatched specialist reports its own verdict
(`sp-developer: PASS`, `sp-debugger: PASS`, etc.) — relay it, then handle the push/PR
confirmation step yourself at the command level (specialists never push or open/update a
PR).

Report using the `sp-implement: PASS / PARTIAL / BLOCKED` verdict line, citing the
specialist's verdict where one was invoked.
