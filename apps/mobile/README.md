# @spotify/mobile

React Native + Expo mobile app for the Spotify Clone. Runs on Android, iOS, and web (via react-native-web).

## Stack

- **Expo SDK 54** + **React Native 0.81** + **React 19**
- **expo-router** — file-based routing (`app/` directory)
- **React Navigation** — bottom tabs + stack navigation
- **react-native-reanimated 4** + **react-native-gesture-handler** — animations
- **expo-image** — optimized image rendering
- **EAS Build** — cloud builds for Android (APK/AAB) and iOS (IPA)

## Requirements

- Node.js >= 20
- pnpm >= 10
- For Android: Android Studio + JDK 17
- For iOS (macOS only): Xcode + CocoaPods
- For physical device: [Expo Go](https://expo.dev/go)

## Getting Started

```bash
# From repo root — installs all workspace deps
pnpm install

# Start Metro bundler
pnpm --filter @spotify/mobile start

# Android emulator
pnpm --filter @spotify/mobile android

# iOS simulator (macOS only)
pnpm --filter @spotify/mobile ios

# Web browser
pnpm --filter @spotify/mobile web
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
app/                  — expo-router pages (file-based routing)
  (tabs)/             — bottom tab screens
  _layout.tsx         — root layout
  modal.tsx           — modal screen
assets/               — fonts, images, icons
components/           — shared UI components
constants/            — colors, config constants
hooks/                — custom React hooks
scripts/              — utility scripts
```

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
