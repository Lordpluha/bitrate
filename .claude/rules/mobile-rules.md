---
name: mobile-rules
description: React Native + Expo rules for apps/mobile — the web-player conventions that do not exist here, kebab-case file naming, the path alias rooted at the app itself, and the three app.json settings (New Architecture, typed routes, React Compiler) that constrain what you may add. Use whenever writing or reviewing a screen, navigator, or native surface under apps/mobile/.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Mobile rules — apps/mobile (React Native + Expo)

Read before writing any file in `apps/mobile/`. Pair with the `expo` skill, which covers the
framework mechanics; this file is project law.

## Status: scaffolded, not started

`apps/mobile` is the Expo starter template plus this repo's naming (roadmap v0.5.0, per
`PRODUCT.md`). It has **no domain code yet** — no API client, no state layer, no design-token
bridge, no tests. Treat what is there as a starting point, not as convention to imitate.

**Propose, don't improvise silently.** When a task needs a convention this app has not
established, say so in your report and state the convention you chose. The next agent
inherits whatever you do here, so an undocumented invention becomes law by accident.

## What does NOT apply here

The web-player rules are the largest body of convention in this repo and almost none of it
transfers. These are **not** errors to fix in `apps/mobile`; they are concepts that do not
exist:

| Web-player rule | Status in `apps/mobile` |
|---|---|
| FSD layers (`features/`, `entities/`, `widgets/`, `views/`) | Not used — `expo-router` owns the structure |
| `'use client'` / Server Components | No server component model |
| Tailwind classes, `cn()`, CVA | No DOM, no CSS classes |
| `@bitrate/ui-react` | **Will not run** — DOM + Tailwind library |
| `ROUTES` from `@/shared/routes` | `expo-router` paths instead |
| `<div>` / `<span>` / `<button>` | `<View>` / `<Text>` / `<Pressable>` |
| Biome | This app uses `eslint-config-expo` |

Rules that **do** apply: `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`,
and the framework-agnostic parts of `.claude/rules/react.md` (hooks rules, ≤100 logic lines,
≤5 own props, ≤2 `useEffect`).

## Structure

```
apps/mobile/
  app/            expo-router routes — a file here IS a route
    _layout.tsx   root navigator
    (tabs)/       route group: grouping without a URL segment
    modal.tsx
  components/     shared components; components/ui/ for primitives
  hooks/          use-*.ts
  constants/      theme.ts
```

**File naming here is `kebab-case`**, not PascalCase — `themed-text.tsx`, `use-color-scheme.ts`.
That contradicts `.claude/rules/typescript.md`'s React-component naming, and the Expo
convention wins inside this app. Match the existing files; do not half-migrate.

Platform-specific variants use the extension suffix Expo resolves automatically:
`icon-symbol.ios.tsx`, `use-color-scheme.web.ts`. Do not hand-roll `Platform.OS` branching
where a `.ios`/`.android`/`.web` file is the idiom.

## Path alias

`"@/*": ["./*"]` — rooted at `apps/mobile/`, **not** at a `src/` directory:

```ts
import { ThemedText } from '@/components/themed-text'
import { useColorScheme } from '@/hooks/use-color-scheme'
```

## Configuration that constrains you

`app.json` enables three things you must not silently break:

- **`newArchEnabled: true`** — the React Native New Architecture. A library without New
  Architecture support will not work; check before adding one.
- **`typedRoutes: true`** — route strings are type-checked against the files in `app/`. A
  `href` that does not resolve is a type error, which is the point; do not cast it away.
- **`reactCompiler: true`** — the React Compiler memoises automatically. **Do not add
  `useMemo`/`useCallback`/`memo` by reflex here**; measure first, and say what you measured.

`scheme: "bitrate"` is the deep-link scheme. Changing it breaks existing links.

## Styling and tokens

React Native `StyleSheet`, flexbox only, `flexDirection` defaults to `column`, no cascade.
Theme values live in `constants/theme.ts` and are read through `useThemeColor`.

There is **no bridge to the design tokens yet** (the token roles in `packages/ui-react/src/styles/`). Until one exists, extend
`constants/theme.ts` rather than scattering raw hex literals through components, and flag in
your report that the bridge is still missing.

## API access

Types come from `@bitrate/contracts`. Do not hand-write a duplicate response shape, and do
not import `@bitrate/ui-react`.

No API client exists in this app yet. When one is needed, propose its shape before building
it — this is exactly the kind of convention that must be decided once.

## Accessibility

React Native props, not ARIA: `accessibilityLabel`, `accessibilityRole`,
`accessibilityState`, `accessible`. Touch targets ≥44×44pt. Honour `useReducedMotion` in
Reanimated animations.

## Commands

```bash
pnpm --filter @bitrate/mobile start
pnpm --filter @bitrate/mobile ios | android | web
pnpm --filter @bitrate/mobile lint                 # eslint-config-expo, NOT Biome
pnpm --filter @bitrate/mobile check-types          # tsc --noEmit
```

**There is no test setup in this app.** `check-types` and `lint` (via `eslint-config-expo`)
both exist; say plainly that tests did not run rather than claiming a mechanical pass that
did not happen. EAS builds
(`build:dev:*`, `build:prod:*`) and store submission are the user's to run.

## Related

- `expo` skill — routing, Reanimated, the native/web boundary in depth.
- `br-mobile-developer` — the agent that owns this app.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`.
