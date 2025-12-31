#!/bin/bash

# ============================================
# Production Service Restart
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Run as root: sudo ./Production-restart.sh"
    exit 1
fi

print_header "Production Service Restart"

echo "Select service to restart:"
echo "1) Backend (PM2)"
echo "2) Nginx"
echo "3) Both (Backend + Nginx)"
echo "4) All Services (Backend + Nginx + MySQL)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_header "Restarting Backend"
        pm2 restart khandesh-api --update-env
        sleep 2
        pm2 list | grep khandesh-api
        print_success "Backend restarted"
        ;;
    2)
        print_header "Restarting Nginx"
        nginx -t && systemctl restart nginx
        sleep 1
        systemctl status nginx --no-pager -l | head -5
        print_success "Nginx restarted"
        ;;
    3)
        print_header "Restarting Backend"
        pm2 restart khandesh-api --update-env
        sleep 2
        
        print_header "Restarting Nginx"
        nginx -t && systemctl restart nginx
        sleep 1
        
        print_success "Both services restarted"
        ;;
    4)
        print_header "Restarting All Services"
        
        print_info "Restarting Backend..."
        pm2 restart khandesh-api --update-env
        sleep 2
        
        print_info "Restarting Nginx..."
        nginx -t && systemctl restart nginx
        sleep 1
        
        print_info "Restarting MySQL..."
        systemctl restart mysql || systemctl restart mariadb
        sleep 2
        
        print_success "All services restarted"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_header "Service Status"
print_info "Backend:"
pm2 list | grep khandesh-api || print_error "Backend not running"

print_info "Nginx:"
systemctl is-active nginx && print_success "Nginx: Running" || print_error "Nginx: Not running"

print_info "MySQL:"
systemctl is-active mysql && print_success "MySQL: Running" || \
systemctl is-active mariadb && print_success "MariaDB: Running" || \
print_error "Database: Not running"

