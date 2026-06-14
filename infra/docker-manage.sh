#!/bin/bash

# Spotify Clone - Docker Development Helper Scripts

set -e

# Always run from repo root so relative paths work correctly
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_DEV="infra/docker-compose.preprod.yaml"
COMPOSE_PROD="infra/docker-compose.prod.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_info "Please update .env file with your configuration"
fi

DC_DEV="docker-compose -f $COMPOSE_DEV"
DC_PROD="docker-compose -f $COMPOSE_PROD"

# Main menu
show_menu() {
    echo ""
    echo "=================================="
    echo "  Spotify Clone - Docker Manager"
    echo "=================================="
    echo "1. Start Development Environment"
    echo "2. Stop Development Environment"
    echo "3. Restart All Services"
    echo "4. View Logs"
    echo "5. Build All Images"
    echo "6. Clean & Rebuild"
    echo "7. Database Operations"
    echo "8. Run Production"
    echo "9. System Cleanup"
    echo "0. Exit"
    echo "=================================="
    echo -n "Select option: "
}

# Start development
start_dev() {
    print_info "Starting development environment..."
    $DC_DEV up -d
    print_info "Waiting for services to be healthy..."
    sleep 5
    $DC_DEV ps
    print_info "Development environment started!"
    echo ""
    print_info "Services available at:"
    echo "  - API:   http://localhost:3000"
    echo "  - Web:   http://localhost:3001"
    echo "  - Admin: http://localhost:3002"
}

# Stop development
stop_dev() {
    print_info "Stopping development environment..."
    $DC_DEV down
    print_info "Development environment stopped!"
}

# Restart services
restart_services() {
    print_info "Restarting all services..."
    $DC_DEV restart
    print_info "Services restarted!"
}

# View logs
view_logs() {
    echo ""
    echo "Which service logs to view?"
    echo "1. All"
    echo "2. API"
    echo "3. Web"
    echo "4. Admin"
    echo "5. PostgreSQL"
    echo "6. Redis"
    echo -n "Select: "
    read log_choice

    case $log_choice in
        1) $DC_DEV logs -f ;;
        2) $DC_DEV logs -f api ;;
        3) $DC_DEV logs -f web ;;
        4) $DC_DEV logs -f admin ;;
        5) $DC_DEV logs -f postgres ;;
        6) $DC_DEV logs -f redis ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Build images
build_images() {
    print_info "Building all Docker images..."
    $DC_DEV build --parallel
    print_info "Build completed!"
}

# Clean and rebuild
clean_rebuild() {
    print_warning "This will remove all containers, volumes, and rebuild from scratch!"
    echo -n "Are you sure? (y/N): "
    read confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        print_info "Stopping and removing containers..."
        $DC_DEV down -v
        print_info "Removing images..."
        $DC_DEV rm -f
        print_info "Rebuilding..."
        $DC_DEV build --no-cache --parallel
        print_info "Starting services..."
        $DC_DEV up -d
        print_info "Clean rebuild completed!"
    else
        print_info "Operation cancelled"
    fi
}

# Database operations
db_operations() {
    echo ""
    echo "Database Operations:"
    echo "1. Run Migrations"
    echo "2. Generate Prisma Client"
    echo "3. Reset Database"
    echo "4. Seed Database"
    echo "5. Open Prisma Studio"
    echo "6. Backup Database"
    echo "7. Restore Database"
    echo -n "Select: "
    read db_choice

    case $db_choice in
        1)
            print_info "Running migrations..."
            $DC_DEV exec api pnpm --filter @spotify/api run db:migration:start
            ;;
        2)
            print_info "Generating Prisma Client..."
            $DC_DEV exec api pnpm --filter @spotify/api run db:gen
            ;;
        3)
            print_warning "This will reset the entire database!"
            echo -n "Are you sure? (y/N): "
            read confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                $DC_DEV exec api pnpm --filter @spotify/api run db:migration:reset
            fi
            ;;
        4)
            print_info "Seeding database..."
            $DC_DEV exec api pnpm --filter @spotify/api run seed
            ;;
        5)
            print_info "Opening Prisma Studio..."
            $DC_DEV exec api pnpm --filter @spotify/api run db:ui
            ;;
        6)
            print_info "Creating database backup..."
            mkdir -p ./backups
            $DC_DEV exec postgres pg_dump -U admin spotify > "./backups/backup_$(date +%Y%m%d_%H%M%S).sql"
            print_info "Backup created in ./backups/"
            ;;
        7)
            echo -n "Enter backup filename: "
            read backup_file
            if [ -f "./backups/$backup_file" ]; then
                $DC_DEV exec -T postgres psql -U admin spotify < "./backups/$backup_file"
                print_info "Database restored!"
            else
                print_error "Backup file not found!"
            fi
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Run production
run_production() {
    print_warning "Starting production environment..."
    echo -n "Are you sure? (y/N): "
    read confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        $DC_PROD up -d
        print_info "Production environment started!"
    fi
}

# System cleanup
system_cleanup() {
    echo ""
    echo "Cleanup Options:"
    echo "1. Remove unused Docker images"
    echo "2. Remove unused volumes"
    echo "3. Full system cleanup (dangerous!)"
    echo -n "Select: "
    read cleanup_choice

    case $cleanup_choice in
        1)
            docker image prune -f
            print_info "Unused images removed"
            ;;
        2)
            docker volume prune -f
            print_info "Unused volumes removed"
            ;;
        3)
            print_warning "This will remove ALL unused Docker resources!"
            echo -n "Are you sure? (y/N): "
            read confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                docker system prune -af --volumes
                print_info "System cleanup completed"
            fi
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Main loop
while true; do
    show_menu
    read choice

    case $choice in
        1) start_dev ;;
        2) stop_dev ;;
        3) restart_services ;;
        4) view_logs ;;
        5) build_images ;;
        6) clean_rebuild ;;
        7) db_operations ;;
        8) run_production ;;
        9) system_cleanup ;;
        0)
            print_info "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            ;;
    esac

    echo ""
    echo -n "Press Enter to continue..."
    read
done
