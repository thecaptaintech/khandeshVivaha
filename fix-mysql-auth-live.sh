#!/bin/bash

# ============================================
# Fix MySQL Authentication on Live Server
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

BACKEND_DIR="/var/www/khandeshVivaha/backend"
ENV_FILE="${BACKEND_DIR}/.env"

echo "============================================"
echo "Fix MySQL Authentication"
echo "============================================"
echo ""

# Check .env file
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found: ${ENV_FILE}"
    exit 1
fi

# Read credentials
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-khandesh_vivah}

print_info "Database User: ${DB_USER}"
print_info "Database Name: ${DB_NAME}"
print_info "Password: ${DB_PASSWORD:+SET} ${DB_PASSWORD:-NOT SET}"
echo ""

# Test current connection
print_info "Testing current MySQL connection..."
if mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "MySQL connection works! No fix needed."
    exit 0
else
    print_error "MySQL connection failed!"
    echo ""
fi

print_warning "This is likely a MySQL 8.0+ authentication plugin issue."
echo ""
print_info "To fix, you need to run these MySQL commands:"
echo ""
echo "1. Login to MySQL:"
echo "   mysql -u root -p"
echo ""
echo "2. Then run these SQL commands:"
echo "   ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. Restart backend:"
echo "   pm2 restart khandesh-api"
echo ""

read -p "Do you want to try fixing it automatically? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Attempting to fix MySQL authentication..."
    
    # Try to fix using root access
    if mysql -u root -p${DB_PASSWORD} -e "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}'; FLUSH PRIVILEGES;" 2>/dev/null; then
        print_success "MySQL authentication fixed!"
    else
        print_warning "Automatic fix failed. Please run manually:"
        echo ""
        echo "mysql -u root -p"
        echo "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
        echo "FLUSH PRIVILEGES;"
        echo "EXIT;"
        echo ""
        exit 1
    fi
    
    # Test connection again
    print_info "Testing connection again..."
    if mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
        print_success "Connection successful!"
        
        # Restart backend
        print_info "Restarting backend..."
        pm2 restart khandesh-api
        print_success "Backend restarted"
    else
        print_error "Connection still failing. Please check password."
    fi
else
    print_info "Manual fix required. See instructions above."
fi

