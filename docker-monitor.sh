#!/bin/bash
# Utility scripts for Docker monitoring and maintenance

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# Check Docker health
check_health() {
    print_header "Service Health Status"
    docker-compose ps

    echo -e "\n${YELLOW}Service URLs:${NC}"
    echo "  Web:   http://localhost:3001"
    echo "  API:   http://localhost:3000"
    echo "  Admin: http://localhost:3002"

    echo -e "\n${YELLOW}Testing endpoints...${NC}"

    # Test API
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  API:   ${GREEN}✓ Online${NC}"
    else
        echo -e "  API:   ${RED}✗ Offline${NC}"
    fi

    # Test Web
    if curl -sf http://localhost:3001 > /dev/null 2>&1; then
        echo -e "  Web:   ${GREEN}✓ Online${NC}"
    else
        echo -e "  Web:   ${RED}✗ Offline${NC}"
    fi

    # Test Admin
    if curl -sf http://localhost:3002 > /dev/null 2>&1; then
        echo -e "  Admin: ${GREEN}✓ Online${NC}"
    else
        echo -e "  Admin: ${RED}✗ Offline${NC}"
    fi
}

# Resource usage
resource_usage() {
    print_header "Resource Usage"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Disk usage
disk_usage() {
    print_header "Docker Disk Usage"
    docker system df -v
}

# Container logs summary
logs_summary() {
    print_header "Recent Errors in Logs"

    echo -e "${YELLOW}API Errors:${NC}"
    docker-compose logs --tail=50 api 2>&1 | grep -i "error" | tail -10 || echo "  No errors found"

    echo -e "\n${YELLOW}Web Errors:${NC}"
    docker-compose logs --tail=50 web 2>&1 | grep -i "error" | tail -10 || echo "  No errors found"

    echo -e "\n${YELLOW}Admin Errors:${NC}"
    docker-compose logs --tail=50 admin 2>&1 | grep -i "error" | tail -10 || echo "  No errors found"
}

# Network info
network_info() {
    print_header "Network Information"
    docker network ls
    echo ""
    docker network inspect spotify-clone_spotify-network | grep -E "Name|IPv4Address" | head -20
}

# Database info
database_info() {
    print_header "Database Information"

    echo -e "${YELLOW}Database Size:${NC}"
    docker-compose exec -T postgres psql -U admin -d spotify -c "SELECT pg_size_pretty(pg_database_size('spotify')) as size;" 2>/dev/null || echo "  Database not accessible"

    echo -e "\n${YELLOW}Table Sizes:${NC}"
    docker-compose exec -T postgres psql -U admin -d spotify -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;" 2>/dev/null || echo "  Database not accessible"

    echo -e "\n${YELLOW}Connection Count:${NC}"
    docker-compose exec -T postgres psql -U admin -d spotify -c "SELECT count(*) as connections FROM pg_stat_activity;" 2>/dev/null || echo "  Database not accessible"
}

# Full report
full_report() {
    check_health
    resource_usage
    database_info
    disk_usage
    logs_summary
}

# Quick fix common issues
quick_fix() {
    print_header "Running Quick Fix"

    echo "1. Restarting unhealthy containers..."
    docker-compose ps --filter "status=unhealthy" -q | xargs -r docker restart

    echo "2. Pruning unused networks..."
    docker network prune -f

    echo "3. Removing dangling images..."
    docker image prune -f

    echo -e "\n${GREEN}Quick fix completed!${NC}"

    echo -e "\nWaiting 10 seconds for services to stabilize..."
    sleep 10

    check_health
}

# Menu
show_menu() {
    echo ""
    echo "=================================="
    echo "  Docker Monitoring & Utilities"
    echo "=================================="
    echo "1. Health Check"
    echo "2. Resource Usage"
    echo "3. Disk Usage"
    echo "4. Database Info"
    echo "5. Network Info"
    echo "6. Recent Errors"
    echo "7. Full Report"
    echo "8. Quick Fix Issues"
    echo "0. Exit"
    echo "=================================="
    echo -n "Select option: "
}

# Main loop
if [ "$1" != "" ]; then
    case $1 in
        health) check_health ;;
        resources) resource_usage ;;
        disk) disk_usage ;;
        db) database_info ;;
        network) network_info ;;
        errors) logs_summary ;;
        report) full_report ;;
        fix) quick_fix ;;
        *) echo "Unknown command: $1" ;;
    esac
else
    while true; do
        show_menu
        read choice

        case $choice in
            1) check_health ;;
            2) resource_usage ;;
            3) disk_usage ;;
            4) database_info ;;
            5) network_info ;;
            6) logs_summary ;;
            7) full_report ;;
            8) quick_fix ;;
            0) exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac

        echo ""
        echo -n "Press Enter to continue..."
        read
    done
fi
