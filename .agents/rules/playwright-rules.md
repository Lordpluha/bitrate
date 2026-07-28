---
name: playwright-rules
description: Playwright conventions for web-player E2E specs and route screenshots, plus the Vitest-Browser-Mode Chromium provider used for co-located ui-react screenshot specs. Use whenever writing or reviewing a *.e2e-spec.ts, *.screenshot-spec.ts(x) file, or whenever asked to add an E2E flow, route screenshot, or component screenshot test.
metadata:
  type: reference
  author: lordpluha
---

# Playwright rules — current repository state

Playwright has two roles:

- Standalone web-player E2E and route screenshot projects under `apps/web-player/tests/`.
- Chromium provider for co-located `ui-react` screenshot specs through Vitest Browser Mode.

## Web-player locations and commands

| Mode | Location | Config | Command |
|---|---|---|---|
| E2E | `tests/e2e/<area>/*.e2e-spec.ts` | `playwright.e2e.config.ts` | `pnpm --filter @spotify/web-player test:e2e` |
| Screenshot | `tests/screenshots/*.screenshot-spec.ts` | `playwright.screenshot.config.ts` | `pnpm --filter @spotify/web-player test:screenshot` |

Use role → label → test id → text selector priority. CSS selectors are forbidden. Shared
fixtures start under `tests/e2e/fixtures/` only after repeated setup appears in 2+ specs.
Page objects start only after the same interaction chain repeats in 3+ specs.

E2E runs Desktop Chrome and Pixel 5 projects. Route screenshots use Chromium only for
stable baselines. Generate intentional baselines with
`pnpm --filter @spotify/web-player test:screenshot:update`.

## Screenshot location and shape

Screenshot specs are co-located:

```text
packages/ui-react/src/components/ui/<component>/<component>.screenshot-spec.tsx
```

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
pnpm --filter @spotify/ui-react test:screenshot
pnpm --filter @spotify/ui-react test:screenshot:update
```

Smoke-run one file directly:

```bash
pnpm --filter @spotify/ui-react exec vitest run --project=screenshot src/components/ui/button/button.screenshot-spec.tsx
pnpm --filter @spotify/ui-react exec vitest run --project=screenshot src/components/ui/button/button.screenshot-spec.tsx --update
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

## Related rules and skills

- `vitest-rules` — the unit/integration projects screenshot specs sit alongside.
- `/sp-test` — writes one new E2E/screenshot spec end to end and smoke-runs it.
