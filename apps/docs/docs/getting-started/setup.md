---
sidebar_position: 3
---

# Setup Guide

Complete guide to setting up your development environment for Spotify Clone.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** 20.0+ ([Download](https://nodejs.org/))
  ```bash
  node --version  # Should be v20.0.0 or higher
  ```

- **pnpm** 10.28.1+ ([Installation](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm@10.28.1
  pnpm --version
  ```

- **Git** ([Download](https://git-scm.com/downloads))
  ```bash
  git --version
  ```

### Recommended

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
  - For running PostgreSQL, Redis, MinIO locally
  - Optional if you prefer native installations

- **VSCode** ([Download](https://code.visualstudio.com/))
  - Recommended extensions:
    - Biome
    - Prisma
    - ESLint
    - Tailwind CSS IntelliSense
    - Docker

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Lordpluha/spotify-clone.git
cd spotify-clone
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

This will install dependencies for all apps and packages defined in `pnpm-workspace.yaml`.

### 3. Environment Variables

Create `.env` files for applications that need them:

```bash
# Backend API
cp apps/api/.env.example apps/api/.env

# Web Application
cp apps/web/.env.example apps/web/.env

# Mobile (if needed)
cp apps/mobile/.env.example apps/mobile/.env
```

#### API Environment Variables

Edit `apps/api/.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spotify_clone?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Application
NODE_ENV="development"
PORT=3000

# File Storage
UPLOAD_DIR="./storage/uploads"
MAX_FILE_SIZE=104857600  # 100MB

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

#### Web Environment Variables

Edit `apps/web/.env.local`:

```bash
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"

# WebSocket URL
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

### 4. Start Database

#### Option A: Docker (Recommended)

```bash
# Start PostgreSQL + Redis + MinIO
docker compose up -d postgres redis minio

# Verify containers are running
docker compose ps
```

#### Option B: Native Installation

Install PostgreSQL 15+ and create a database:

```bash
# Ubuntu/Debian
sudo apt install postgresql-15

# macOS
brew install postgresql@15

# Create database
createdb spotify_clone
```

### 5. Run Database Migrations

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma Client
pnpm db:gen

# Run migrations
pnpm db:migration:start

# Seed the database with sample data
pnpm db:seed
```

### 6. Start Development Servers

#### All Applications at Once

```bash
# From root directory
pnpm dev
```

This starts:
- API on `http://localhost:3000`
- Web on `http://localhost:3001`
- Docs on `http://localhost:3002`

#### Individual Applications

```bash
# Backend API
pnpm --filter @spotify/api start:dev

# Web Application
pnpm --filter @spotify/web dev

# Mobile Application
pnpm --filter @spotify/mobile start

# Desktop Application
pnpm --filter @spotify/desktop tauri dev

# Admin Panel
pnpm --filter @spotify/admin dev

# Documentation
pnpm --filter @spotify/docs start
```

## 🔧 Development Workflow

### Working with Packages

#### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @spotify/ui-react build

# Build with Turbo cache
pnpm turbo build
```

#### Watching for Changes

```bash
# Watch mode for UI components
pnpm --filter @spotify/ui-react dev
```

### Database Management

#### Prisma Studio (GUI)

```bash
cd apps/api
pnpm db:ui
```

Opens Prisma Studio at `http://localhost:5555`

#### Creating Migrations

```bash
cd apps/api

# After modifying schema.prisma
pnpm db:migration:start

# Name your migration
# Migration will be created in prisma/migrations/
```

#### Resetting Database

```bash
cd apps/api

# ⚠️ WARNING: This will delete all data!
pnpm db:migration:reset
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @spotify/api test

# Watch mode
pnpm --filter @spotify/api test:watch

# Coverage
pnpm --filter @spotify/api test:cov
```

### Linting & Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Specific app
pnpm --filter @spotify/web lint
pnpm --filter @spotify/web format
```

## 🐳 Docker Development

### Full Stack with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after changes
docker compose up -d --build
```

### Individual Services

```bash
# Start only API
docker compose up -d api

# Start only Web
docker compose up -d web

# Start only Database
docker compose up -d postgres
```

### Docker Commands

```bash
# View running containers
docker compose ps

# Execute command in container
docker compose exec api pnpm db:migration:start

# View logs for specific service
docker compose logs -f api

# Restart service
docker compose restart api

# Remove all containers and volumes
docker compose down -v
```

## 📱 Mobile Development

### iOS (macOS only)

```bash
cd apps/mobile

# Install CocoaPods dependencies
npx pod-install

# Start Metro bundler
pnpm start

# Run on iOS simulator
pnpm ios

# Run on device
pnpm ios --device
```

### Android

```bash
cd apps/mobile

# Start Metro bundler
pnpm start

# Run on Android emulator
pnpm android

# Run on device
pnpm android --device
```

### Expo Go

```bash
cd apps/mobile
pnpm start

# Scan QR code with Expo Go app
# iOS: Camera app
# Android: Expo Go app
```

See [Mobile App Guide](/mobile) for detailed instructions.

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
cd apps/desktop

# Development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

See [Desktop App Guide](/desktop) for detailed instructions.

## 🔍 Debugging

### Backend (API)

```bash
# Debug mode with inspector
pnpm --filter @spotify/api start:debug

# Attach debugger in VSCode
# Press F5 or use "Attach to Node Process"
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

### Frontend (Web)

Use React DevTools and Next.js built-in debugging:

```bash
# Development mode includes source maps
pnpm --filter @spotify/web dev

# Debug in browser
# Open DevTools → Sources → Set breakpoints
```

### Mobile (React Native)

```bash
# Enable React Native Debugger
# Shake device → "Debug"
# Or press Cmd+D (iOS) / Cmd+M (Android)

# Use Flipper for advanced debugging
npx flipper
```

## 🛠️ Useful Commands

### Generate API Documentation

```bash
cd apps/api
pnpm doc:gen

# Opens at http://localhost:8080
```

### Generate TypeScript Types

```bash
# For UI components
pnpm --filter @spotify/ui-react build

# For API contracts
pnpm --filter @spotify/contracts build
```

### Clean Build Artifacts

```bash
# Clean all build outputs
pnpm clean

# Clean and rebuild
pnpm clean && pnpm build
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update -r

# Update specific package
pnpm --filter @spotify/web update next

# Check for outdated packages
pnpm outdated -r
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Prisma Client Out of Sync

```bash
cd apps/api
pnpm db:gen
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
# Clear Turbo cache
pnpm turbo clean

# Run without cache
pnpm turbo build --force
```

## 📚 Next Steps

- **[Architecture](/architecture)** - Understand the system design
- **[Backend Guide](/backend)** - Deep dive into the API
- **[Web Guide](/web)** - Frontend development
- **[CLI Tools](/cli-tools)** - Custom build utilities

---

Having issues? Check out [Troubleshooting](#-troubleshooting) or [open an issue](https://github.com/Lordpluha/spotify-clone/issues).