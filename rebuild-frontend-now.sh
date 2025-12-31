#!/bin/bash

# ============================================
# Rebuild Frontend - Force Clean Build
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
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

FRONTEND_DIR="/var/www/khandeshVivaha/frontend"
WEB_ROOT="/var/www/khandeshmatrimony.com"

echo "============================================"
echo "Rebuilding Frontend - Force Clean Build"
echo "============================================"
echo ""

cd "$FRONTEND_DIR"

# Remove ALL build artifacts
print_info "Cleaning ALL build artifacts..."
rm -rf build
rm -rf node_modules/.cache
rm -rf .next
find . -name "*.map" -type f -delete 2>/dev/null || true
print_success "Clean complete"

# Build
print_info "Building frontend..."
NODE_ENV=production npm run build

if [ ! -d "build" ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build complete"

# Deploy
print_info "Deploying to web root..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}"/*
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

print_success "Deployed to ${WEB_ROOT}"

# Verify
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "✅ Frontend rebuilt and deployed!"
    print_info "Now test: https://khandeshmatrimony.com"
else
    print_error "Deployment failed!"
    exit 1
fi

