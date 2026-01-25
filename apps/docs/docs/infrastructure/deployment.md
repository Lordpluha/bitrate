---
sidebar_position: 2
---

# Deployment

Production deployment guide for Spotify Clone.

## 🚀 Deployment Options

### 1. Docker Compose (Recommended for small-scale)
### 2. Kubernetes (Recommended for scale)
### 3. Cloud Platforms (AWS, GCP, Azure)
### 4. Serverless (Vercel, Netlify)

## 🐳 Docker Compose Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain name with DNS configured
- SSL certificate (Let's Encrypt)

### 1. Clone Repository

```bash
git clone https://github.com/Lordpluha/spotify-clone.git
cd spotify-clone
```

### 2. Environment Configuration

```bash
# Copy production env file
cp .env.example .env.production

# Edit configuration
vi .env.production
```

**Required Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/spotify_clone

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Application
NODE_ENV=production
API_URL=https://api.yourdomain.com
WEB_URL=https://yourdomain.com

# CORS
CORS_ORIGIN=https://yourdomain.com,https://api.yourdomain.com

# Storage
S3_ENDPOINT=https://storage.yourdomain.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=spotify-clone

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=password
```

### 3. SSL Configuration

```bash
# Install certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 4. Nginx Configuration

```nginx
# nginx/conf.d/production.conf
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size limit
    client_max_body_size 100M;
}
```

### 5. Build and Deploy

```bash
# Build production images
docker compose -f docker-compose.prod.yaml build

# Start services
docker compose -f docker-compose.prod.yaml up -d

# Run migrations
docker compose exec api pnpm db:migration:start

# Verify services
docker compose ps
```

### 6. Health Check

```bash
# API
curl https://api.yourdomain.com/health

# Web
curl https://yourdomain.com
```

## ☁️ Cloud Platform Deployment

### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

### Google Cloud (Cloud Run)

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/spotify-clone-api
gcloud builds submit --tag gcr.io/PROJECT_ID/spotify-clone-web

# Deploy
gcloud run deploy api --image gcr.io/PROJECT_ID/spotify-clone-api
gcloud run deploy web --image gcr.io/PROJECT_ID/spotify-clone-web
```

### Azure (Container Instances)

```bash
# Login
az login

# Create resource group
az group create --name spotify-clone --location eastus

# Deploy containers
az container create \
  --resource-group spotify-clone \
  --name api \
  --image yourregistry.azurecr.io/spotify-clone-api:latest \
  --dns-name-label spotify-clone-api \
  --ports 3000
```

## 🎯 Serverless Deployment

### Vercel (Web App)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

**vercel.json:**

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.yourdomain.com"
  }
}
```

### Netlify (Documentation)

```bash
# Deploy docs
cd apps/docs
pnpm build

# Upload to Netlify
netlify deploy --prod --dir=build
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.28.1

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Build Docker images
        run: docker compose -f docker-compose.prod.yaml build

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push yourregistry/spotify-clone-api:latest
          docker push yourregistry/spotify-clone-web:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/spotify-clone
            git pull
            docker compose -f docker-compose.prod.yaml pull
            docker compose -f docker-compose.prod.yaml up -d
```

## 📊 Monitoring

### Health Checks

```yaml
# docker-compose.prod.yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Logging

```bash
# View logs
docker compose logs -f api

# Export to file
docker compose logs api > api.log

# Use logging driver
docker-compose.prod.yaml:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'
```

## 🔧 Database Management

### Migrations

```bash
# Run migrations
docker compose exec api pnpm db:migration:start

# Create backup
docker compose exec postgres pg_dump -U postgres spotify_clone > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres spotify_clone < backup.sql
```

### Scheduled Backups

```bash
# crontab
0 2 * * * /opt/scripts/backup-db.sh
```

**backup-db.sh:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

docker compose exec -T postgres pg_dump -U postgres spotify_clone | \
  gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Enable SSL/TLS
- [ ] Configure firewall
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Use environment variables
- [ ] Regular security updates
- [ ] Set up monitoring
- [ ] Configure backups

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yaml
services:
  api:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### Load Balancing

```nginx
upstream api_backend {
    least_conn;
    server api-1:3000;
    server api-2:3000;
    server api-3:3000;
}

server {
    location / {
        proxy_pass http://api_backend;
    }
}
```

---

**Related:**
- [Docker Setup](/docs/infrastructure/docker)