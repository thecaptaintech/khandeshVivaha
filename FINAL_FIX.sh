#!/bin/bash

# ============================================
# FINAL FIX - CORS & Cleanup
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

PROJECT_DIR="/var/www/khandeshVivaha"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
WEB_ROOT="/var/www/khandeshmatrimony.com"

echo "============================================"
echo "FINAL FIX - CORS & Production"
echo "============================================"
echo ""

# Step 1: Clean Frontend Build
print_info "Step 1: Cleaning frontend..."
cd "$FRONTEND_DIR"
rm -rf build node_modules/.cache .next
print_success "Clean complete"

# Step 2: Build
print_info "Step 2: Building frontend..."
npm run build
print_success "Build complete"

# Step 3: Deploy
print_info "Step 3: Deploying..."
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
print_success "Deployed"

# Step 4: Restart Backend
print_info "Step 4: Restarting backend..."
pm2 restart khandesh-api --update-env
print_success "Backend restarted"

# Step 5: Cleanup Files
print_info "Step 5: Cleaning up unnecessary files..."
cd "$PROJECT_DIR"

# Delete fix scripts (keep deploy.sh and deploy-final.sh)
rm -f fix-*.sh check-*.sh view-*.sh truncate-*.sh rebuild-*.sh setup-ssl.sh

# Delete unnecessary .md files (keep README.md)
rm -f FIX_*.md MYSQL_*.md SETUP_*.md DEPLOYMENT_*.md DNS_*.md VIEW_*.md \
      TROUBLESHOOT_*.md PATH_*.md QUICK_*.md APPLICATION_*.md \
      BROWSE_*.md COMPLETE_*.md CURRENT_*.md EMAIL_*.md FONT_*.md \
      MATRIMONY_*.md REGISTRATION_*.md STORAGE_*.md SYSTEM_*.md \
      TRANSPARENT_*.md README_PRODUCTION.md FIX_EVERYTHING.md

print_success "Cleanup complete"

print_success "============================================"
print_success "✅ ALL FIXED!"
print_success "============================================"
print_info "1. Clear browser cache: Ctrl+Shift+R"
print_info "2. Test: https://khandeshmatrimony.com"
print_info "3. Check console: Should see /api (not localhost)"

