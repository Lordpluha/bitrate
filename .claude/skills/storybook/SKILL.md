---
name: storybook
description: Storybook conventions for packages/ui-react — where stories live, CSF3 story shape, the a11y and docs addons, token/theme stories, and how stories relate to the four co-located Vitest projects. Use when adding or changing a *.stories.tsx file, or when documenting a ui-react component.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Storybook — the ui-react component catalogue

Storybook 10 with `@storybook/react-vite`, plus `@storybook/addon-a11y` and
`@storybook/addon-docs`. It belongs to `packages/ui-react` only — the apps do not run it.

```bash
pnpm --filter @bitrate/ui-react storybook        # dev
pnpm --filter @bitrate/ui-react build-storybook  # static build
```

## Where stories live

Co-located with the component, alongside its four spec files. A new `ui-react` component's
full set is:

```
packages/ui-react/src/components/ui/<name>/
  <name>.tsx
  <name>.stories.tsx
  <name>.unit-spec.tsx
  <name>.int-spec.tsx
  <name>.snapshot-spec.tsx
  <name>.screenshot-spec.tsx
  index.ts
```

`.stories.tsx` is **required** for a new component — it is checked by `FSD-5` in
`.claude/rules/architecture-checklist.md`. Token/foundation stories live beside what they
document (`src/styles/radius.stories.tsx`, `spacing.stories.tsx`, `shadow.stories.tsx`).

### The colour stories read the CSS — do not hand-list tokens

`src/styles/palette.stories.tsx` and `themes.stories.tsx` get their data from
`src/styles/token-docs.ts`, which parses the stylesheets themselves through
`import.meta.glob('./themes/**/*.css', { query: '?raw' })`. They therefore always show
exactly what the CSS declares: a role added to a part-file appears without anyone editing a
story, and a renamed one cannot leave a stale entry behind.

Never add a colour token to one of those files by hand — a hand-maintained list rots the
moment a token is renamed. Declare it in the `@theme` and `:root.light` blocks of the
part-file that should own it, and the story follows.

### Theme toggle

`.storybook/preview.tsx` puts a **Theme** control in the toolbar; it toggles the `light`
class on `<html>`, the same switch the apps use. Check any new component in both themes
before calling it done — dark is the default, so a light-theme regression is easy to miss.

## CSF3 shape

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: ['default', 'secondary'] } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'New' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Beta' } }
```

`satisfies Meta<typeof Component>` is what makes `args` type-checked against the real props —
without it, a renamed prop leaves a silently broken story. `tags: ['autodocs']` generates the
docs page from the component's types and TSDoc.

## What to write a story for

One story per **meaningful state**, not per prop permutation:

- the default,
- each visual variant that reads differently,
- the states that are easy to get wrong and hard to see: `disabled`, `loading`, error, empty,
  long-content overflow, and truncation.

The long-content story earns its place more often than any other — most layout bugs in a
shared component are a label nobody tried at 60 characters.

## Accessibility

`addon-a11y` runs axe on the rendered story and reports violations in the panel. Treat a
violation as a component defect: a missing accessible name on an icon-only control, contrast
below AA, a non-semantic interactive element. `apps/docs/docs/brand/a11y.md` is the contract.

## Stories vs the four Vitest projects

They do different jobs; a story is not a test:

| Artifact | Answers |
|---|---|
| `.stories.tsx` | What does it look like, in every state a human should review? |
| `.unit-spec.tsx` | Does it behave correctly in isolation? |
| `.int-spec.tsx` | Does it behave correctly under real user interaction? |
| `.snapshot-spec.tsx` | Did the DOM change unintentionally? |
| `.screenshot-spec.tsx` | Did the rendered pixels change unintentionally? |

`.screenshot-spec.tsx` is the one that overlaps — it is the automated guard, the story is the
human-review surface. Keep both.

## Gotchas

- **Stories need the token CSS.** A component rendering unstyled in Storybook but fine in the
  app usually means `.storybook/preview` is not importing `@bitrate/ui-react/styles/*.css`.
- **Both themes.** A story only ever viewed in one theme hides half the contrast problems —
  use the theme toggle before calling a component done.
- **No app imports.** `packages/ui-react` must not import from `apps/*`; a story that needs
  app context is testing the wrong thing at the wrong layer.
- **Keep args serialisable** where you can — a story whose args are functions and class
  instances does not round-trip through the URL or the docs page.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/storybook` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('storybook/package.json').version"
   ```
2. **Then the official docs:** https://storybook.js.org/docs — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because CSF2 examples and the pre-8 addon APIs do not apply.

## Related

- `ui-react-rules` skill — where components live, search-before-adding, Base UI.
- `vitest` skill — the four co-located spec projects.
- `playwright` skill — the Chromium provider behind screenshot specs.
- `.claude/rules/architecture-checklist.md` — FSD-5, the required component file set.
