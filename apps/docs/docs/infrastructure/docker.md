---
sidebar_position: 1
---

# Docker Setup

Complete guide for running Spotify Clone with Docker.

## 🐳 Overview

The project uses Docker Compose for local development and production deployment.

## 📦 Services

### Development Services

```yaml
services:
  postgres:     # PostgreSQL database
  redis:        # Cache & sessions
  minio:        # S3-compatible storage
  api:          # NestJS backend
  web:          # Next.js frontend
  mobile:       # React Native bundler
  desktop:      # Tauri desktop app
  docs:         # Documentation site
```

### Production Services

```yaml
services:
  nginx:        # Reverse proxy
  postgres:     # Database
  redis:        # Cache
  minio:        # Object storage
  api:          # Backend API
  web:          # Web app
```

## 🚀 Quick Start

### Start All Services

```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.prod.yaml up -d

# Minimal (DB only)
docker compose -f docker-compose.minimal.yaml up -d
```

### Individual Services

```bash
# Start only database
docker compose up -d postgres

# Start API + dependencies
docker compose up -d postgres redis api

# Start Web + dependencies
docker compose up -d postgres redis api web
```

## 🔧 Service Configuration

### PostgreSQL

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: spotify_clone
  volumes:
    - postgres-data:/var/lib/postgresql/data
```

**Access:**
- Host: `localhost:5432`
- User: `postgres`
- Password: `postgres`
- Database: `spotify_clone`

### Redis

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
```

**Access:**
- Host: `localhost:6379`

### MinIO (S3)

```yaml
minio:
  image: minio/minio
  ports:
    - "9000:9000"    # API
    - "9001:9001"    # Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  command: server /data --console-address ":9001"
```

**Access:**
- API: `http://localhost:9000`
- Console: `http://localhost:9001`
- Credentials: `minioadmin / minioadmin`

### API (NestJS)

```yaml
api:
  build:
    context: .
    dockerfile: apps/api/Dockerfile
  ports:
    - "3000:3000"
  depends_on:
    - postgres
    - redis
  environment:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/spotify_clone
    REDIS_HOST: redis
```

### Web (Next.js)

```yaml
web:
  build:
    context: .
    dockerfile: apps/web/Dockerfile
  ports:
    - "3001:3000"
  depends_on:
    - api
  environment:
    NEXT_PUBLIC_API_URL: http://api:3000
```

## 📝 Docker Commands

### Container Management

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api

# Restart service
docker compose restart api

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Exec Commands

```bash
# Run command in container
docker compose exec api pnpm db:migration:start

# Open shell
docker compose exec api sh

# Run database migrations
docker compose exec api pnpm db:gen
```

### Build & Rebuild

```bash
# Build all services
docker compose build

# Build specific service
docker compose build api

# Rebuild and start
docker compose up -d --build

# Force rebuild (no cache)
docker compose build --no-cache
```

## 🛠️ Development Workflow

### 1. Start Infrastructure

```bash
# Start only databases
docker compose up -d postgres redis minio
```

### 2. Run Apps Locally

```bash
# API
pnpm --filter @spotify/api start:dev

# Web
pnpm --filter @spotify/web dev
```

### 3. Full Docker Development

```bash
# Start everything
docker compose up -d

# Watch logs
docker compose logs -f api web
```

## 🔍 Debugging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100 api
```

### Inspect Container

```bash
# Container details
docker compose exec api env

# Check process
docker compose exec api ps aux

# Check files
docker compose exec api ls -la /app
```

### Network Issues

```bash
# Check network
docker network ls
docker network inspect spotify-clone_default

# Test connectivity
docker compose exec api ping postgres
docker compose exec web curl http://api:3000/health
```

## 📦 Volumes

### Data Persistence

```yaml
volumes:
  postgres-data:    # Database data
  redis-data:       # Redis data
  minio-data:       # Object storage
  uploads:          # Uploaded files
```

### Backup Data

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U postgres spotify_clone > backup.sql

# Restore PostgreSQL
docker compose exec -T postgres psql -U postgres spotify_clone < backup.sql
```

### Clear Data

```bash
# Remove all volumes
docker compose down -v

# Remove specific volume
docker volume rm spotify-clone_postgres-data
```

## 🚀 Production Deployment

### Build Production Images

```bash
# Build all
docker compose -f docker-compose.prod.yaml build

# Tag for registry
docker tag spotify-clone-api:latest registry.example.com/spotify-clone-api:latest

# Push to registry
docker push registry.example.com/spotify-clone-api:latest
```

### Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit production values
vi .env
```

### Start Production

```bash
docker compose -f docker-compose.prod.yaml up -d
```

## 🔒 Security

### Secrets Management

```bash
# Use Docker secrets (Swarm mode)
echo "supersecret" | docker secret create jwt_secret -

# Or use .env file
echo "JWT_SECRET=supersecret" >> .env
```

### Network Isolation

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No internet access
```

## 📊 Monitoring

### Health Checks

```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Resource Limits

```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yaml
```

### Container Won't Start

```bash
# Check logs
docker compose logs api

# Rebuild from scratch
docker compose down
docker compose build --no-cache api
docker compose up -d api
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

---

**Related:**
- [Setup Guide](/getting-started/setup)
- [Deployment Guide](/infrastructure/deployment)