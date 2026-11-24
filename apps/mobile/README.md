# @bitrate/mobile

React Native + Expo mobile app for Bitrate. Runs on Android, iOS, and web (via react-native-web).

## Stack

- **Expo SDK 58** + **React Native 0.88** + **React 19**
- **expo-router** — file-based routing (`app/` directory)
- **React Navigation** — stack navigation
- **TanStack Query** (server state) + **Zustand** (device-local state)
- **openapi-fetch** typed against `@bitrate/contracts`
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
  _layout.tsx         — providers
  index.tsx           — bootstrap check: GET /health through the client, drawn with the tokens
components/           — shared components
constants/            — theme.ts + tokens.gen.ts (bridged design tokens)
hooks/                — use-*.ts React hooks
lib/                  — logic without UI: api/, i18n/, preferences/
scripts/tokens/       — the design-token bridge generator
```

## Conventions

| Concern | Choice |
|---|---|
| API | `lib/api/client.ts` — one openapi-fetch client typed by `@bitrate/contracts`; a middleware refreshes the session on 401 once and replays the request. Untyped responses get a zod schema next to their query. |
| State | Server data in TanStack Query (`queryOptions` factories in `lib/<domain>/`); device-local state (UI preferences) in Zustand, persisted with AsyncStorage. |
| Tokens | `pnpm tokens` regenerates `constants/tokens.gen.ts` from `packages/tailwind/src` (Dark default, Light, Dim). `pnpm tokens:check` fails on drift (CI runs it). Read colours with `useTheme()`. |
| i18n | `lib/i18n/messages/{en,uk,pl}` — the web player's locales; a unit test keeps the catalogs' keys equal. |
| Tests | Jest (`jest-expo`), files `*.unit-spec.ts(x)`: `pnpm test:unit`. |

## Environment

Copy `.env.example` to `.env`. `EXPO_PUBLIC_API_URL` defaults to `http://localhost:3000`; an
Android emulator needs `http://10.0.2.2:3000`, a phone your machine's LAN address.

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
