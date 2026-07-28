---
name: vitest-rules
description: Vitest conventions for web-player and ui-react — the unit/integration/snapshot/screenshot projects, file placement and suffixes, mocking with vi.mock, and single-file smoke-run commands. Use whenever writing or reviewing a *.unit-spec, *.int-spec, *.snapshot-spec, or *.screenshot-spec file in apps/web-player or packages/ui-react, or whenever asked to "write a Vitest test" or "test this component".
metadata:
  type: reference
  author: lordpluha
---

# Vitest rules

Vitest is configured for `apps/web-player` and `packages/ui-react`.

## Four projects, one config

All projects are declared in `packages/ui-react/vitest.config.ts`.

| Project | Environment | Suffix | Purpose |
|---|---|---|---|
| `unit` | jsdom | `.unit-spec.ts(x)` | Isolated rendering, props, pure behaviour |
| `integration` | jsdom | `.int-spec.ts(x)` | User interactions and component composition |
| `snapshot` | jsdom | `.snapshot-spec.ts(x)` | Stable DOM structure |
| `screenshot` | Chromium via Playwright | `.screenshot-spec.ts(x)` | Rendered visual regression |

Every spec is co-located with its component under
`packages/ui-react/src/components/ui/<component>/`.

## Web-player projects

Declared in `apps/web-player/vitest.config.ts`:

| Project | Environment | Location |
|---|---|---|
| `unit` | jsdom | Co-located `src/**/*.unit-spec.ts(x)` |
| `integration` | jsdom | `tests/integration/**/*.int-spec.ts(x)` |

Unit tests cover helpers, schemas, stores, hooks with mocked dependencies, and focused
components. Integration tests cover composition across modules. Page flows belong to
Playwright.

## Commands

```bash
pnpm --filter @spotify/ui-react test
pnpm --filter @spotify/ui-react test:unit
pnpm --filter @spotify/ui-react test:int
pnpm --filter @spotify/ui-react test:snapshot
pnpm --filter @spotify/ui-react test:snapshot:update
pnpm --filter @spotify/ui-react test:screenshot
pnpm --filter @spotify/ui-react test:screenshot:update
pnpm --filter @spotify/ui-react test:cov
pnpm --filter @spotify/web-player test:unit
pnpm --filter @spotify/web-player test:int
```

Smoke-run one file directly through Vitest:

```bash
pnpm --filter @spotify/ui-react exec vitest run --project=unit src/components/ui/button/button.unit-spec.tsx
pnpm --filter @spotify/ui-react exec vitest run --project=integration src/components/ui/button/button.int-spec.tsx
pnpm --filter @spotify/ui-react exec vitest run --project=snapshot src/components/ui/button/button.snapshot-spec.tsx
pnpm --filter @spotify/web-player exec vitest run --project=unit src/shared/store/resetStores.unit-spec.ts
```

Filter one test title with `-t "<title>"`. Do not insert a standalone `--` before the file
path: with the current package script that form runs the complete project instead of one
spec.

## Authoring conventions

- Read the target component and the matching existing spec before writing.
- Import Vitest globals explicitly from `vitest`; configuration enables globals for runtime
  compatibility, not as an excuse for implicit imports.
- Use Testing Library role/label queries before `data-testid`.
- Unit tests assert one isolated behaviour.
- Integration tests use `userEvent` and assert observable outcomes.
- Snapshot tests use `container.firstChild`; update snapshots only for intentional changes.
- Mock module boundaries with `vi.mock()` and configure calls with `vi.mocked()`.
- Web-player imports use the `@/` alias, including tests.
- Do not assert private implementation details.
- Run only the new or changed spec while authoring; CI runs the complete matrix.

## Setup files

- `packages/ui-react/vitest-setup.ts` installs jest-dom, browser API stubs, and cleanup for
  jsdom projects.
- `packages/ui-react/vitest-browser-setup.ts` loads the real stylesheet and cleanup for
  browser screenshot tests.
- `apps/web-player/tests/setup.ts` installs jest-dom and cleanup.

Do not move one-off mocks into setup files. Shared setup is for behaviour required by
multiple components.

## Reference specs

Use the button specs as the smallest canonical examples:

- `button.unit-spec.tsx`
- `button.int-spec.tsx`
- `button.snapshot-spec.tsx`
- `button.screenshot-spec.tsx`

For browser/page flows and screenshots, also read the `playwright-rules` rule.

## Related rules and skills

- `playwright-rules` — the Chromium provider behind the `screenshot` project, plus web-player E2E.
- `/sp-test` — writes one new spec end to end and smoke-runs it.
