---
sidebar_position: 1
---

# Desktop App Overview

Complete guide for developing and running the Tauri desktop application.

## 📋 Table of Contents

- [🚀 Run Options](#-run-options)
  - [Local Run](#option-1-local-run-recommended)
  - [Docker UI only](#option-2-docker-ui-only)
  - [Docker with VNC](#option-3-docker-with-vnc)
- [🔌 Available Ports](#-available-ports)
- [⚙️ Management Commands (VNC)](#️-management-commands-vnc)
- [🔧 Configuration](#-configuration)
- [🔍 Debugging](#-debugging)
- [🐛 Common Issues](#-common-issues)
- [📊 Options Comparison](#-options-comparison)

---

## 🚀 Run Options

The desktop application can be run in three ways:

### Option 1: Local Run (recommended)

**Install system dependencies (once):**

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  pkg-config

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```
</details>

<details>
<summary><b>Windows</b></summary>

1. **Visual Studio 2022 Build Tools**
   - Download from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/)
   - Select "Desktop development with C++"

2. **WebView2 Runtime** (usually already installed on Windows 11)
   - Download from [microsoft.com](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

3. **Rust**
   - Download rustup-init.exe from https://rustup.rs/
   - Run the installer
</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Xcode Command Line Tools
xcode-select --install

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```
</details>

**Run the application:**

```bash
pnpm install
pnpm --filter @bitrate/desktop tauri dev   # native window, Rust side included
```

`pnpm --filter @bitrate/desktop dev` is **not** the same thing: that script is plain `vite`, so it
serves the renderer on `http://localhost:1420` and starts no Tauri process and no native window.

**Advantages:**
- ✅ Full Tauri functionality
- ✅ GPU hardware acceleration
- ✅ Fast hot reload
- ✅ Access to all native APIs

---

### Option 2: Docker UI only

Runs only the Vite dev server without the Tauri backend.

```bash
task desktop:up     # start the Vite dev server in a container
task desktop:logs   # tail its logs
```

Then open `http://localhost:1420`. `Taskfile.yml` is the only supported interface to Docker here —
a bare `docker compose` fails from the repository root, because the compose files live in `infra/`.

**Limitations:**
- ✅ Shows React UI
- ❌ No Tauri backend
- ❌ No access to native APIs

---

### Option 3: Docker with VNC

Full Tauri application with GUI access via browser.

#### Quick Start

```bash
# Stop the regular desktop container if running
task desktop:down

# Start the VNC version
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
```

**⏱️ First build will take ~5-10 minutes** (downloading dependencies, compiling Rust).

#### Accessing the application

**1. noVNC (browser) - easiest**

```
http://localhost:6080/vnc.html
```

- Click "Connect"
- Enter password: `bitrate`
- You will see the desktop with the Tauri application

**2. VNC client (RealVNC, TigerVNC, Remmina)**

```
vnc://localhost:5900
```

- Password: `bitrate`

---

## 🔌 Available Ports

### For Option 2 (Docker UI only)

| Port | Purpose |
|------|---------|
| 1420 | Vite dev server |

### For Option 3 (Docker VNC)

| Port | Purpose |
|------|---------|
| 5900 | VNC server |
| 6080 | noVNC (web interface) |
| 1421 | Vite dev server |

---

## ⚙️ Management Commands (VNC)

```bash
# Start in background
docker compose -f docker-compose.vnc.yml up -d --build

# View logs
docker compose -f docker-compose.vnc.yml logs -f

# Stop
docker compose -f docker-compose.vnc.yml down

# Enter container
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash

# Rebuild without cache
docker compose -f docker-compose.vnc.yml build --no-cache
```

---

## 🔧 Configuration

### Changing screen resolution (VNC)

In `apps/desktop/docker-compose.vnc.yml`:

```yaml
environment:
  - RESOLUTION=1920x1080x24  # change to desired
```

Available resolutions:
- `1920x1080x24` (Full HD)
- `1280x720x24` (HD)
- `2560x1440x24` (2K)
- `3840x2160x24` (4K)

---

## 🔍 Debugging

### Check processes (VNC)

```bash
docker compose -f docker-compose.vnc.yml exec desktop-vnc ps aux | grep -E "Xvfb|x11vnc|tauri"
```

### Manual application start

```bash
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash
cd /app/apps/desktop
pnpm tauri dev
```

### Check VNC

```bash
curl http://localhost:6080
```

### View Tauri logs

```bash
docker compose -f docker-compose.vnc.yml logs | grep tauri
```

---

## 🐛 Common Issues

### Black screen in VNC

**Cause:** Xvfb starts slowly on first boot.

**Solution:**
- Wait 30-60 seconds after connecting
- Check logs: `docker compose -f docker-compose.vnc.yml logs -f`
- Make sure Xvfb is running:
  `docker compose -f docker-compose.vnc.yml exec desktop-vnc ps aux | grep Xvfb`

### Error "port is already allocated"

**Cause:** Port is occupied by another container.

**Solution:**
```bash
# Stop the regular desktop container
task desktop:down

# Or change ports in docker-compose.vnc.yml
```

### Application doesn't appear

**Cause:** Tauri did not start or crashed.

**Solution:**
```bash
# Check if Tauri started
docker compose -f docker-compose.vnc.yml logs | grep tauri

# Enter container and start manually
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash
cd /app/apps/desktop
pnpm tauri dev
```

### VNC won't connect

**Solution:**
```bash
# Check if container is running
docker compose -f docker-compose.vnc.yml ps

# Check VNC server logs
docker compose -f docker-compose.vnc.yml logs | grep x11vnc

# Restart
docker compose -f docker-compose.vnc.yml restart
```

### Slow performance

**Cause:** VNC runs without GPU acceleration.

**Solution:**
- This is expected for VNC mode
- For fast development, use local execution
- VNC is intended for CI/CD or demonstrations

---

## 📊 Options Comparison

| Method | Tauri Backend | GUI | Hot Reload | Complexity | Speed | Image Size |
|--------|---------------|-----|------------|------------|-------|------------|
| **Local** | ✅ | ✅ | ✅ | Low | Fast | - |
| **Docker UI** | ❌ | Browser | ✅ | Low | Fast | ~9.4 GB |
| **Docker VNC** | ✅ | ✅ | ✅ | Medium | Slow | ~12.5 GB |

### When to use each option

**Local run:**
- ✅ Daily development
- ✅ Debugging Tauri functionality
- ✅ Fast iteration

**Docker UI only:**
- ✅ Testing React components
- ✅ UI development without Tauri
- ✅ Quick preview of changes

**Docker VNC:**
- ✅ CI/CD GUI testing
- ✅ Application demonstrations
- ✅ Development on a remote server
- ✅ No local GUI environment

---

## 📚 Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Documentation](https://doc.rust-lang.org/)
- VNC README (`apps/desktop/VNC-README.md`) - detailed VNC documentation
- [Vite Documentation](https://vitejs.dev/)

---

## ⚡ Quick Commands

### Local run
```bash
pnpm --filter @bitrate/desktop tauri dev
```

### Docker UI
```bash
task desktop:up
```

### Docker VNC
```bash
cd apps/desktop && docker compose -f docker-compose.vnc.yml up --build
```

### Stop
```bash
task desktop:down
# or, for the VNC stack
cd apps/desktop && docker compose -f docker-compose.vnc.yml down
```
