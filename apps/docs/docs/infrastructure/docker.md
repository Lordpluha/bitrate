---
sidebar_position: 1
---

# Docker Setup

Complete guide for running Spotify Clone with Docker.

## 🐳 Overview

Docker Compose files live in `infra/`:

| File | Purpose |
|------|---------|
| `infra/docker-compose.dev.yaml` | Minimal — postgres + redis only (~320 MB). Use with native app dev. |
| `infra/docker-compose.preprod.yaml` | Full development stack — all apps in containers. |
| `infra/docker-compose.prod.yaml` | Production stack with nginx reverse proxy. |

## 📦 Services

### Development Stack (`docker-compose.preprod.yaml`)

```yaml
services:
  postgres:     # PostgreSQL 16 database
  redis:        # Cache & sessions
  api:          # NestJS backend
  web:          # Next.js frontend (web-player)
  admin:        # Admin panel (Kottster)
  mobile:       # React Native / Expo bundler  [--profile mobile]
  desktop:      # Vite dev server (UI only)    [--profile desktop]
```

### Production Services (`docker-compose.prod.yaml`)

```yaml
services:
  nginx:        # Reverse proxy
  postgres:     # Database
  redis:        # Cache
  api:          # Backend API
  web:          # Web app
  admin:        # Admin panel
```

## 🚀 Quick Start

### Recommended: minimal infra + native apps

```bash
# Start postgres + redis only
docker compose -f infra/docker-compose.dev.yaml up -d

# Run apps natively
pnpm dev
```

### Full Docker development stack

```bash
# First run (build images, migrate, seed)
docker compose -f infra/docker-compose.preprod.yaml up -d --build
docker compose -f infra/docker-compose.preprod.yaml exec api pnpm --filter @spotify/api run db:migration:start
docker compose -f infra/docker-compose.preprod.yaml exec api pnpm --filter @spotify/api run seed

# Subsequent runs
docker compose -f infra/docker-compose.preprod.yaml up -d

# Stop
docker compose -f infra/docker-compose.preprod.yaml down
```

### Via task (cross-platform shortcut)

```bash
task infra:up       # minimal: postgres + redis
task dev:up         # full dev stack
task init           # first-time: build + migrate + seed
task dev:down       # stop
task dev:logs       # tail all logs
task dev:logs -- api  # tail specific service
```

## 🔧 Service Configuration

### PostgreSQL

```yaml
postgres:
  image: postgres:16-alpine
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: admin
    POSTGRES_DB: spotify
```

**Access:**
- Host: `localhost:5432`
- User: `admin` / Password: `admin`
- Database: `spotify`

### Redis

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

**Access:** `localhost:6379`

## 📝 Docker Commands

### Container Management

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

# View running containers
$DC ps

# View logs
$DC logs -f

# View logs for specific service
$DC logs -f api

# Restart service
$DC restart api

# Stop all services
$DC down

# Stop and remove volumes
$DC down -v
```

### Exec Commands

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

# Run migrations
$DC exec api pnpm --filter @spotify/api run db:migration:start

# Open shell
$DC exec api sh

# Open psql
$DC exec postgres psql -U admin spotify
```

### Build & Rebuild

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

# Build specific service
$DC build api

# Rebuild and start
$DC up -d --build

# Force rebuild (no cache)
$DC build --no-cache api
```

## 🛠️ Development Workflow

### 1. Start Infrastructure

```bash
# Minimal (recommended for native dev)
docker compose -f infra/docker-compose.dev.yaml up -d

# Full stack
docker compose -f infra/docker-compose.preprod.yaml up -d
```

### 2. Run Apps Locally

```bash
pnpm --filter @spotify/api start:dev
pnpm --filter @spotify/web-player dev
```

## 📱 Optional: Mobile & Desktop containers

Mobile and Desktop services use Docker Compose profiles:

```bash
# Mobile (Metro Bundler + Expo tunnel)
docker compose -f infra/docker-compose.preprod.yaml --profile mobile up -d mobile
# Open http://localhost:19000

# Desktop (Vite only, no Tauri)
docker compose -f infra/docker-compose.preprod.yaml --profile desktop up -d desktop
# Open http://localhost:1420

# Stop profile containers
docker compose -f infra/docker-compose.preprod.yaml --profile mobile down
docker compose -f infra/docker-compose.preprod.yaml --profile desktop down
```

## 🔍 Debugging

### View Logs

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

$DC logs -f             # all services
$DC logs -f api         # specific service
$DC logs --tail=100 api # last 100 lines
```

### Inspect Container

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

$DC exec api env        # environment variables
$DC exec api ps aux     # processes
$DC exec api ls -la /app
```

### Network Issues

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"

docker network ls
$DC exec api ping postgres
```

## 📦 Volumes

### Backup PostgreSQL

```bash
docker compose -f infra/docker-compose.preprod.yaml exec -T postgres \
  pg_dump -U admin spotify > backups/backup.sql

# Or via task:
task db:backup
```

### Restore

```bash
docker compose -f infra/docker-compose.preprod.yaml exec -T postgres \
  psql -U admin spotify < backups/backup.sql

# Or via task:
task db:restore -- backup_20260101_120000.sql
```

### Clear All Data

```bash
docker compose -f infra/docker-compose.preprod.yaml down -v
# Or via task (with prompt):
task dev:clean
```

## 🚀 Production Deployment

### Start Production

```bash
# First time (build + start)
docker compose -f infra/docker-compose.prod.yaml up -d --build

# Subsequent runs (with confirmation via task)
task prod:up
```

### Environment Variables

```bash
# Create .env from example
cp .env.example .env
# Edit production values
```

## 🔒 Security

### Network Isolation

The docker-compose files use a dedicated bridge network (`spotify-network`) that isolates services from the host network. Only required ports are published.

## 📊 Monitoring

### Health Checks

```bash
task dev:status        # container status
task monitor:health    # status + an HTTP probe per app
task monitor:report    # health, resources, database, disk, recent errors
task monitor           # interactive menu
```

`monitor:*` wraps `infra/docker-monitor.sh`, which can also be called directly
(`./infra/docker-monitor.sh health|resources|disk|db|network|errors|report|fix`).

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
kill -9 <PID>
```

### Container Won't Start

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"
$DC logs api
$DC build --no-cache api
$DC up -d api
```

### Database Connection Failed

```bash
DC="docker compose -f infra/docker-compose.preprod.yaml"
$DC ps postgres
$DC logs postgres
$DC restart postgres
```

### Permission Errors on `dist/` After Docker Build

Docker may write `dist/` files as root. Clean before pushing:

```bash
pnpm clean:dist
# or: task clean:dist
```

---

**Related:**
- [Setup Guide](/docs/getting-started/setup)
- [Deployment](/docs/infrastructure/deployment)
