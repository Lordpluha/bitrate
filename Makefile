.PHONY: help dev dev-build stop clean logs prod backup

DC_DEV := docker-compose -f infra/docker-compose.preprod.yaml
DC_PROD := docker-compose -f infra/docker-compose.prod.yaml

# Default target
help:
	@echo "Spotify Clone - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make clean        - Stop and remove volumes"
	@echo ""
	@echo "Logs:"
	@echo "  make logs         - View all logs"
	@echo "  make logs-api     - View API logs"
	@echo "  make logs-web     - View Web logs"
	@echo "  make logs-admin   - View Admin logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make db-seed      - Seed database with test data"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make db-backup    - Create database backup"
	@echo "  make db-reset     - Reset database"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build and start production"
	@echo ""
	@echo "Desktop & Mobile:"
	@echo "  make desktop-dev  - Start desktop dev server"
	@echo "  make mobile-dev   - Start mobile Expo server"
	@echo "  make mobile-qr    - Show Expo QR code"
	@echo ""
	@echo "Utils:"
	@echo "  make status       - Show service status"
	@echo "  make shell-api    - Enter API container shell"
	@echo "  make shell-web    - Enter Web container shell"
	@echo "  make prune        - Clean unused Docker resources"

# Development
dev:
	@echo "🚀 Starting development environment..."
	@$(DC_DEV) up -d
	@echo "✅ Development environment started!"
	@echo ""
	@echo "Services:"
	@echo "  - API:   http://localhost:3000"
	@echo "  - Web:   http://localhost:3001"
	@echo "  - Admin: http://localhost:3002"

dev-build:
	@echo "🔨 Building and starting development environment..."
	@$(DC_DEV) up -d --build

stop:
	@echo "🛑 Stopping all services..."
	@$(DC_DEV) down

restart:
	@echo "🔄 Restarting all services..."
	@$(DC_DEV) restart

clean:
	@echo "🧹 Cleaning up (removing volumes)..."
	@$(DC_DEV) down -v

# Logs
logs:
	@$(DC_DEV) logs -f

logs-api:
	@$(DC_DEV) logs -f api

logs-web:
	@$(DC_DEV) logs -f web

logs-admin:
	@$(DC_DEV) logs -f admin

# Database
db-migrate:
	@echo "📦 Running database migrations..."
	@$(DC_DEV) exec api pnpm --filter @spotify/api run db:migration:start

db-seed:
	@echo "🌱 Seeding database..."
	@$(DC_DEV) exec api pnpm --filter @spotify/api run seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	@$(DC_DEV) exec api pnpm --filter @spotify/api run db:ui

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p ./backups
	@$(DC_DEV) exec postgres pg_dump -U admin spotify > "./backups/backup_$$(date +%Y%m%d_%H%M%S).sql"
	@echo "✅ Backup created in ./backups/"

db-reset:
	@echo "⚠️  Resetting database..."
	@$(DC_DEV) exec api pnpm --filter @spotify/api run db:migration:reset

# Production
prod:
	@echo "🚀 Starting production environment..."
	@$(DC_PROD) up -d

prod-build:
	@echo "🔨 Building and starting production..."
	@$(DC_PROD) up -d --build

# Desktop & Mobile
desktop-dev:
	@echo "🖥️  Starting desktop development server..."
	@$(DC_DEV) --profile desktop up -d desktop
	@echo "✅ Desktop server started at http://localhost:1420"

desktop-logs:
	@$(DC_DEV) logs -f desktop

desktop-stop:
	@$(DC_DEV) --profile desktop down

mobile-dev:
	@echo "📱 Starting mobile Expo server..."
	@$(DC_DEV) --profile mobile up -d mobile
	@echo "✅ Expo server started!"
	@echo ""
	@echo "Scan QR code with Expo Go app:"
	@sleep 5
	@$(DC_DEV) logs mobile | grep -A 5 "exp://" || echo "Check logs with: make mobile-logs"

mobile-logs:
	@$(DC_DEV) logs -f mobile

mobile-qr:
	@echo "📱 Expo QR Code:"
	@$(DC_DEV) logs mobile | grep "exp://" | tail -1 || echo "Server not running. Start with: make mobile-dev"

mobile-stop:
	@$(DC_DEV) --profile mobile down

mobile-web:
	@echo "🌐 Starting Expo web..."
	@$(DC_DEV) exec mobile pnpm run web

# Utils
status:
	@$(DC_DEV) ps

shell-api:
	@$(DC_DEV) exec api sh

shell-web:
	@$(DC_DEV) exec web sh

shell-admin:
	@$(DC_DEV) exec admin sh

prune:
	@echo "🧹 Cleaning unused Docker resources..."
	@docker system prune -af

# Quick start
init: dev-build db-migrate db-seed
	@echo "✅ Project initialized successfully!"
