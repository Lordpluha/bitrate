# @spotify/desktop

Tauri 2 desktop application for the Spotify Clone.

## Stack

- **Tauri 2** — Rust backend + system WebView
- **React 19 + Vite** — frontend (TypeScript)
- **`@tauri-apps/api` v2** — Tauri JS bindings
- **Port:** 1420 (Vite dev server)

```
src/           — React frontend (TypeScript)
src-tauri/     — Rust backend
  src/         — Rust source
  tauri.conf.json
  Cargo.toml
```

## Requirements

**Linux (Ubuntu/Debian):**
```bash
sudo apt install -y libwebkit2gtk-4.1-dev build-essential libssl-dev libgtk-3-dev librsvg2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**macOS:**
```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Windows:** Use WSL2 (recommended). See the main [README](../../README.md) for full setup.

## Getting Started

```bash
# From repo root
pnpm install

# Full Tauri app (recommended)
pnpm --filter @spotify/desktop tauri dev

# Frontend only (no Tauri window)
pnpm --filter @spotify/desktop dev
```

Or inside `apps/desktop/`:

```bash
pnpm tauri dev   # full Tauri app
pnpm dev         # Vite frontend only at http://localhost:1420
```

## Docker Options

**Frontend only (no Rust):**
```bash
docker compose --profile desktop up -d desktop
# Open http://localhost:1420
```

**Full GUI via VNC (browser-based):**
```bash
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
# Open http://localhost:6080/vnc.html  (password: spotify)
```

See [VNC-README.md](VNC-README.md) for VNC setup details.

## Build

```bash
pnpm --filter @spotify/desktop tauri build
```

Produces platform-native installers in `src-tauri/target/release/bundle/`.
