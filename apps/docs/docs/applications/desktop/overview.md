---
sidebar_position: 1
---

# Desktop App Overview

Complete guide for developing and running the Tauri desktop application.

## 📋 Table of Contents

- [🚀 Run Options](#-run-options)
  - [Local Run](#option-1-local-run-recommended)
  - [Docker UI only](#option-2-docker-ui-only)
- [🔌 Available Ports](#-available-ports)
- [📊 Options Comparison](#-options-comparison)

---

## 🚀 Run Options

The desktop application can be run in two ways:

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

## 🔌 Available Ports

### For Option 2 (Docker UI only)

| Port | Purpose |
|------|---------|
| 1420 | Vite dev server |

---

## 📊 Options Comparison

| Method | Tauri Backend | GUI | Hot Reload | Complexity | Speed | Image Size |
|--------|---------------|-----|------------|------------|-------|------------|
| **Local** | ✅ | ✅ | ✅ | Low | Fast | - |
| **Docker UI** | ❌ | Browser | ✅ | Low | Fast | ~9.4 GB |

### When to use each option

**Local run:**
- ✅ Daily development
- ✅ Debugging Tauri functionality
- ✅ Fast iteration

**Docker UI only:**
- ✅ Testing React components
- ✅ UI development without Tauri
- ✅ Quick preview of changes

---

## 📚 Additional Resources

- [Tauri Documentation](https://tauri.app/)
- [Rust Documentation](https://doc.rust-lang.org/)
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

### Stop
```bash
task desktop:down
```
