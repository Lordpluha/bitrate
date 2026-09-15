---
name: playwright
description: Playwright conventions for web-player E2E specs and route screenshots, plus the Vitest-Browser-Mode Chromium provider used for co-located ui-react screenshot specs. Use whenever writing or reviewing a *.e2e-spec.ts, *.screenshot-spec.ts(x) file, or whenever asked to add an E2E flow, route screenshot, or component screenshot test.
metadata:
  version: "1.0.0"
  type: reference
  author: lordpluha
license: MIT
---

# Playwright rules — current repository state

Playwright has two roles:

- Standalone web-player E2E (route-flow) specs under `apps/web-player/tests/e2e/`, plus
  route screenshot specs co-located in `apps/web-player/src/` — configs for both live in
  `apps/web-player/tests/configs/`.
- Chromium provider for co-located `ui-react` screenshot specs through Vitest Browser Mode.

## Web-player locations and commands

| Mode | Location | Config | Command |
|---|---|---|---|
| E2E | `tests/e2e/<area>/*.e2e-spec.ts` | `tests/configs/playwright.e2e.config.ts` | `pnpm --filter @bitrate/web-player test:e2e` |
| Screenshot | Co-located `src/**/*.screenshot-spec.ts` | `tests/configs/playwright.screenshot.config.ts` | `pnpm --filter @bitrate/web-player test:screenshot` |

Use role → label → test id → text selector priority. CSS selectors are forbidden. Shared
fixtures start under `tests/e2e/fixtures/` only after repeated setup appears in 2+ specs.
Page objects start only after the same interaction chain repeats in 3+ specs. E2E specs
(full route flows) stay in the global `tests/e2e/` tree — only single-view/component
screenshot specs co-locate; a route-flow test doesn't belong to one file the way a
screenshot spec belongs to the view it renders.

E2E runs Desktop Chrome and Pixel 5 projects. Route screenshots use Chromium only for
stable baselines. Generate intentional baselines with
`pnpm --filter @bitrate/web-player test:screenshot:update`.

## Screenshot location and shape

Screenshot specs are co-located in both packages, but through two different mechanisms:

```text
packages/ui-react/src/components/ui/<component>/<component>.screenshot-spec.tsx   (Vitest Browser Mode)
apps/web-player/src/views/<View>/ui/<View>.screenshot-spec.ts                     (Playwright route navigation)
```

The web-player variant navigates a real route with `page.goto(...)` and asserts
`toHaveScreenshot()` directly — it's Playwright end to end, not a Vitest browser project.
Its baseline images live alongside it in a `<spec-file>-snapshots/` directory, same as any
other Playwright screenshot test.

Use Testing Library to render and `vitest/browser` to locate the stable subject:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from './button'

describe('Button screenshots', () => {
  it('all variants', async () => {
    render(
      <div data-testid="subject">
        <Button>Default</Button>
      </div>,
    )

    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
```

`data-testid="subject"` is acceptable for the screenshot boundary. Inside behavioural
tests, prefer role and label selectors.

## Commands

```bash
pnpm --filter @bitrate/ui-react test:screenshot
pnpm --filter @bitrate/ui-react test:screenshot:update
```

Smoke-run one file directly:

```bash
pnpm --filter @bitrate/ui-react exec vitest run --project=screenshot src/components/ui/button/button.screenshot-spec.tsx
pnpm --filter @bitrate/ui-react exec vitest run --project=screenshot src/components/ui/button/button.screenshot-spec.tsx --update
```

Filter further with `-t "<title>"`. Baselines are written to the component's
`__screenshots__/` directory and include the browser name.

Use the update command only after confirming the visual change is intentional. Review the
resulting image diff before accepting it.

## Stability rules

- Render a bounded subject, not the whole document.
- Cover meaningful states or variants in one stable composition.
- Avoid time, randomness, remote assets, animations, and network calls.
- Use repository fonts and generated token CSS loaded by `vitest-browser-setup.ts`.
- Keep Chromium as the configured browser unless cross-browser coverage is introduced as a
  deliberate repository-level change.
- Smoke-run only the changed screenshot spec while authoring.
- Web-player tests use the configured `baseURL`; do not hardcode `http://localhost:3001`.
- E2E assertions verify user-visible outcomes across route boundaries.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/@playwright/test` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('@playwright/test/package.json').version"
   ```
2. **Then the official docs:** https://playwright.dev/docs/intro — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because assertion and fixture APIs differ across versions; screenshot options especially.

## Related rules and skills

- `vitest` — the unit/integration projects screenshot specs sit alongside.
- `br-tester` — the heavy specialist that writes/runs one focused E2E/screenshot
  spec end to end and smoke-runs it; dispatched by `/br-implement` by default, or invoke it
  directly via the Agent tool.
