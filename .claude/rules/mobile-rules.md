---
name: mobile-rules
description: React Native + Expo rules for apps/mobile — the web-player conventions that do not exist here, kebab-case file naming, the path alias rooted at the app itself, and the three app.json settings (New Architecture, typed routes, React Compiler) that constrain what you may add. Use whenever writing or reviewing a screen, navigator, or native surface under apps/mobile/.
paths:
  - "apps/mobile/**"
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Mobile rules — apps/mobile (React Native + Expo)

Read before writing any file in `apps/mobile/`. Pair with the `expo` skill, which covers the
framework mechanics; this file is project law.

## Status: core MVP (epic #225)

`apps/mobile` has auth, Home, Search, Library, Profile and the player (#226–#229). The
conventions below are decided; the app's README "Conventions" table is their one-page summary.
Offline mode, background playback, push and the EAS pipeline are still open (#230–#233).

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
and React hook correctness. Component size, props and effects prompt review under
`code-principles.md`; they do not force decomposition. Do not load web React recipes.

## Structure

```
apps/mobile/
  app/            expo-router routes — a file here IS a route
    _layout.tsx   providers; components/app-navigator.tsx guards by session (Stack.Protected)
    (auth)/       signed-out screens
    (app)/        signed-in tabs, drawn by the Mobile Island (components/island/)
    now-playing.tsx
  components/     screen parts; components/ui/ for primitives
  hooks/          use-*.ts
  constants/      theme.ts + tokens.gen.ts
  lib/            logic without UI: api/, auth/, catalog/, player/, i18n/, preferences/
  scripts/tokens/ design-token bridge generator
```

Keep files small: one exported function or component per file, under 200 lines.

**File naming here is `kebab-case`**, not PascalCase — `themed-text.tsx`, `use-color-scheme.ts`.
That contradicts `.claude/rules/typescript.md`'s React-component naming, and the Expo
convention wins inside this app. Match the existing files; do not half-migrate.

Platform-specific variants use the extension suffix Expo resolves automatically:
`lib/player/engine/index.web.ts`, `use-color-scheme.web.ts`. Do not hand-roll `Platform.OS` branching
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
Theme values live in `constants/theme.ts` and are read through `useTheme()`.

Colours come from the design-token bridge: `pnpm --filter @bitrate/mobile tokens` regenerates
`constants/tokens.gen.ts` from `packages/tailwind/src` (Dark default, Light, Dim — one
palette). Never edit the generated file or write a hex in a component; read roles with
`useTheme()`. A missing role is added to `scripts/tokens/color-roles.ts` (or to the tailwind
sources first). `tokens:check` fails CI on drift.

## API access

Types come from `@bitrate/contracts`. Do not hand-write a duplicate response shape, and do
not import `@bitrate/ui-react`.

Use the one client, `api` from `lib/api/client.ts` (openapi-fetch + the 401 refresh
middleware). Session cookies stay in the native cookie store; never read or store a token.
Queries are `queryOptions` factories in `lib/<domain>/…-query.ts` with keys from
`lib/catalog/query-keys.ts`. A response the contract leaves untyped is validated with zod
(`lib/catalog/schemas/`). `apiFetch` exists only for paths whose generated contract is wrong.

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
pnpm --filter @bitrate/mobile test:unit            # Jest (jest-expo), *.unit-spec.ts(x)
pnpm --filter @bitrate/mobile tokens:check
```

Playback needs a development build (react-native-track-player is native; no Expo Go). EAS builds
(`build:dev:*`, `build:prod:*`) and store submission are the user's to run.

## Related

- `expo` skill — routing, Reanimated, the native/web boundary in depth.
- `br-mobile-developer` — the agent that owns this app.
- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md`.
