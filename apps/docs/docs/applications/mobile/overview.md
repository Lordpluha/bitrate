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
# Start container
docker compose --profile mobile up -d mobile

# View logs
docker compose logs -f mobile
```

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
# Already configured in docker-compose.yaml with --tunnel flag
docker compose logs mobile  # Find URL like exp://u.expo.dev/...

# Open Expo DevTools for QR code
http://localhost:19000
```

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

**2. Create a `.env` file in the project root:**
```bash
echo "MOBILE_HOST=192.168.0.31" >> .env  # replace with your IP
```

**3. Restart the container:**
```bash
docker compose --profile mobile down
docker compose --profile mobile up -d mobile
```

**4. In Expo Go enter:**
```
exp://YOUR_IP:8081
```

---

## 📦 Updating Dependencies

```bash
# Recommended to do on the host (not in the container)
cd apps/mobile
pnpm add expo@~54.0.31 expo-constants@~18.0.13

# Restart container
docker compose restart mobile
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
docker compose exec mobile printenv | grep -E "(EXPO|MOBILE)"
```

### Enter the container

```bash
docker compose exec mobile sh
```

### View Metro logs

```bash
docker compose logs mobile | grep "Metro\|Bundler\|exp://"
```

### Restart with cache clear

```bash
docker compose exec mobile npx expo start --clear
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
- Or rebuild the container: `docker compose build --no-cache mobile`

### QR code doesn't appear

**Solution:**
- Open http://localhost:19000 in the browser
- Or use the direct URL from logs

### Application won't load

**Solution:**
```bash
# Check that Metro is running
curl http://localhost:8081/status

# Restart with cache clear
docker compose down
docker compose --profile mobile up -d mobile
docker compose logs -f mobile
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
# Start
docker compose --profile mobile up -d mobile

# Logs
docker compose logs -f mobile

# Stop
docker compose --profile mobile down

# Restart
docker compose restart mobile

# Enter container
docker compose exec mobile sh
```
