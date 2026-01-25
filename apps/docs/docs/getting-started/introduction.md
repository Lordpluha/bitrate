---
sidebar_position: 1
---

# Introduction

**Spotify Clone** is a full-featured music streaming platform built from scratch using modern technologies. This project demonstrates best practices in monorepo architecture, microservices, and cross-platform development.

## 🎯 Project Overview

This is a comprehensive music streaming service including:

- 🎵 **Backend API** - NestJS REST API with PostgreSQL
- 🌐 **Web Application** - Next.js with React 19
- 📱 **Mobile App** - React Native with Expo
- 🖥️ **Desktop App** - Tauri-based native application
- ⚙️ **Admin Panel** - Kottster-based management interface
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
git clone https://github.com/Lordpluha/spotify-clone.git
cd spotify-clone

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start PostgreSQL (via Docker)
docker compose up -d postgres

# Run database migrations
pnpm --filter @spotify/api db:migration:start

# Seed the database
pnpm --filter @spotify/api db:seed
```

### Development

```bash
# Start all applications
pnpm dev

# Or start individual apps
pnpm --filter @spotify/api start:dev      # Backend API
pnpm --filter @spotify/web dev            # Web app
pnpm --filter @spotify/mobile start       # Mobile app
pnpm --filter @spotify/desktop tauri dev  # Desktop app
```

## 📖 Documentation Structure

### Getting Started
- **[Introduction](/docs/getting-started/introduction)** - Project overview (you are here)
- **[Architecture](/docs/getting-started/architecture)** - System architecture and design decisions
- **[Development Setup](/docs/getting-started/setup)** - Detailed setup guide

### Applications
- **[Backend API](/docs/applications/api/overview)** - NestJS API documentation
- **[Web Application](/docs/applications/web/overview)** - Next.js web app guide
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
- **Next.js 15** - React framework with App Router
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

We welcome contributions! Please see our [Contributing Guide](https://github.com/Lordpluha/spotify-clone/blob/develop/CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs via [GitHub Issues](https://github.com/Lordpluha/spotify-clone/issues)
- 💡 Suggest features or improvements
- 🔀 Submit Pull Requests
- 📖 Improve documentation
- ⭐ Star the repository

## 📝 License

This project is licensed under the UNLICENSED license - see the [LICENSE](https://github.com/Lordpluha/spotify-clone/blob/develop/LICENSE) file for details.

## 🔗 Links

- **GitHub Repository:** [github.com/Lordpluha/spotify-clone](https://github.com/Lordpluha/spotify-clone)
- **Blog:** [Blog](/blog) - Development updates and technical insights

---

Ready to dive in? Check out the [Development Setup](/docs/getting-started/setup) guide to get started!
