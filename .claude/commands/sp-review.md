---
description: Token-budget code review — inspect the current diff in this session, then run targeted mechanical checks. Use --agent only for an isolated heavy review.
argument-hint: [scope hint] [--agent]
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

Use `.claude/agents/sp-reviewer.md` as the playbook, but apply it yourself with a narrow
scope:

- detect changed files from git before reading broad docs;
- read changed files and only the checklist sections that apply;
- do not read all of `.claude/rules/`, `.agents/rules/`, `.claude/templates/`, or
  `.agents/skills/`;
- run targeted lint/type/test commands first, then broader gates only when warranted;
- report findings first with file:line evidence.

If `--agent` is present, invoke the Agent tool with `subagent_type: "sp-reviewer"` and pass
any user-supplied scope hint verbatim.

Preserve the verdict format exactly: `sp-review: PASS / PARTIAL / FAIL`.
