#!/bin/bash

# ============================================
# Fix Production Build - Rebuild Frontend
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

# Detect project directory
if [ -d "/var/www/khandeshVivaha" ]; then
    PROJECT_DIR="/var/www/khandeshVivaha"
elif [ -d "/root/khandeshvivah" ]; then
    PROJECT_DIR="/root/khandeshvivah"
else
    PROJECT_DIR="$(pwd)"
fi

FRONTEND_DIR="${PROJECT_DIR}/frontend"
WEB_ROOT="/var/www/khandeshmatrimony.com"

echo "============================================"
echo "Fix Production Build"
echo "============================================"
echo ""

print_info "Project directory: ${PROJECT_DIR}"
print_info "Frontend directory: ${FRONTEND_DIR}"
print_info "Web root: ${WEB_ROOT}"
echo ""

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: ${FRONTEND_DIR}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Remove old build
print_info "Cleaning old build..."
rm -rf build
print_success "Old build removed"

# Rebuild frontend
print_info "Building frontend for production..."
print_info "This will use relative paths (/api) for production..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed! No build directory created."
    exit 1
fi

print_success "Frontend built successfully"

# Deploy to web root
print_info "Deploying to web root..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}"/*
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

print_success "Frontend deployed to ${WEB_ROOT}"

# Verify files
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "index.html found"
else
    print_error "index.html not found!"
    exit 1
fi

echo ""
print_success "============================================"
print_success "✅ Frontend Rebuilt and Deployed"
print_success "============================================"
print_info "The frontend now uses relative paths (/api) for production"
print_info "This should fix the CORS errors"
echo ""

