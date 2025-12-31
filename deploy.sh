#!/bin/bash

# ============================================
# Production Deployment Script
# khandeshmatrimony.com
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

# Configuration
PROJECT_DIR="/var/www/khandeshVivaha"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"
DOMAIN="khandeshmatrimony.com"

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Run as root: sudo ./deploy.sh"
    exit 1
fi

echo "============================================"
echo "Production Deployment"
echo "============================================"
echo ""

# Step 1: Rebuild Frontend
print_info "Step 1: Rebuilding Frontend..."
cd "$FRONTEND_DIR"
rm -rf build node_modules/.cache
npm run build
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
print_success "Frontend deployed"

# Step 2: Restart Backend
print_info "Step 2: Restarting Backend..."
pm2 restart khandesh-api --update-env
print_success "Backend restarted"

# Step 3: Reload Nginx
print_info "Step 3: Reloading Nginx..."
nginx -t && systemctl reload nginx
print_success "Nginx reloaded"

print_success "============================================"
print_success "✅ Deployment Complete!"
print_success "============================================"
print_info "Clear browser cache: Ctrl+Shift+R"
print_info "Test: https://${DOMAIN}"

