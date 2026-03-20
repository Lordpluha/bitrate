# Music Platform (Spotify Clone)

## 📚 Documentation

### Main documentation
- **[README.md](README.md)** - main documentation (you are here)
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - contributor guide
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - code of conduct
- **[SECURITY.md](SECURITY.md)** - security policy

### 📋 Planning and architecture
- **[🗺️ Roadmap](apps/docs/docs/ROADMAP.md)** - project roadmap with milestones
- **[⚙️ Workflows](.github/WORKFLOWS.md)** - CI/CD documentation

### Applications
- **[MOBILE.md](apps/docs/docs/MOBILE.md)** - detailed Mobile documentation
- **[DESKTOP.md](apps/docs/docs/DESKTOP.md)** - detailed Desktop documentation

## 🔗 Useful links

- **GitHub Project** - https://github.com/users/Lordpluha/projects/6
- **Chromatic** - https://www.chromatic.com/library?appId=68787858d0b6a0a00b0ca47f
- **Storybook** - https://spotify-clone-ui-git-develop-vladyslavs-projects-cc52700b.vercel.app/
- **Web App** - https://spotify-clone-web-olive.vercel.app/

---

# 🚀 Quick Start

## 💻 System requirements

### Minimum requirements

- **CPU:** 4 cores (8+ recommended)
- **RAM:** 8 GB (16+ GB recommended for Docker)
- **Disk:** 80+ GB free space (for all Docker images)
- **OS:** Linux, macOS, Windows 10/11 with WSL2

---

## 📦 Dependencies by application

### 🌐 Common dependencies (for all applications)

Required to work with any part of the project:

