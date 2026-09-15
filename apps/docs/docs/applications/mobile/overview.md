---
sidebar_position: 1
---

# Mobile App Overview

Complete guide for developing and running the React Native mobile application.

## 📋 Table of Contents

- [⚙️ Starting the Mobile Container](#️-starting-the-mobile-container)
- [📱 Connecting from Phone via Expo Go](#-connecting-from-phone-via-expo-go)
- [📦 Updating Dependencies](#-updating-dependencies)
- [🔌 Available Ports](#-available-ports)
- [🔍 Debugging the Mobile Container](#-debugging-the-mobile-container)
- [🐛 Common Issues](#-common-issues)

---

## ⚙️ Starting the Mobile Container

**⚠️ Important:** For mobile development, native execution is recommended (without Docker), as it is simpler and faster.

### Docker (Metro Bundler + tunnel only)

```bash
task mobile:up      # start the Metro bundler container
task mobile:logs    # tail its logs
task mobile:qr      # print the QR code URL
```

`Taskfile.yml` is the only supported interface to Docker here. A bare `docker compose` will not
work from the repository root — the compose files live in `infra/`, so every raw invocation needs
`-f infra/docker-compose.preprod.yaml`, which is exactly what the `task` targets supply.

### Native run (recommended)

```bash
cd apps/mobile
pnpm install
pnpm start
```

---

## 📱 Connecting from Phone via Expo Go

### Prerequisites

Install **Expo Go** on your phone:
- **Android:** [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Method 1: Tunnel mode (recommended)

Works from any network, including different WiFi or mobile internet.

```bash
task mobile:logs   # find a URL like exp://u.expo.dev/...
task mobile:qr     # or print it directly
```

Expo DevTools is published on `http://localhost:19000`.

**In the Expo Go app:**
1. Scan the QR code from the browser (localhost:19000)
2. Or manually enter the URL `exp://u.expo.dev/...` from logs

### Method 2: Local network

Requires the phone and computer to be on the same WiFi network.

**1. Find your machine's IP:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**2. Export the address for the compose stack:**
```bash
export MOBILE_HOST=192.168.0.31   # replace with your IP
```

There is no repository-root `.env` any more, and writing one would not help: the compose files
live in `infra/`, so that directory is the project directory and compose reads `infra/.env`, never
a root file. Every variable in `docker-compose.preprod.yaml` carries a default
(`MOBILE_HOST` falls back to `192.168.1.100`), and a shell variable beats the default.

**3. Restart the container:**
```bash
task mobile:down
task mobile:up
```

**4. In Expo Go enter:**
```
exp://YOUR_IP:8081
```

---

## 📦 Updating Dependencies

```bash
# Recommended to do on the host (not in the container)
pnpm add expo expo-constants --filter @bitrate/mobile

# Restart the container
task mobile:down && task mobile:up
```

---

## 🔌 Available Ports

| Port | Purpose |
|------|---------|
| 8081 | Metro Bundler |
| 19000 | Expo DevTools (QR code and management) |
| 19001 | Metro UI |
| 19006 | Expo Web version |

---

## 🔍 Debugging the Mobile Container

### Check Metro Bundler

```bash
curl http://localhost:8081/status
```

### Check environment variables

```bash
docker compose -f infra/docker-compose.preprod.yaml exec mobile printenv | grep -E "(EXPO|MOBILE)"
```

### Enter the container

```bash
docker compose -f infra/docker-compose.preprod.yaml exec mobile sh
```

### View Metro logs

```bash
task mobile:logs | grep "Metro\|Bundler\|exp://"
```

### Restart with cache clear

```bash
docker compose -f infra/docker-compose.preprod.yaml exec mobile npx expo start --clear
```

---

## 🐛 Common Issues

### Error: "Failed to download remote update"

**Cause:** Expo Go cannot download the bundle from Metro Bundler.

**Solution:**
- Use tunnel mode (already enabled by default)
- Or make sure the phone is on the same WiFi network and `MOBILE_HOST` is set correctly

### Error: "ERR_PNPM_UNEXPECTED_STORE"

**Cause:** pnpm store conflict between host and container.

**Solution:**
- Update packages on the host, not in the container
- Or rebuild the container:
  `docker compose -f infra/docker-compose.preprod.yaml build --no-cache mobile`

### QR code doesn't appear

**Solution:**
- Open http://localhost:19000 in the browser
- Or use the direct URL from logs

### Application won't load

**Solution:**
```bash
# Check that Metro is running
curl http://localhost:8081/status

# Restart
task mobile:down
task mobile:up
task mobile:logs
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Metro Bundler](https://facebook.github.io/metro/)
- [Expo Go App](https://expo.dev/client)

---

## ⚡ Quick Commands

```bash
task mobile:up      # start
task mobile:logs    # logs
task mobile:qr      # QR code URL
task mobile:down    # stop and remove
```
