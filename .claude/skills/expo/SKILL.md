---
name: expo
description: Expo and React Native conventions for apps/mobile — expo-router file-based routing, the native-vs-web boundary (what from the web stack does NOT work here), styling without Tailwind, Reanimated, and the build/run commands. Use when writing a screen, navigation, or native surface in apps/mobile, or before assuming a web-player pattern transfers.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Expo — apps/mobile

React Native on Expo with `expo-router`, React Navigation tabs, and Reanimated.
`@bitrate/contracts` supplies API types.

## Read this first — maturity

`apps/mobile` is **scaffolded but unstarted** (roadmap v0.5.0, per `PRODUCT.md`). What is
there is close to the Expo starter template, not an established convention set. Check before
assuming:

```bash
find apps/mobile/app apps/mobile/components -type f -name '*.tsx' | head -30
cat apps/mobile/package.json
```

`.claude/rules/mobile-rules.md` is this app's law — read it alongside this skill. It still
leaves large areas unestablished (state layer, API client, token bridge); when a task forces
you to pick one, say so in your report rather than inventing it silently.

## What does NOT transfer from the web stack

This is the section that saves the most time. None of these exist in React Native:

| Web-player concept | Status in `apps/mobile` |
|---|---|
| FSD layers (`features/`, `entities/`, `widgets/`) | Not used — `expo-router` owns the structure |
| `'use client'` | Meaningless — there is no server component model |
| Tailwind classes, `cn()` | No DOM, no CSS classes |
| `@bitrate/ui-react` | **Will not run** — it is a DOM + Tailwind library |
| `ROUTES` from `@/shared/routes` | `expo-router` paths instead |
| `<div>`, `<span>`, `<button>` | `<View>`, `<Text>`, `<Pressable>` |
| `localStorage` | `expo-secure-store` / `AsyncStorage` |

The rules that **do** apply: `.claude/rules/typescript.md`,
`.claude/rules/code-principles.md`, and the framework-agnostic parts of
`.claude/rules/react.md` (hooks rules, ≤100 logic lines, ≤5 props, ≤2 `useEffect`).

## Routing — `expo-router`

File-based: a file under `apps/mobile/app/` **is** a route. `_layout.tsx` defines the
navigator for its directory; `(group)` directories group routes without adding a URL segment.

```tsx
import { Link, useRouter, useLocalSearchParams } from 'expo-router'

<Link href={`/track/${id}`}>…</Link>
const { id } = useLocalSearchParams<{ id: string }>()
```

Follow the existing group/layout structure rather than adding a parallel navigator by hand —
two navigators competing for the same stack is a hard bug to unpick.

## Styling

`StyleSheet.create` (or whatever the app has established — check first). Design values should
trace back to the token roles in `packages/ui-react/src/styles/`; if no bridge exists for this app yet, say so rather than
scattering raw hex literals.

React Native's layout is flexbox-only, `flexDirection` defaults to `column` (not `row`), and
there is no cascade — every style is explicit and local.

## Native feel over web parity

`PRODUCT.md` records the platform as `adaptive`: the mobile surface should read as native on
each OS, not as the web player in a WebView. Platform-idiomatic navigation, gestures, and
affordances. `Platform.select({ ios, android })` for genuine divergence.

## Accessibility

React Native's own props, not ARIA: `accessibilityLabel`, `accessibilityRole`,
`accessibilityState`, `accessible`. Touch targets ≥44×44pt. Honour reduced motion in
Reanimated (`useReducedMotion`).

## Reanimated

Animations run on the UI thread via worklets. The rules that matter: shared values
(`useSharedValue`) are mutated through `.value`, JS-thread functions are called from a
worklet with `runOnJS`, and a plain closure over React state inside a worklet captures a
stale value. `react-native-worklets` is installed, so the Babel plugin must stay configured —
"the animation does nothing" is usually a worklet that never compiled.

## Commands

```bash
pnpm --filter @bitrate/mobile start          # dev server
pnpm --filter @bitrate/mobile ios|android|web
pnpm --filter @bitrate/mobile lint           # eslint-config-expo, NOT Biome
pnpm --filter @bitrate/mobile exec tsc --noEmit
```

This app has **no `check-types` script** — run `tsc --noEmit` explicitly and say so in your
report rather than claiming a pass. EAS builds (`build:dev:*`, `build:prod:*`) are the
user's to run, not an agent's.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/expo` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('expo/package.json').version"
   ```
2. **Then the official docs:** https://docs.expo.dev — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because Expo docs are SDK-versioned and the New Architecture changes what works.

## Related

- `.claude/rules/typescript.md`, `.claude/rules/code-principles.md` — the rules that do apply.
- `impeccable` skill — `reference/ios.md` and `reference/android.md` carry native design
  guidance that web guidance does not.
