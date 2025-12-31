#!/bin/bash

# ============================================
# Truncate Tables Script
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

# Configuration
DB_NAME="khandesh_vivah"
BACKEND_DIR="/var/www/khandeshVivaha/backend"

# Load DB credentials from .env
if [ -f "${BACKEND_DIR}/.env" ]; then
    DB_USER=$(grep "^DB_USER=" "${BACKEND_DIR}/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    DB_PASSWORD=$(grep "^DB_PASSWORD=" "${BACKEND_DIR}/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    DB_HOST=$(grep "^DB_HOST=" "${BACKEND_DIR}/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    
    DB_USER=${DB_USER:-root}
    DB_HOST=${DB_HOST:-localhost}
else
    print_error ".env file not found at ${BACKEND_DIR}/.env"
    exit 1
fi

print_warning "============================================"
print_warning "⚠️  WARNING: This will DELETE ALL DATA!"
print_warning "============================================"
print_warning "Tables to truncate:"
print_warning "  - photos"
print_warning "  - userdetails"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Cancelled."
    exit 0
fi

# Create backup first
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
print_info "Creating backup: ${BACKUP_FILE}"

if [ -n "$DB_PASSWORD" ]; then
    mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > ${BACKUP_FILE} 2>/dev/null || {
        print_error "Backup failed. Please enter password manually:"
        mysqldump -h ${DB_HOST} -u ${DB_USER} -p ${DB_NAME} > ${BACKUP_FILE}
    }
else
    print_warning "No password in .env, will prompt for password"
    mysqldump -h ${DB_HOST} -u ${DB_USER} -p ${DB_NAME} > ${BACKUP_FILE}
fi

if [ -f "${BACKUP_FILE}" ]; then
    print_success "Backup created: ${BACKUP_FILE}"
else
    print_error "Backup failed!"
    exit 1
fi

# Truncate tables
print_info "Truncating tables..."

if [ -n "$DB_PASSWORD" ]; then
    mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} <<EOF
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE photos;
TRUNCATE TABLE userdetails;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Photos count:' AS info, COUNT(*) AS count FROM photos;
SELECT 'Userdetails count:' AS info, COUNT(*) AS count FROM userdetails;
EOF
else
    print_warning "No password in .env, will prompt for password"
    mysql -h ${DB_HOST} -u ${DB_USER} -p ${DB_NAME} <<EOF
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE photos;
TRUNCATE TABLE userdetails;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Photos count:' AS info, COUNT(*) AS count FROM photos;
SELECT 'Userdetails count:' AS info, COUNT(*) AS count FROM userdetails;
EOF
fi

if [ $? -eq 0 ]; then
    print_success "Tables truncated successfully!"
    print_info "Backup saved as: ${BACKUP_FILE}"
else
    print_error "Truncate failed!"
    exit 1
fi

