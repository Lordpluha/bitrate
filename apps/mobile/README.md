# @bitrate/mobile

React Native + Expo mobile app for Bitrate. Runs on Android, iOS, and web (via react-native-web).

## Stack

- **Expo SDK 58** + **React Native 0.88** + **React 19**
- **expo-router** — file-based routing (`app/` directory)
- **React Navigation** — tabs drawn as the floating Mobile Island + stack navigation
- **TanStack Query** (server state) + **Zustand** (player and preferences)
- **openapi-fetch** typed against `@bitrate/contracts`
- **react-native-track-player** — native playback (web build uses an `<audio>` element)
- **react-native-reanimated 4** + **react-native-gesture-handler** — animations
- **expo-image** — optimized image rendering
- **EAS Build** — cloud builds for Android (APK/AAB) and iOS (IPA)

## Requirements

- Node.js >= 24
- pnpm 12.7.0 (repository pin; see [development requirements](../../README.md#how-to-develop))
- For Android: Android Studio + JDK 17
- For iOS (macOS only): Xcode + CocoaPods
- For physical device: [Expo Go](https://expo.dev/go)

## Getting Started

```bash
# From repo root — installs all workspace deps
SKIP_GRAPHIFY_INSTALL=1 SKIP_RTK_INSTALL=1 pnpm install

# Start Metro bundler
pnpm --filter @bitrate/mobile start

# Android emulator
pnpm --filter @bitrate/mobile android

# iOS simulator (macOS only)
pnpm --filter @bitrate/mobile ios

# Web browser
pnpm --filter @bitrate/mobile web
```

Or inside `apps/mobile/`:

```bash
pnpm start
pnpm android
pnpm ios
pnpm web
```

## Project Structure

```
app/                  — expo-router routes (a file is a route)
  _layout.tsx         — providers; AppNavigator guards routes by session
  (auth)/             — login, two-factor, register, forgot/reset password
  (app)/              — signed-in tabs: index (Home), search, library, liked-songs, profile
  now-playing.tsx     — full-screen player (modal)
components/           — screen parts; components/ui/ holds the primitives
constants/            — theme.ts + tokens.gen.ts (bridged design tokens)
hooks/                — use-*.ts React hooks
lib/                  — logic without UI: api/, auth/, catalog/, player/, i18n/, preferences/
scripts/tokens/       — the design-token bridge generator
```

## Conventions

| Concern | Choice |
|---|---|
| API | `lib/api/client.ts` — one openapi-fetch client typed by `@bitrate/contracts`; a middleware refreshes the session on 401 once and replays the request. Untyped responses are validated with zod in `lib/catalog/schemas`. |
| Session | The API's httpOnly cookies live in the platform cookie store (`credentials: include`); the app never reads a token. `GET /auth/me` answers "signed in?"; `Stack.Protected` routes `(app)` / `(auth)`. |
| State | Server data in TanStack Query (`lib/*/…-query.ts`); the player queue and UI preferences in Zustand. |
| Tokens | `pnpm tokens` regenerates `constants/tokens.gen.ts` from `packages/tailwind/src` (Dark default, Light, Dim). `pnpm tokens:check` fails on drift (CI runs it). Read colours with `useTheme()`. |
| Player | `lib/player/player-store.ts` owns the queue; the engine (`lib/player/engine/index.ts` native RNTP, `index.web.ts` web) plays one track at a time from a play-session URL (`/tracks/:id/cmaf/:bitrate?t=`). Encrypted (ClearKey) renditions are skipped. |
| i18n | `lib/i18n/messages/{en,uk,pl}` — the web player's locales; a unit test keeps the catalogs' keys equal. |
| Tests | Jest (`jest-expo`), files `*.unit-spec.ts(x)`: `pnpm test:unit`. |

## Environment

Copy `.env.example` to `.env`. `EXPO_PUBLIC_API_URL` defaults to `http://localhost:3000`; an
Android emulator needs `http://10.0.2.2:3000`, a phone your machine's LAN address.

## Development build (required for playback)

`react-native-track-player` is a native module, so playback does not run in Expo Go. Build a
development client once (`pnpm build:dev:android` / `pnpm build:dev:ios`, or `npx expo run:android`
with a local SDK) and start Metro with `pnpm start`. The web build (`pnpm web`) plays through an
`<audio>` element and needs no native build.

## EAS Build

Cloud builds via Expo Application Services:

```bash
# Preview build (for testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

Config: `eas.json`.

## Docker (Metro bundler only)

For demos or tunneling without a local dev environment:

```bash
docker compose --profile mobile up -d mobile
# Open http://localhost:19000 for the QR code
```

> Native execution is recommended for active development.
