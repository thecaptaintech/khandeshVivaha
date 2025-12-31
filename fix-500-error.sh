#!/bin/bash

# ============================================
# Fix 500 Internal Server Error
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

echo "============================================"
echo "Troubleshooting 500 Internal Server Error"
echo "============================================"
echo ""

# Check if running on VPS
if [ -f "/var/www/khandeshVivaha/backend/server.js" ] || [ -f "/root/khandeshvivah/backend/server.js" ]; then
    IS_VPS=true
    if [ -d "/var/www/khandeshVivaha" ]; then
        PROJECT_DIR="/var/www/khandeshVivaha"
    else
        PROJECT_DIR="/root/khandeshvivah"
    fi
else
    IS_VPS=false
    PROJECT_DIR="/var/www/khandeshmatrimony.com"
fi

BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"

echo "1. Checking PM2 Status..."
pm2 list
echo ""

echo "2. Checking Backend Health..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Backend is responding"
    curl http://localhost:5001/api/health
else
    print_error "Backend is NOT responding on port 5001"
    echo ""
    print_info "Checking if backend is running..."
    pm2 logs khandesh-api --lines 20 --nostream
fi
echo ""
echo ""

echo "3. Checking Frontend Files..."
if [ -d "$WEB_ROOT" ]; then
    print_info "Web root exists: $WEB_ROOT"
    ls -la "$WEB_ROOT" | head -10
    if [ -f "$WEB_ROOT/index.html" ]; then
        print_success "index.html exists"
    else
        print_error "index.html NOT found in $WEB_ROOT"
    fi
else
    print_error "Web root directory NOT found: $WEB_ROOT"
fi
echo ""
echo ""

echo "4. Checking Nginx Configuration..."
nginx -t
echo ""

echo "5. Checking Nginx Error Logs..."
tail -20 /var/log/nginx/error.log
echo ""
echo ""

echo "6. Checking Nginx Access Logs..."
tail -10 /var/log/nginx/access.log
echo ""
echo ""

echo "7. Checking File Permissions..."
if [ -d "$WEB_ROOT" ]; then
    ls -ld "$WEB_ROOT"
    ls -la "$WEB_ROOT" | head -5
fi
echo ""

echo "============================================"
echo "Common Fixes:"
echo "============================================"
echo ""
echo "If backend not running:"
echo "  cd $BACKEND_DIR && pm2 restart khandesh-api"
echo ""
echo "If frontend files missing:"
echo "  cd $PROJECT_DIR/frontend && npm run build"
echo "  cp -r build/* $WEB_ROOT/"
echo ""
echo "If permission issues:"
echo "  chown -R www-data:www-data $WEB_ROOT"
echo "  chmod -R 755 $WEB_ROOT"
echo ""
echo "If Nginx config issue:"
echo "  nginx -t"
echo "  systemctl reload nginx"
echo ""

