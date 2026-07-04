---
description: Token-budget implementation command for spotify-clone — writes or modifies code in the current session, reading only the relevant rules/files. Use --agent only for a deliberately isolated heavy run.
argument-hint: "<task description>" [--review] [--agent]
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

Use `.claude/agents/sp-develop.md` as the playbook, but apply it yourself with a narrow
scope:

- detect whether the task touches `apps/api`, `apps/web-player`, `packages/ui-react`, or
  another package before broad search;
- read only `.claude/rules/project-conventions.md` plus the smallest relevant rule
  set or workflow skill;
- do not read all of `.claude/rules/`, `.agents/rules/`, `.claude/templates/`, or
  `.agents/skills/`;
- use `rg` with narrow paths and avoid unrelated apps/packages;
- run targeted mechanical checks first; truncate huge logs to the first useful error block.

If `--agent` is present, invoke the Agent tool with `subagent_type: "sp-develop"` and pass
the user-supplied arguments verbatim.

Report using the `sp-develop: PASS / PARTIAL / BLOCKED` verdict line.
