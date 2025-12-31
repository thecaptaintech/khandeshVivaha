#!/bin/bash

# ============================================
# Check MySQL Credentials from .env
# ============================================

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

echo "============================================"
echo "MySQL Credentials Check"
echo "============================================"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found at: ${ENV_FILE}"
    print_info "Looking for .env in: ${BACKEND_DIR}"
    exit 1
fi

print_success ".env file found: ${ENV_FILE}"
echo ""

# Extract MySQL credentials
DB_HOST=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

# Set defaults if empty
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-khandesh_vivah}

echo "📋 MySQL Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Host:     ${DB_HOST}"
echo "  User:     ${DB_USER}"
echo "  Database: ${DB_NAME}"
echo "  Password: ${DB_PASSWORD:+***SET***} ${DB_PASSWORD:-NOT SET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test connection
print_info "Testing MySQL connection..."

if [ -n "$DB_PASSWORD" ]; then
    if mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
        print_success "MySQL connection successful!"
        echo ""
        print_info "You can login with:"
        echo "  mysql -u ${DB_USER} -p"
        echo ""
        print_info "Or with host:"
        echo "  mysql -h ${DB_HOST} -u ${DB_USER} -p"
    else
        print_error "MySQL connection failed!"
        print_warning "Please check:"
        echo "  1. MySQL server is running"
        echo "  2. Username and password are correct"
        echo "  3. User has access to database"
    fi
else
    print_warning "Password not set in .env file"
    print_info "You can login with:"
    echo "  mysql -u ${DB_USER} -p"
    echo ""
    print_info "Or test connection:"
    echo "  mysql -h ${DB_HOST} -u ${DB_USER} -p -e 'SELECT 1'"
fi

echo ""
print_info "Full .env MySQL section:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep "^DB_" "$ENV_FILE" | sed 's/PASSWORD=.*/PASSWORD=***HIDDEN***/'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