| Tool | Version | Installation |
|------------|--------|-----------|
| **Node.js** | >= 20.x | [Linux](#linux-nodejs) • [Windows](#windows-nodejs) • [macOS](#macos-nodejs) |
| **pnpm** | 10.27.0 | `npm install -g pnpm@10.27.0` |
| **Git** | >= 2.x | [git-scm.com](https://git-scm.com/) |
| **Docker** | >= 24.x | [Linux](#linux-docker) • [Windows](#windows-docker) • [macOS](#macos-docker) |
| **Docker Compose** | >= 2.x | Included with Docker |

---

## 📲 Additional dependencies

### 📱 Mobile App (React Native + Expo)

<details>
<summary><b>For Android development</b></summary>

**All platforms:**

1. **Android Studio**
   - Linux: [developer.android.com/studio](https://developer.android.com/studio)
   - Windows: [developer.android.com/studio](https://developer.android.com/studio)
   - macOS: `brew install --cask android-studio`

2. **Java Development Kit 17**
   - Linux: `sudo apt install -y openjdk-17-jdk`
   - Windows: [adoptium.net](https://adoptium.net/)
   - macOS: `brew install openjdk@17`

3. **Android SDK** (installed via Android Studio)

4. **Android Emulator** (via Android Studio) or a physical device
</details>

<details>
<summary><b>For iOS development (macOS only)</b></summary>

1. **Xcode** (from the App Store)
   ```bash
   xcode-select --install
   ```

2. **iOS Simulator** (included in Xcode)

3. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
</details>

**For testing on a physical device:**

- Install **Expo Go** on your phone:
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**Run options:**

1. **Docker (Metro Bundler + tunnel only):**
   ```bash
   docker compose --profile mobile up -d mobile
   # Open http://localhost:19000 for the QR code
   ```

2. **Native (recommended):**
   ```bash
   cd apps/mobile
   pnpm install
   pnpm start
   ```

**⚠️ Recommendation:** For Mobile development, use native execution. Docker is mainly for demos.

---

### 🖥️ Desktop App (Tauri + React)

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
# System libraries for WebView
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

# Tauri CLI (installed automatically during pnpm install)
```
</details>

<details>
<summary><b>Windows</b></summary>

**⚠️ Windows developers are strongly recommended to use WSL2!**

**Quick WSL2 setup:**

```powershell
# PowerShell as Administrator
wsl --install
# Reboot your computer
```

**Inside WSL2 (after installation):**

```bash
# Install dependencies (same as Linux)
sudo apt update
sudo apt install -y build-essential libwebkit2gtk-4.1-dev curl

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

<details>
<summary><i>Alternative: Native Windows (not recommended)</i></summary>

1. **Visual Studio 2022 Build Tools**
   - Download from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/downloads/)
   - Select "Desktop development with C++"

2. **WebView2 Runtime** (usually already installed on Windows 11)
   - Download from [microsoft.com](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

3. **Rust**
   ```powershell
   # Download rustup-init.exe from https://rustup.rs/
   # Run the installer and follow the instructions
   ```

4. **After installation, verify:**
   ```powershell
   rustc --version
   cargo --version
   ```
</details>

</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Xcode Command Line Tools
xcode-select --install

# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Tauri CLI (installed automatically during pnpm install)
```
</details>

**Run options:**

1. **Native (recommended):**
   ```bash
   cd apps/desktop
   pnpm install
   pnpm dev  # Starts Tauri app with a native window
   ```

2. **Docker UI only (without Tauri backend):**
   ```bash
   docker compose --profile desktop up -d desktop
   # Open http://localhost:1420 in your browser
   ```

3. **Docker with VNC (full GUI in browser):**
   ```bash
   cd apps/desktop
   docker compose -f docker-compose.vnc.yml up --build
   # Open http://localhost:6080/vnc.html
   # Password: spotify
   ```

**⚠️ Recommendation:** For Desktop development, use native execution. Docker VNC is useful for CI/CD and demos.

---

## 📥 Installation

After installing all required system dependencies, install project dependencies:

```bash
# Install dependencies
pnpm install
```

### 🪟 Windows developers

**WSL2 is recommended** for better compatibility and performance:

1. Install WSL2: `wsl --install` (PowerShell as Administrator)
2. Clone the project **inside WSL**: `cd ~ && git clone ...`
3. Work in a WSL terminal - all commands behave like Linux

**If you do NOT use WSL2:**
- Before `git push`, remove `dist` via Docker: `docker compose down && docker compose run --rm api sh -c "find /app -type d -name 'dist' -exec rm -rf {} +"`

---

## ✅ Installation check

After installing required dependencies for your app, verify versions:

### Common tools (for all)

```bash
node --version          # >= v20.x
pnpm --version          # 10.27.0
git --version           # >= 2.x
docker --version        # >= 24.x
docker compose version  # >= 2.x
```

### For the Mobile app

```bash
java --version          # 17.x (for Android)
```

### For the Desktop app

```bash
rustc --version         # any stable version
cargo --version         # any stable version
```

If all required commands run successfully, you are ready to develop! ✨

---

## 🛠️ Development

You can run the project in three ways:

### 📦 Option 1: Native (without Docker)

For local development without Docker:

```bash
# 1. Start only the database
docker-compose -f docker-compose.minimal.yaml up -d

# 2. Start all applications
pnpm dev

# Service access:
# - API: http://localhost:3000
# - Web: http://localhost:3001
# - Admin: http://localhost:3002
```

### 🐳 Option 2: Full Docker (recommended)

#### Using Makefile (Linux/macOS/WSL)

```bash
# First run (build + migrations + seed)
make init

# Subsequent runs
make dev

# Stop
make stop

# View logs
make logs

# Database migrations
make db-migrate

# Seed test data
make db-seed

# Full command list
make help
```

#### Using pnpm scripts (cross-platform)

```bash
# First run
pnpm docker:dev:build
pnpm docker:db:migrate
pnpm docker:db:seed

# Subsequent runs
pnpm docker:dev

# Stop
pnpm docker:down

# View logs
pnpm docker:logs          # all logs
pnpm docker:logs:api      # API only
pnpm docker:logs:web      # Web only

# Database migrations
pnpm docker:db:migrate
pnpm docker:db:seed

# Interactive management
pnpm docker:manage
```

#### Using Docker Compose directly

```bash
# First run
docker-compose up -d --build
docker-compose exec api pnpm --filter @spotify/api run db:migration:start
docker-compose exec api pnpm --filter @spotify/api run seed

# Subsequent runs
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Migrations
docker-compose exec api pnpm --filter @spotify/api run db:migration:start
```

### 📱 Mobile & Desktop (optional)

#### 📱 Mobile (React Native + Expo)

**⚠️ Important:** Native execution is recommended for mobile development.

**Quick start:**

```bash
# Docker (Metro Bundler + Tunnel)
docker compose --profile mobile up -d mobile
# Open http://localhost:19000 for the QR code

# Native (recommended)
cd apps/mobile && pnpm start
```

**Connect:**
- Install [Expo Go](https://expo.dev/client) on your phone
- Scan the QR code from http://localhost:19000
- Or enter the tunnel URL from logs

📚 **[Detailed documentation →](docs/MOBILE.md)**

---

#### 🖥️ Desktop (Tauri + React)

**3 run options:**

**1. Local (recommended):**
```bash
cd apps/desktop && pnpm dev
```

**2. Docker UI only:**
```bash
docker compose --profile desktop up -d desktop
# Open http://localhost:1420
```

**3. Docker VNC (full GUI):**
```bash
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
# Open http://localhost:6080/vnc.html (password: spotify)
```

📚 **[Detailed documentation →](docs/DESKTOP.md)** • **[VNC Guide →](apps/desktop/VNC-README.md)**

## 🌐 Service access

| Service | URL | Port |
|--------|-----|------|
| Web Frontend | http://localhost:3001 | 3001 |
| API Backend | http://localhost:3000 | 3000 |
| API Docs (Swagger) | http://localhost:3000/swagger | - |
| Admin Panel | http://localhost:3002 | 3002 |
| Mobile (Metro) | http://localhost:8081 | 8081 |
| Mobile (DevTools) | http://localhost:19000 | 19000 |
| Desktop (Vite) | http://localhost:1420 | 1420 |
| Desktop VNC (noVNC) | http://localhost:6080/vnc.html | 6080 |
| Desktop VNC | vnc://localhost:5900 | 5900 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

## 📦 Docker image sizes

Approximate image sizes after build:

| Image | Size | Description |
|-------|--------|----------|
| `desktop-desktop-vnc` | ~12.5 GB | Desktop with VNC (includes Rust, Tauri, X11, VNC server) |
| `spotify-clone-mobile` | ~10 GB | Mobile (Node.js, Expo, React Native dependencies) |
| `spotify-clone-api` | ~9.4 GB | Backend API (NestJS, Prisma, dependencies) |
| `spotify-clone-web` | ~9.5 GB | Web Frontend (Next.js, React, dependencies) |
| `spotify-clone-admin` | ~9.4 GB | Admin Panel (Kottster, dependencies) |
| `spotify-clone-desktop` | ~9.4 GB | Desktop UI only (Vite, React) |
| `postgres:16-alpine` | ~280 MB | PostgreSQL database |
| `redis:7-alpine` | ~41 MB | Redis for caching |

**Total:** ~70 GB for all images (full build of all services)

**Space-saving recommendations:**

```bash
# Use a minimal development setup
docker compose -f docker-compose.minimal.yaml up -d  # Only postgres + redis (~320 MB)

# Start only required services
docker compose up -d api web  # API + Web (~20 GB)

# Remove unused images
docker image prune -a

# Full cleanup (careful!)
docker system prune -af --volumes
```

---

## 🛠️ Useful commands

### Makefile commands

```bash
make dev              # Start development
make stop             # Stop all services
make restart          # Restart
make logs             # View logs
make db-migrate       # Apply migrations
make db-seed          # Seed database
make db-studio        # Open Prisma Studio
make clean            # Clean volumes
make prod             # Start production
```

### npm/pnpm scripts

```bash
pnpm dev                    # Start all apps (native)
pnpm build                  # Build all apps
pnpm lint                   # Lint
pnpm format                 # Format
pnpm docker:dev             # Docker development
pnpm docker:manage          # Interactive Docker management
```

### Database commands

```bash
# Via Makefile
make db-migrate       # Apply migrations
make db-seed          # Seed test data
make db-studio        # Open Prisma Studio
make db-backup        # Create backup

# Via pnpm
pnpm docker:db:migrate
pnpm docker:db:seed
pnpm docker:db:studio

# Directly in API
cd apps/api
pnpm run db:migration:start
pnpm run seed
pnpm run db:ui
```

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware, TypeScript, PWA
- TurboBuild
- TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Feature-Sliced Design
- Sentry
#### Testing
- Vitest (Unit)
- RTL (Intergration)
- msw + openapi-msw (mocks)
- Playwright (E2E)

### Android
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io
- Sentry
#### Testing
- Jest (Unit)
- RTL/Native (Integration)
- detox (E2E)

### iOS
- Flutter
- Sentry
#### Testing
- Flutter testing utils

### MacOS
- Flutter
- Sentry
#### Testing
- Flutter testing utils

### Windows
- Tauri

### Linux
- Tauri

### Admin Panel
- Kottster app based on postgresql schema

### Backend
- NestJS, TypeScript
- PostgreSQL via Prisma
- REST API, SSE, Socket.io, Long-polling, RabbitMQ
- JWT, OAuth(google, facebook, discord), CORS, CSP, 2FA, Redis
- Swagger + Zod (codegen sync)
- Postfix + NodeMailer, Multer
- @nestjs/throttler, Fingerprint auth
- ConfigModule, @nestjs/schedule (CRON)
- Prometheus + Grafana, nestjs-pino
- Sentry
#### Testing
- Jest
#### Security
- SHA-3
- CSP
- Helmet
- Rate-limitting + Ip-ban
- SSL/TLS
- CSRF
- Global error filters throught `@Catch`
- Files security
- Cloudflare
- RBAC/ACL


### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: Biome
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `redis-cli --rdb`
- Docs: Mintlify

### Future features
- Microservices, Micro-Frontends
- CDN + S3, Logs, Metrics

---

## 🐛 Troubleshooting

### EACCES: permission denied on git push

Docker containers may create files in `dist/` as root/nfsnobody. Before `git push`:

```bash
pnpm clean:dist
git push
```

### Ports are busy

```bash
# Find the process using the port
sudo lsof -i :3000

# Stop all Docker services
docker compose down
```

### Database issues

```bash
# Recreate DB
docker compose down -v
docker compose up -d postgres
docker compose exec api pnpm --filter @spotify/api run db:migration:start
```

### Docker cleanup

```bash
# Remove unused images
docker image prune -a

# Rebuild without cache
docker compose build --no-cache
```

---

## 📄 License

MIT © 2025 Lordpluha
