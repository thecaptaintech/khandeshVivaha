#!/bin/bash

# ============================================
# Fix PM2 Environment Variables
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

BACKEND_DIR="/var/www/khandeshVivaha/backend"
ENV_FILE="${BACKEND_DIR}/.env"

print_header "Fix PM2 Environment Variables"

# Check .env file
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found: ${ENV_FILE}"
    exit 1
fi

# Read credentials
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

print_info "Current .env values:"
echo "  DB_USER: ${DB_USER}"
echo "  DB_NAME: ${DB_NAME}"
echo "  DB_PASSWORD: ${DB_PASSWORD:+SET} ${DB_PASSWORD:-NOT SET}"
echo ""

# Test MySQL connection with these credentials
print_info "Testing MySQL connection with .env credentials..."
if mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "MySQL connection works with .env credentials!"
else
    print_error "MySQL connection fails with .env credentials!"
    print_warning "The password in .env might be wrong or MariaDB password needs to be set"
    exit 1
fi

# Stop PM2 process completely
print_header "Stopping PM2 Process"
print_info "Stopping khandesh-api..."
pm2 stop khandesh-api
pm2 delete khandesh-api
print_success "PM2 process stopped and removed"

# Wait a moment
sleep 2

# Start PM2 with fresh environment
print_header "Starting PM2 with Fresh Environment"
cd "$BACKEND_DIR"

print_info "Starting backend with PM2..."
pm2 start server.js --name khandesh-api --update-env
pm2 save
print_success "Backend started with PM2"

# Wait for startup
sleep 3

# Check logs
print_header "Checking Backend Logs"
print_info "Recent logs:"
pm2 logs khandesh-api --lines 30 --nostream | tail -30

# Test API
print_header "Testing API"
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "API is responding!"
    curl http://localhost:5001/api/health
else
    print_warning "API might not be responding yet. Check logs above."
fi

print_success "============================================"
print_success "✅ PM2 Environment Updated!"
print_success "============================================"
print_info "If errors persist, check:"
echo "  1. .env file has correct password"
echo "  2. MariaDB password is set: mysql -u root -p -e \"SELECT 1\""
echo "  3. PM2 logs: pm2 logs khandesh-api --lines 50"

