#!/bin/bash

# ============================================
# Production Database Connection Check
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

PROJECT_DIR="/var/www/khandeshVivaha"
BACKEND_DIR="${PROJECT_DIR}/backend"

print_header "Database Connection Check"

# Check .env file
if [ ! -f "${BACKEND_DIR}/.env" ]; then
    print_error ".env file not found at ${BACKEND_DIR}/.env"
    exit 1
fi

print_success ".env file found"

# Load environment variables
cd "$BACKEND_DIR"
source .env 2>/dev/null || true

# Check required variables
print_header "Environment Variables"
if [ -z "$DB_HOST" ]; then
    print_error "DB_HOST not set"
else
    print_success "DB_HOST: $DB_HOST"
fi

if [ -z "$DB_USER" ]; then
    print_error "DB_USER not set"
else
    print_success "DB_USER: $DB_USER"
fi

if [ -z "$DB_NAME" ]; then
    print_error "DB_NAME not set"
else
    print_success "DB_NAME: $DB_NAME"
fi

if [ -z "$DB_PASSWORD" ]; then
    print_error "DB_PASSWORD not set"
else
    print_success "DB_PASSWORD: SET (hidden)"
fi

# Test connection using Node.js
print_header "Connection Test"
cd "$BACKEND_DIR"

node -e "
const db = require('./config/db');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const [result] = await db.query('SELECT 1 as test, DATABASE() as db_name, USER() as user');
        console.log('✅ Connection successful!');
        console.log('Database:', result[0].db_name);
        console.log('User:', result[0].user);
        
        // Test table access
        const [tables] = await db.query('SHOW TABLES');
        console.log('✅ Tables accessible:', tables.length, 'tables found');
        
        // Test admin table
        const [adminCount] = await db.query('SELECT COUNT(*) as count FROM admin');
        console.log('✅ Admin table accessible:', adminCount[0].count, 'admins');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        process.exit(1);
    }
}

testConnection();
" || {
    print_error "Database connection test failed"
    exit 1
}

print_success "============================================"
print_success "✅ Database Connection: OK"
print_success "============================================"

