---
sidebar_position: 1
---

# Introduction

**Bitrate** is a full-featured music streaming platform built from scratch using modern technologies. This project demonstrates best practices in monorepo architecture, microservices, and cross-platform development.

## 🎯 Project Overview

This is a comprehensive music streaming service including:

- 🎵 **Backend API** - NestJS REST API with PostgreSQL
- 🌐 **Web Application** - Next.js with React 19
- 📱 **Mobile App** - React Native with Expo
- 🖥️ **Desktop App** - Tauri-based native application
- 📚 **Documentation** - You're reading it!

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.0 or above
- **pnpm** 10.28.1 or above
- **Docker** & Docker Compose (optional, for containerized development)
- **PostgreSQL** 15+ (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/Lordpluha/bitrate.git
cd bitrate

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start PostgreSQL + Redis (minimal local stack)
docker-compose -f infra/docker-compose.dev.yaml up -d

# Run database migrations
pnpm --filter @bitrate/api db:migration:start

# Seed the database
pnpm --filter @bitrate/api db:seed
```

### Development

```bash
# Start all applications
pnpm dev

# Or start individual apps
pnpm --filter @bitrate/api start:dev      # Backend API
pnpm --filter @bitrate/web-player dev     # Web player
pnpm --filter @bitrate/mobile start       # Mobile app
pnpm --filter @bitrate/desktop tauri dev  # Desktop app
```

## 📖 Documentation Structure

### Getting Started
- **[Introduction](/docs/getting-started/introduction)** - Project overview (you are here)
- **[Architecture](/docs/getting-started/architecture)** - System architecture and design decisions
- **[Development Setup](/docs/getting-started/setup)** - Detailed setup guide

### Applications
- **[Backend API](/docs/applications/api/overview)** - NestJS API documentation
- **[Web Player](/docs/applications/web-player/overview)** - Next.js web app guide
- **[Mobile App](/docs/applications/mobile/overview)** - React Native development
- **[Desktop App](/docs/applications/desktop/overview)** - Tauri desktop application

### Advanced
- **[CLI Tools](/docs/packages/cli-tools)** - Custom build tools and utilities
- **[Deployment](/docs/infrastructure/deployment)** - Production deployment guide
- **[API Reference](/docs/applications/api/reference)** - Complete API documentation

### Project Planning
- **[Roadmap](/docs/guides/roadmap)** - Development roadmap and milestones

## 🛠️ Technology Stack

### Backend
- **NestJS** - Modular Node.js framework
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM
- **BullMQ** - Job queue for background tasks
- **WebSockets** - Real-time synchronization

### Frontend
- **Next.js** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS v4** - Utility-first CSS (Rust-based)
- **TypeScript** - Type safety across the stack

### Mobile & Desktop
- **React Native** - Cross-platform mobile development
- **Expo** - Development toolchain
- **Tauri** - Lightweight desktop framework

### DevOps
- **pnpm workspaces** - Monorepo package management
- **Turbo** - Incremental builds
- **Biome** - Fast linting and formatting
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipelines

## 🎨 Key Features

- ✅ **Real-time Music Streaming** - Stream audio with low latency
- ✅ **User Authentication** - JWT-based auth with refresh tokens
- ✅ **Playlists & Collections** - Organize music your way
- ✅ **Cross-device Sync** - Seamless playback across devices
- ✅ **Audio Conversion** - Automatic conversion to OGG Opus
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Type-safe API** - Shared contracts between frontend and backend

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Lordpluha/bitrate/blob/develop/CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs via [GitHub Issues](https://github.com/Lordpluha/bitrate/issues)
- 💡 Suggest features or improvements
- 🔀 Submit Pull Requests
- 📖 Improve documentation
- ⭐ Star the repository

## 📝 License

This project is licensed under the UNLICENSED license - see the [LICENSE](https://github.com/Lordpluha/bitrate/blob/develop/LICENSE) file for details.

## 🔗 Links

- **GitHub Repository:** [github.com/Lordpluha/bitrate](https://github.com/Lordpluha/bitrate)
- **Blog:** [Blog](/blog) - Development updates and technical insights

---

Ready to dive in? Check out the [Development Setup](/docs/getting-started/setup) guide to get started!
