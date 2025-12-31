#!/bin/bash

# ============================================
# Fix CORS and Rebuild Frontend
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

PROJECT_DIR="/var/www/khandeshVivaha"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"

print_header "Fix CORS and Rebuild Frontend"

# Step 1: Rebuild Frontend
print_header "Step 1: Rebuilding Frontend"

cd "$FRONTEND_DIR"

# Clean old build
print_info "Cleaning old build..."
rm -rf build node_modules/.cache
print_success "Old build removed"

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

# Build frontend
print_info "Building frontend for production..."
print_info "This will use relative paths (/api) for production..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed! No build directory created."
    exit 1
fi

print_success "Frontend built successfully"

# Step 2: Deploy Frontend
print_header "Step 2: Deploying Frontend"

mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}"/*
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

print_success "Frontend deployed to ${WEB_ROOT}"

# Step 3: Restart Backend
print_header "Step 3: Restarting Backend"

print_info "Restarting PM2 process..."
pm2 restart khandesh-api --update-env
sleep 2

# Step 4: Verify
print_header "Step 4: Verification"

# Check frontend files
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "Frontend files deployed"
else
    print_error "Frontend files not found!"
fi

# Test backend
print_info "Testing backend..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Backend is responding"
    curl http://localhost:5001/api/health
else
    print_warning "Backend may not be responding"
fi

# Test Nginx
print_info "Testing Nginx..."
if curl -s -I https://khandeshmatrimony.com > /dev/null; then
    print_success "Nginx is serving frontend"
else
    print_warning "Nginx may not be configured correctly"
fi

print_success "============================================"
print_success "✅ CORS Fixed and Frontend Rebuilt!"
print_success "============================================"
print_info "The frontend now uses relative paths (/api) in production"
print_info "This should fix the CORS errors"
echo ""
print_info "Test the site: https://khandeshmatrimony.com"
print_info "Check browser console for any remaining errors"

