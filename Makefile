.PHONY: help dev dev-build stop clean logs prod backup

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
	@docker-compose up -d
	@echo "✅ Development environment started!"
	@echo ""
	@echo "Services:"
	@echo "  - API:   http://localhost:3000"
	@echo "  - Web:   http://localhost:3001"
	@echo "  - Admin: http://localhost:3002"

dev-build:
	@echo "🔨 Building and starting development environment..."
	@docker-compose up -d --build

stop:
	@echo "🛑 Stopping all services..."
	@docker-compose down

restart:
	@echo "🔄 Restarting all services..."
	@docker-compose restart

clean:
	@echo "🧹 Cleaning up (removing volumes)..."
	@docker-compose down -v

# Logs
logs:
	@docker-compose logs -f

logs-api:
	@docker-compose logs -f api

logs-web:
	@docker-compose logs -f web

logs-admin:
	@docker-compose logs -f admin

# Database
db-migrate:
	@echo "📦 Running database migrations..."
	@docker-compose exec api pnpm --filter @spotify/api run db:migration:start

db-seed:
	@echo "🌱 Seeding database..."
	@docker-compose exec api pnpm --filter @spotify/api run seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	@docker-compose exec api pnpm --filter @spotify/api run db:ui

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p ./backups
	@docker-compose exec postgres pg_dump -U admin spotify > "./backups/backup_$$(date +%Y%m%d_%H%M%S).sql"
	@echo "✅ Backup created in ./backups/"

db-reset:
	@echo "⚠️  Resetting database..."
	@docker-compose exec api pnpm --filter @spotify/api run db:migration:reset

# Production
prod:
	@echo "🚀 Starting production environment..."
	@docker-compose -f docker-compose.prod.yaml up -d

prod-build:
	@echo "🔨 Building and starting production..."
	@docker-compose -f docker-compose.prod.yaml up -d --build

# Desktop & Mobile
desktop-dev:
	@echo "🖥️  Starting desktop development server..."
	@docker-compose --profile desktop up -d desktop
	@echo "✅ Desktop server started at http://localhost:1420"

desktop-logs:
	@docker-compose logs -f desktop
package.docker.json
desktop-stop:
	@docker-compose --profile desktop down

mobile-dev:
	@echo "📱 Starting mobile Expo server..."
	@docker-compose --profile mobile up -d mobile
	@echo "✅ Expo server started!"
	@echo ""
	@echo "Scan QR code with Expo Go app:"
	@sleep 5
	@docker-compose logs mobile | grep -A 5 "exp://" || echo "Check logs with: make mobile-logs"

mobile-logs:
	@docker-compose logs -f mobile

mobile-qr:
	@echo "📱 Expo QR Code:"
	@docker-compose logs mobile | grep "exp://" | tail -1 || echo "Server not running. Start with: make mobile-dev"

mobile-stop:
	@docker-compose --profile mobile down

mobile-web:
	@echo "🌐 Starting Expo web..."
	@docker-compose exec mobile pnpm run web

# Utils
status:
	@docker-compose ps

shell-api:
	@docker-compose exec api sh

shell-web:
	@docker-compose exec web sh

shell-admin:
	@docker-compose exec admin sh

prune:
	@echo "🧹 Cleaning unused Docker resources..."
	@docker system prune -af

# Quick start
init: dev-build db-migrate db-seed
	@echo "✅ Project initialized successfully!"
