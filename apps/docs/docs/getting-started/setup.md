---
sidebar_position: 3
---

# Setup Guide

Complete guide to setting up your development environment for Bitrate.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** 20.0+ ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v20.0.0 or higher
  ```

- **pnpm** 10.30.3+ ([Installation](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm@10.30.3
  pnpm --version
  ```

- **Git** ([Download](https://git-scm.com/downloads))
  ```bash
  git --version
  ```

### Recommended

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
  - For running PostgreSQL and Redis locally

- **task (go-task)** ([Installation](https://taskfile.dev/installation/))
  - Cross-platform task runner (replaces Makefile)
  - Available via `winget`, `brew`, `scoop`, or binary download

- **VSCode** ([Download](https://code.visualstudio.com/))
  - Recommended extensions:
    - Biome
    - Prisma
    - Tailwind CSS IntelliSense
    - Docker

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Lordpluha/bitrate.git
cd bitrate
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

This will install dependencies for all apps and packages defined in `pnpm-workspace.yaml`.
It also runs `lefthook install` automatically (pre-commit, commit-msg, pre-push hooks).

### 3. Environment Variables

Copy the root `.env.example` for Docker Compose variables:

```bash
cp .env.example .env
```

The API validates its own environment at startup via Zod (`apps/api/env.schema.ts`).
Required variables: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `WEB_HOST`.

### 4. Start Infrastructure

The recommended workflow is a **minimal Docker stack** (postgres + redis only) with apps running natively:

```bash
# Option A: via task (cross-platform)
task infra:up

# Option B: via Docker Compose directly
docker compose -f infra/docker-compose.dev.yaml up -d

# Verify containers are running
docker compose -f infra/docker-compose.dev.yaml ps
```

### 5. Run Database Migrations

```bash
task db:migrate:native
task db:seed:native

# Or without task:
pnpm --filter @bitrate/api run db:migration:start
pnpm --filter @bitrate/api run db:seed
```

### 6. Start Development Servers

#### All Applications at Once

```bash
# From root directory
pnpm dev
```

This starts (via Turbo):
- API on `http://localhost:3000`
- Web Player on `http://localhost:3001`
- Web Artists on `http://localhost:3002`

These are the **native** ports. The Docker stack maps web-artists to `3004` — see
[Docker](../infrastructure/docker.md).

#### Individual Applications

```bash
# Backend API
pnpm --filter @bitrate/api start:dev

# Web Player
pnpm --filter @bitrate/web-player dev

# Mobile Application
pnpm --filter @bitrate/mobile start

# Desktop Application
pnpm --filter @bitrate/desktop tauri dev

# Documentation
pnpm --filter @bitrate/docs start
```

## 🐳 Full Docker Stack (alternative)

If you prefer running all apps in Docker:

```bash
# First run — build images, migrate, seed
task init

# Subsequent runs
task dev:up

# Stop
task dev:down
```

`task` is the only interface to the Docker stack — the old `pnpm docker:*` scripts were
removed. Run `task` with no arguments to list everything.

## 🔧 Development Workflow

### Working with Packages

#### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @bitrate/ui-react build
```

#### Regenerating Assets


After adding SVG icons to `packages/ui-react/assets/icons/` — the svgr plugin in
`vite.config.ts` regenerates `src/icons/svgr/` as part of the build:
```bash
pnpm --filter @bitrate/ui-react build
```

After API schema changes (API must be running on :3000):
```bash
pnpm --filter @bitrate/contracts gen:api
```

### Database Management

#### Prisma Studio (GUI)

```bash
pnpm --filter @bitrate/api run db:ui
# Opens at http://localhost:5555
```

#### Creating Migrations

```bash
# After modifying schema.prisma
pnpm --filter @bitrate/api run db:migration:start
```

#### Resetting Database

```bash
# ⚠️ WARNING: This will delete all data!
pnpm --filter @bitrate/api run db:migration:reset
# or via task (with confirmation prompt):
task db:reset
```

### Running Tests

```bash
# API unit tests
pnpm --filter @bitrate/api test

# API integration tests (needs running DB)
pnpm --filter @bitrate/api test:int

# API E2E tests
pnpm --filter @bitrate/api test:e2e

```

### Linting & Formatting

```bash
# Lint all files (Biome)
pnpm lint

# Format all files (Biome)
pnpm format

# Type checking
pnpm check-types
```

### Committing

Use the interactive Conventional Commits wizard:

```bash
pnpm commit
```

For packages that changed behaviour, also run:

```bash
pnpm changeset
```

## 📱 Mobile Development

### iOS (macOS only)

```bash
pnpm --filter @bitrate/mobile ios
```

### Android

```bash
pnpm --filter @bitrate/mobile android
```

### Expo Go

```bash
pnpm --filter @bitrate/mobile start
# Scan QR code with Expo Go app
```

See [Mobile App Guide](/docs/applications/mobile/overview) for detailed instructions.

## 🖥️ Desktop Development

### System Dependencies

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
<summary><b>macOS</b></summary>

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```
</details>

<details>
<summary><b>Windows</b></summary>

1. Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install [Rust](https://www.rust-lang.org/tools/install)
3. Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
</details>

### Running Desktop App

```bash
# Development mode (native Tauri window)
pnpm --filter @bitrate/desktop tauri dev

# UI only in Docker (no Tauri backend)
docker compose --profile desktop up -d desktop
# Open http://localhost:1420
```

See [Desktop App Guide](/docs/applications/desktop/overview) for detailed instructions.

## 🔍 Debugging

### Backend (API)

```bash
# Debug mode with inspector
pnpm --filter @bitrate/api start:debug
```

**VSCode Debug Configuration:**

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true,
  "sourceMaps": true
}
```

## 🛠️ Useful Commands

### Generate TypeScript Types from Swagger

```bash
# API must be running on :3000
pnpm --filter @bitrate/contracts gen:api
```

### Clean Build Artifacts

```bash
# Cross-platform (uses scripts/clean-dist.mjs)
pnpm clean:dist
# or via task:
task clean:dist
```

### Update Dependencies

```bash
# Check for outdated packages
pnpm outdated -r

# Update all dependencies
pnpm update -r
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Or stop all Docker services
docker compose -f infra/docker-compose.preprod.yaml down
```

### Database Connection Issues

```bash
# Check if postgres is running
docker compose -f infra/docker-compose.dev.yaml ps

# Restart
docker compose -f infra/docker-compose.dev.yaml restart postgres
```

### Prisma Client Out of Sync

```bash
pnpm --filter @bitrate/api run db:gen
```

### node_modules Issues

```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Turbo Cache Issues

```bash
# Run without cache
pnpm turbo build --force
```

## 📚 Next Steps

- **[Architecture](/docs/getting-started/architecture)** — Understand the system design
- **[Backend Guide](/docs/applications/api/overview)** — Deep dive into the API
- **[Web Player Guide](/docs/applications/web-player/overview)** — Frontend development
- **[CLI Tools](/docs/packages/cli-tools)** — Custom build utilities

---

Having issues? Check out [Troubleshooting](#-troubleshooting) or [open an issue](https://github.com/Lordpluha/bitrate/issues).
