#!/bin/bash

# ============================================
# Complete MySQL Fix - Best Practice Approach
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

print_header "MySQL Authentication Fix - Best Practice"

# Check .env file
if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found: ${ENV_FILE}"
    exit 1
fi

# Read current credentials
DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-khandesh_vivah}

print_info "Current Configuration:"
echo "  User: ${DB_USER}"
echo "  Database: ${DB_NAME}"
echo "  Password: ${DB_PASSWORD:+SET} ${DB_PASSWORD:-NOT SET}"
echo ""

# Test current connection
print_info "Testing current MySQL connection..."
if mysql -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "MySQL connection works! No fix needed."
    exit 0
fi

print_warning "Connection failed. Fixing MySQL authentication..."
echo ""

# Option 1: Fix root user (Quick fix)
print_header "Option 1: Fix Root User Authentication"

read -p "Do you want to fix root user authentication? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Fixing root user authentication..."
    
    # Try to login and fix
    if mysql -u root -p${DB_PASSWORD} -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}'; FLUSH PRIVILEGES;" 2>/dev/null; then
        print_success "Root user authentication fixed!"
    else
        print_warning "Could not fix automatically. Please run manually:"
        echo ""
        echo "mysql -u root -p"
        echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
        echo "FLUSH PRIVILEGES;"
        echo "EXIT;"
        echo ""
        
        # Try alternative: login without password
        print_info "Trying alternative method..."
        if mysql -u root <<EOF 2>/dev/null
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
EOF
        then
            print_success "Fixed using alternative method!"
        else
            print_error "Please fix manually using the commands above"
            exit 1
        fi
    fi
fi

# Option 2: Create dedicated user (Best practice)
print_header "Option 2: Create Dedicated MySQL User (Recommended)"

read -p "Do you want to create a dedicated MySQL user? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    NEW_USER="khandesh_user"
    NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    print_info "Creating dedicated MySQL user..."
    print_info "New user: ${NEW_USER}"
    print_info "New password: ${NEW_PASSWORD}"
    echo ""
    
    # Create user
    if mysql -u root -p${DB_PASSWORD} <<EOF 2>/dev/null
CREATE USER IF NOT EXISTS '${NEW_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${NEW_PASSWORD}';
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
        print_warning "New credentials saved to .env file"
    else
        print_error "Failed to create user. Please run manually:"
        echo ""
        echo "mysql -u root -p"
        echo "CREATE USER '${NEW_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${NEW_PASSWORD}';"
        echo "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${NEW_USER}'@'localhost';"
        echo "FLUSH PRIVILEGES;"
        echo "EXIT;"
    fi
fi

# Test connection
print_header "Testing Connection"

if [ -n "$NEW_USER" ] && [ -n "$NEW_PASSWORD" ]; then
    TEST_USER=$NEW_USER
    TEST_PASSWORD=$NEW_PASSWORD
else
    TEST_USER=$DB_USER
    TEST_PASSWORD=$DB_PASSWORD
fi

print_info "Testing connection with user: ${TEST_USER}"

if mysql -u ${TEST_USER} -p${TEST_PASSWORD} -e "SELECT 1" 2>/dev/null; then
    print_success "Connection successful!"
else
    print_error "Connection still failing"
    print_info "Please verify:"
    echo "  1. MySQL server is running: sudo systemctl status mysql"
    echo "  2. Password is correct in .env file"
    echo "  3. User exists: mysql -u root -p -e \"SELECT user, host FROM mysql.user;\""
    exit 1
fi

# Restart backend
print_header "Restarting Backend"

print_info "Restarting PM2 process..."
pm2 restart khandesh-api
sleep 2

# Check logs
print_info "Checking backend logs..."
pm2 logs khandesh-api --lines 10 --nostream | tail -20

print_success "============================================"
print_success "✅ MySQL Authentication Fixed!"
print_success "============================================"

if [ -n "$NEW_USER" ]; then
    print_info "New credentials saved to: ${ENV_FILE}"
    print_warning "Please keep these credentials secure!"
fi

