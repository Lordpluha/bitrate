---
description: Token-budget debug command — reproduce, isolate, fix, and verify in the current session. Use --agent only for a deliberately isolated heavy debug run.
argument-hint: "<symptom description or stack trace>" [--agent]
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

Use `.claude/agents/sp-debug.md` as the playbook, but apply it yourself with a narrow
scope:

- start from the symptom, stack trace, failing test, or named files;
- search only the suspected app/package first;
- build one repro or document exact steps before editing;
- rerun the repro and only the relevant mechanical checks.

If `--agent` is present, invoke the Agent tool with `subagent_type: "sp-debug"` and pass the
user's symptom description verbatim.

Report the root cause citation, repro path, and final `sp-debug: PASS / PARTIAL / BLOCKED`
line.
