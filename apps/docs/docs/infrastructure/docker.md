---
sidebar_position: 1
---

# Docker Setup

Complete guide for running Bitrate with Docker.

## 🐳 Overview

Docker Compose files live in `infra/`:

| File | Purpose |
|------|---------|
| `infra/docker-compose.dev.yaml` | Local development. Without a profile: infrastructure only (postgres, postgres_test, redis, SeaweedFS) for native app dev. `--profile apps`: every app in containers too. |
| `infra/docker-compose.prod.yaml` | Production stack with nginx reverse proxy. |

## 📦 Services

### Development Stack (`docker-compose.dev.yaml`)

```yaml
services:
  postgres:       # PostgreSQL 16 database
  postgres_test:  # Test database on port 5433
  redis:          # Cache & sessions
  seaweedfs:      # S3 object store for audio (127.0.0.1:8333)
  api:            # NestJS backend                [--profile apps]
  worker:         # Audio transcode worker        [--profile apps]
  admin-api:      # Operator API                  [--profile apps]
  web-player:     # Next.js frontend              [--profile apps]
  web-artists:    # TanStack Start artist app     [--profile apps]
  admin:          # Angular admin panel           [--profile apps]
  mobile:         # React Native / Expo bundler   [--profile mobile]
  desktop:        # Vite dev server (UI only)     [--profile desktop]
  docs:           # Docusaurus                    [--profile docs]
  nginx:          # Reverse proxy                 [--profile production]
  # prometheus, grafana, loki, ...                [--profile observability]
```

### Production Services (`docker-compose.prod.yaml`)

```yaml
services:
  nginx:        # Reverse proxy
  postgres:     # Database
  redis:        # Cache
  api:          # Backend API
  web:          # Web app
```

## 🚀 Quick Start

### Recommended: minimal infra + native apps

```bash
# Start the infrastructure only (no profile)
docker compose -f infra/docker-compose.dev.yaml up -d

# Run apps natively
pnpm dev
```

### Full Docker development stack

```bash
# First run (build images, migrate, seed)
docker compose -f infra/docker-compose.dev.yaml --profile apps up -d --build
docker compose -f infra/docker-compose.dev.yaml --profile apps exec api pnpm --filter @bitrate/api run db:migration:start
docker compose -f infra/docker-compose.dev.yaml --profile apps exec api pnpm --filter @bitrate/api run seed

# Subsequent runs
docker compose -f infra/docker-compose.dev.yaml --profile apps up -d

# Stop
docker compose -f infra/docker-compose.dev.yaml --profile apps down
```

### Via task (cross-platform shortcut)

```bash
task infra:up       # infrastructure only
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
    POSTGRES_DB: bitrate
```

**Access:**
- Host: `localhost:5432`
- User: `admin` / Password: `admin`
- Database: `bitrate`

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
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

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
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

# Run migrations
$DC exec api pnpm --filter @bitrate/api run db:migration:start

# Open shell
$DC exec api sh

# Open psql
$DC exec postgres psql -U admin bitrate
```

### Build & Rebuild

```bash
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

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
docker compose -f infra/docker-compose.dev.yaml --profile apps up -d
```

### 2. Run Apps Locally

```bash
pnpm --filter @bitrate/api start:dev
pnpm --filter @bitrate/web-player dev
```

## 📱 Optional: Mobile & Desktop containers

Mobile and Desktop services use Docker Compose profiles:

```bash
# Mobile (Metro Bundler + Expo tunnel)
docker compose -f infra/docker-compose.dev.yaml --profile apps --profile mobile up -d mobile
# Open http://localhost:19000

# Desktop (Vite only, no Tauri)
docker compose -f infra/docker-compose.dev.yaml --profile apps --profile desktop up -d desktop
# Open http://localhost:1420

# Stop profile containers
docker compose -f infra/docker-compose.dev.yaml --profile apps --profile mobile down
docker compose -f infra/docker-compose.dev.yaml --profile apps --profile desktop down
```

## 🔍 Debugging

### View Logs

```bash
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

$DC logs -f             # all services
$DC logs -f api         # specific service
$DC logs --tail=100 api # last 100 lines
```

### Inspect Container

```bash
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

$DC exec api env        # environment variables
$DC exec api ps aux     # processes
$DC exec api ls -la /app
```

### Network Issues

```bash
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"

docker network ls
$DC exec api ping postgres
```

## 📦 Volumes

### Clear All Data

```bash
docker compose -f infra/docker-compose.dev.yaml --profile apps down -v
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

The dev stack defaults every variable, so it needs no env file. `prod`
defaults nothing on purpose — `DOMAIN`, `DATABASE_URL`, `JWT_SECRET`, `POSTGRES_*`,
`REDIS_PASSWORD`, `WEB_HOST` and `NEXT_PUBLIC_*` come from the deploying environment
(GitHub environment secrets in the deploy workflow, exported shell variables for a manual
run). `docker compose -f infra/docker-compose.prod.yaml config` failing on `DOMAIN` outside
a deploy is that guard working.

See [Environment variables](../guides/environment.md) for where each value comes from.

## 🔒 Security

### Network Isolation

The docker-compose files use a dedicated bridge network (`bitrate-network`) that isolates services from the host network. Only required ports are published.

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
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"
$DC logs api
$DC build --no-cache api
$DC up -d api
```

### Database Connection Failed

```bash
DC="docker compose -f infra/docker-compose.dev.yaml --profile apps"
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
