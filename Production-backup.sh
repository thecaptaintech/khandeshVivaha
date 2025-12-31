#!/bin/bash

# ============================================
# Production Database Backup
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
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

PROJECT_DIR="/var/www/khandeshVivaha"
BACKEND_DIR="${PROJECT_DIR}/backend"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Load DB credentials
cd "$BACKEND_DIR"
if [ ! -f ".env" ]; then
    print_error ".env file not found"
    exit 1
fi

source .env 2>/dev/null || true

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "Database credentials not found in .env"
    exit 1
fi

print_header "Database Backup"

# Create backup directory
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/khandesh_vivah_${DATE}.sql"

print_info "Creating backup..."
print_info "Database: $DB_NAME"
print_info "Backup file: $BACKUP_FILE"

# Create backup
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null || {
    print_error "Backup failed!"
    exit 1
}

# Compress backup
print_info "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get file size
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

print_success "Backup created successfully!"
print_info "File: $BACKUP_FILE"
print_info "Size: $FILE_SIZE"

# Clean old backups (keep last 7 days)
print_info "Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "khandesh_vivah_*.sql.gz" -mtime +7 -delete 2>/dev/null || true

# List backups
print_header "Available Backups"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -5 || print_info "No previous backups"

print_success "============================================"
print_success "✅ Backup Complete!"
print_success "============================================"

