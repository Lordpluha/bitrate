---
description: Token-budget planning command — produce a structured plan in the current session. Use --agent only when a deliberately isolated deep planning run is worth the extra tokens.
argument-hint: "<task description>" [--agent]
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

Use `.claude/agents/sp-plan.md` as the playbook, but apply it yourself with a narrow
scope:

- read only the rules/workflow skills needed for the detected app/package;
- ask 1-3 clarifying questions only when scope is genuinely unclear;
- produce concrete `/sp-*` steps, key files, decisions, and open questions;
- never write code from this command.

If `--agent` is present, invoke the Agent tool with `subagent_type: "sp-plan"` and pass
the user's task description verbatim.

End with `sp-plan: PLAN READY`. The user reviews and runs each `/sp-*` step manually.
