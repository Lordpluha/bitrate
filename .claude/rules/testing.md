---
name: testing
description: Compact router across this repo's three test stacks — Jest (apps/api), Vitest (apps/web-player, packages/ui-react), and Playwright (E2E + screenshots). States which stack owns which surface/suffix; each stack's full conventions, patterns, and commands live in its own skill. Use whenever writing, running, or reviewing any *.unit-spec/*.int-spec/*.e2e-spec/*.snapshot-spec/*.screenshot-spec file, or deciding which test layer a change needs.
metadata:
  type: reference
  author: lordpluha
---

# Testing — spotify-clone

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

## Related rules and skills

- `jest` skill — full API testing conventions: unit/integration/E2E patterns,
  fixtures, guard overrides, module-level mocks.
- `vitest` skill — full web-player/ui-react Vitest conventions: the four projects,
  commands, authoring rules, setup files.
- `playwright` skill — full E2E/screenshot conventions: locations, stability rules,
  the Chromium provider.
- `api-rules` — the module structure Jest specs test against.
- `web-player-rules` — the FSD slice structure Vitest specs test against.
- `sp-tester` — the heavy `--agent` specialist that writes/runs one focused spec end to end
  and smoke-runs it, picking the framework from scope; dispatched by `/sp-implement
  --agent`, or invoke it directly via the Agent tool.
