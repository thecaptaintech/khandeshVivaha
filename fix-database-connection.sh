#!/bin/bash

# ============================================
# Fix Database Connection Issue
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "============================================"
echo "Fixing Database Connection"
echo "============================================"
echo ""

# Detect project directory
if [ -d "/var/www/khandeshVivaha" ]; then
    PROJECT_DIR="/var/www/khandeshVivaha"
elif [ -d "/root/khandeshvivah" ]; then
    PROJECT_DIR="/root/khandeshvivah"
else
    PROJECT_DIR="$(pwd)"
fi

BACKEND_DIR="${PROJECT_DIR}/backend"
ENV_FILE="${BACKEND_DIR}/.env"

print_info "Project directory: ${PROJECT_DIR}"
print_info "Backend directory: ${BACKEND_DIR}"
echo ""

# Check .env file
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found: ${ENV_FILE}"
    exit 1
fi

print_info "Reading database credentials from .env..."
DB_HOST=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-khandesh_vivah}

print_info "DB_HOST: ${DB_HOST}"
print_info "DB_USER: ${DB_USER}"
print_info "DB_NAME: ${DB_NAME}"
print_info "DB_PASSWORD: ${DB_PASSWORD:+SET} ${DB_PASSWORD:-NOT SET}"
echo ""

# Test MySQL connection
print_info "Testing MySQL connection..."
if mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "MySQL connection successful!"
else
    print_error "MySQL connection failed!"
    echo ""
    print_warning "Possible issues:"
    echo "1. Wrong password in .env file"
    echo "2. MySQL user doesn't exist"
    echo "3. MySQL authentication plugin issue (MySQL 8.0+)"
    echo ""
    print_info "Trying to fix MySQL authentication..."
    
    # Try to fix MySQL 8.0 authentication
    print_info "If using MySQL 8.0+, you may need to change authentication method:"
    echo ""
    echo "Run this command:"
    echo "mysql -u root -p"
    echo ""
    echo "Then run:"
    echo "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
    echo "FLUSH PRIVILEGES;"
    echo ""
    echo "Or create a new user:"
    echo "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
    echo "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
    echo "FLUSH PRIVILEGES;"
    echo ""
    
    read -p "Do you want to test with a different password? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -sp "Enter MySQL password: " NEW_PASSWORD
        echo ""
        if mysql -h ${DB_HOST} -u ${DB_USER} -p${NEW_PASSWORD} -e "SELECT 1" 2>/dev/null; then
            print_success "Connection works with new password!"
            print_info "Updating .env file..."
            sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${NEW_PASSWORD}/" "$ENV_FILE"
            print_success ".env file updated"
        else
            print_error "Still failing. Check MySQL user and permissions."
        fi
    fi
fi

echo ""
print_info "Restarting backend..."
pm2 restart khandesh-api

echo ""
print_success "Done! Check logs: pm2 logs khandesh-api"

