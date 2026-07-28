---
description: Token-budget test command for spotify-clone — write or run one focused Jest, Vitest, Playwright, screenshot, or smoke test based on scope. Use --agent only for an isolated heavy run.
argument-hint: "<scenario or scope>" [--unit|--int|--e2e|--screenshot] [--agent]
author: lordpluha
---

Default: stay in the current session. Do not invoke the Agent tool unless the user passed
`--agent` or explicitly asked for a subagent.

Use `.claude/agents/sp-test.md` as the playbook, but apply it yourself with a narrow scope:

- detect the target from the scenario or changed files;
- read `.claude/rules/project-conventions.md` plus only the relevant test rule:
  - API Jest: `.claude/rules/jest-rules.md` and `.claude/rules/api-rules.md`;
  - web-player/ui-react Vitest: `.claude/rules/vitest-rules.md`;
  - Playwright or screenshots: `.claude/rules/playwright-rules.md`;
- inspect the target module/component/page and one matching existing spec;
- write or update one focused spec when requested, or choose the narrowest useful existing
  test command when the user asks to run tests;
- smoke-run only the exact spec/file whenever possible.

Mode hints:

- `--unit` prefers unit tests.
- `--int` prefers integration tests.
- `--e2e` prefers API E2E or web-player Playwright E2E.
- `--screenshot` prefers route/component screenshot tests.

If `--agent` is present, invoke the Agent tool with `subagent_type: "sp-test"` and pass the
user-supplied arguments verbatim.

End with `sp-test: PASS / PARTIAL / FAIL`.
