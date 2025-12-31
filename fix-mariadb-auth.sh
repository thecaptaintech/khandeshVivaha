#!/bin/bash

# ============================================
# Fix MariaDB Authentication
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

print_header "MariaDB Authentication Fix"

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
print_info "Testing current MariaDB connection..."
if mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "MariaDB connection works! No fix needed."
    exit 0
else
    print_warning "Connection failed. Fixing MariaDB authentication..."
    echo ""
fi

print_header "Option 1: Fix Root User (MariaDB Syntax)"

read -p "Do you want to fix root user? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Fixing root user authentication for MariaDB..."
    
    # MariaDB syntax - Set password
    if mysql -u root <<EOF 2>/dev/null
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${DB_PASSWORD}');
FLUSH PRIVILEGES;
EOF
    then
        print_success "Root user password set!"
    else
        # Try alternative MariaDB syntax
        print_info "Trying alternative MariaDB syntax..."
        if mysql -u root <<EOF 2>/dev/null
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
EOF
        then
            print_success "Root user password set (alternative method)!"
        else
            print_error "Failed to set password automatically"
            print_info "Please run manually:"
            echo ""
            echo "mysql -u root"
            echo "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${DB_PASSWORD}');"
            echo "FLUSH PRIVILEGES;"
            echo "EXIT;"
            exit 1
        fi
    fi
fi

print_header "Option 2: Create Dedicated User (Recommended)"

read -p "Do you want to create a dedicated user? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    NEW_USER="khandesh_user"
    NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    print_info "Creating dedicated MariaDB user..."
    print_info "New user: ${NEW_USER}"
    print_info "New password: ${NEW_PASSWORD}"
    echo ""
    
    # Create user with MariaDB syntax
    if mysql -u root -p${DB_PASSWORD} <<EOF 2>/dev/null
CREATE USER IF NOT EXISTS '${NEW_USER}'@'localhost' IDENTIFIED BY '${NEW_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${NEW_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF
    then
        print_success "Dedicated user created!"
        
        # Update .env file
        print_info "Updating .env file..."
        sed -i "s/^DB_USER=.*/DB_USER=${NEW_USER}/" "$ENV_FILE"
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${NEW_PASSWORD}/" "$ENV_FILE"
        
        print_success ".env file updated"
        TEST_USER=$NEW_USER
        TEST_PASSWORD=$NEW_PASSWORD
    else
        print_error "Failed to create user"
        TEST_USER=$DB_USER
        TEST_PASSWORD=$DB_PASSWORD
    fi
else
    TEST_USER=$DB_USER
    TEST_PASSWORD=$DB_PASSWORD
fi

# Test connection
print_header "Testing Connection"

print_info "Testing connection with user: ${TEST_USER}"

if mysql -u ${TEST_USER} -p${TEST_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "Connection successful!"
else
    print_error "Connection still failing"
    exit 1
fi

# Restart backend
print_header "Restarting Backend"

print_info "Restarting PM2 process with updated environment..."
pm2 restart khandesh-api --update-env
sleep 3

# Check logs
print_info "Checking backend logs..."
pm2 logs khandesh-api --lines 10 --nostream | tail -20

print_success "============================================"
print_success "✅ MariaDB Authentication Fixed!"
print_success "============================================"

