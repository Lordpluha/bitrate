---
name: testing
description: Compact router across this repo's three test stacks — Jest (apps/api), Vitest (apps/web-player, packages/ui-react), and Playwright (E2E + screenshots). States which stack owns which surface/suffix; each stack's full conventions, patterns, and commands live in its own skill. Use whenever writing, running, or reviewing any *.unit-spec/*.int-spec/*.e2e-spec/*.snapshot-spec/*.screenshot-spec file, or deciding which test layer a change needs.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Testing — bitrate

Three independent test stacks, one per concern. This file is the router — read it first to
know which stack applies, then load only that stack's skill for the full conventions,
patterns, and commands. Don't load all three for a change that touches one surface.

| Surface | Tool | Suffix | Skill |
|---|---|---|---|
| `apps/api` — unit, integration, E2E | Jest | `.unit-spec.ts`, `.int-spec.ts`, `.e2e-spec.ts` | `jest` |
| `apps/web-player`, `packages/ui-react` — unit, integration, snapshot, screenshot | Vitest | `.unit-spec.ts(x)`, `.int-spec.ts(x)`, `.snapshot-spec.ts(x)`, `.screenshot-spec.ts(x)` | `vitest` |
| `apps/web-player` — E2E, route screenshots; `packages/ui-react` — Chromium provider behind the `screenshot` Vitest project | Playwright | `.e2e-spec.ts`, `.screenshot-spec.ts(x)` | `playwright` |

## Picking the right layer

- Testing a NestJS controller/service/guard in isolation, with a real HTTP layer and mocked
  services, or end-to-end against real Postgres/Redis → Jest. Load the `jest` skill.
- Testing a React component, hook, store, or schema in isolation or in composition, in
  `apps/web-player` or `packages/ui-react` → Vitest. Load the `vitest` skill.
- Testing a full page flow across route boundaries, or asserting a rendered visual
  baseline → Playwright — directly for web-player E2E/route screenshots, or as the
  Chromium provider behind `ui-react`'s `.screenshot-spec` project. Load the
  `playwright` skill.

A change can span more than one row — e.g. a new API endpoint plus the web-player feature
consuming it needs both a Jest spec and a Vitest spec.

## Coverage — depth before percentage

A change is covered when its **failure modes** are exercised, not when a percentage moves.
Coverage has two independent axes, and this repo's specs are much weaker on the second:

**Breadth** — which layer runs the code. That is the table above: Jest for `apps/api`,
Vitest for `apps/web-player`/`packages/ui-react`, Playwright for full flows and visuals.

**Depth** — what the spec actually asserts about that code:

| Depth | Asserts | Required for |
|---|---|---|
| Smoke | it renders / responds at all | every new component or endpoint |
| Positive | correct output for expected input | every new behaviour |
| Negative | correct behaviour for wrong, missing, or hostile input | anything that can fail |

**A spec with only the positive path is not finished.** Whatever can realistically go wrong
gets its own case: an invalid or missing DTO field, a `null` from Prisma, a rejected
mutation, an expired token, an empty list, a value that fails a guard. In `apps/api` that
usually means asserting the exact exception (`await expect(...).rejects.toThrow(TrackNotFoundException)`),
not merely that *something* threw.

This is where the repo is actually thin. Today `packages/ui-react` has 108 spec files and
**one** that asserts an error path; `apps/api` has 49 specs with 22 covering failures. When
you touch a `ui-react` component, adding its negative case is usually the highest-value test
you can write.

**Percentage is a diagnostic, never a target.** High coverage does not mean the defects are
found — a suite that executes every line while asserting nothing scores well and proves
nothing. Read a coverage report to find code no test *reaches*, then judge whether that code
deserves a test; do not write tests to move the number, and never delete or weaken an
assertion to make a threshold pass.

```bash
pnpm --filter @bitrate/api test:cov         # jest --coverage
pnpm --filter @bitrate/ui-react test:cov    # vitest --coverage (v8)
```

`apps/web-player` has no coverage script and 7 spec files in total, so a coverage figure for
it would be misleading rather than informative — say that plainly instead of quoting one.

**What does not need a test:** a copy or config edit with no new logic branch, a pure
refactor already covered by existing specs, generated output. Say so in your report rather
than writing a test that asserts nothing, and never report a test you did not run.

Adapted from [tquality.ru — Тестовое покрытие](https://tquality.ru/blog/testovoe-pokrytie/);
the depth axis and the "percentage is not quality" warning are theirs, the thresholds and
commands are this repo's.

## Related rules and skills

- `jest` skill — full API testing conventions: unit/integration/E2E patterns,
  fixtures, guard overrides, module-level mocks.
- `vitest` skill — full web-player/ui-react Vitest conventions: the four projects,
  commands, authoring rules, setup files.
- `playwright` skill — full E2E/screenshot conventions: locations, stability rules,
  the Chromium provider.
- `api-rules` — the module structure Jest specs test against.
- `web-player-rules` — the FSD slice structure Vitest specs test against.
- `br-tester` — the heavy specialist that writes/runs one focused spec end to end
  and smoke-runs it, picking the framework from scope; dispatched by `/br-implement`
  by default, or invoke it directly via the Agent tool.
