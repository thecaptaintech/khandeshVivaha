#!/bin/bash

# ============================================
# Production Deployment Script
# khandeshmatrimony.com
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

# Configuration
PROJECT_DIR="/var/www/khandeshVivaha"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"
DOMAIN="khandeshmatrimony.com"

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Run as root: sudo ./Production-deploy.sh"
    exit 1
fi

print_header "Production Deployment"

# Step 1: Update code (if using git)
print_header "Step 1: Updating Code"
if [ -d "$PROJECT_DIR/.git" ]; then
    print_info "Pulling latest code..."
    cd "$PROJECT_DIR"
    git pull origin main || print_warning "Git pull failed, continuing..."
else
    print_info "Not a git repository, skipping pull"
fi

# Step 2: Backend deployment
print_header "Step 2: Backend Deployment"
cd "$BACKEND_DIR"

print_info "Installing dependencies..."
npm install --production

print_info "Restarting backend service..."
pm2 restart khandesh-api --update-env || pm2 start server.js --name khandesh-api --update-env

sleep 2
print_success "Backend deployed"

# Step 3: Frontend deployment
print_header "Step 3: Frontend Deployment"
cd "$FRONTEND_DIR"

print_info "Installing dependencies..."
npm install

print_info "Cleaning build cache..."
rm -rf build node_modules/.cache

print_info "Building for production..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed!"
    exit 1
fi

print_info "Deploying to web root..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}"/*
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Verify favicon files are deployed
print_info "Verifying favicon files..."
FAVICON_FILES=(
    "favicon.ico"
    "favicon.svg"
    "favicon-96x96.png"
    "apple-touch-icon.png"
    "web-app-manifest-192x192.png"
    "web-app-manifest-512x512.png"
    "site.webmanifest"
)

FAVICON_OK=0
for file in "${FAVICON_FILES[@]}"; do
    if [ -f "${WEB_ROOT}/${file}" ]; then
        print_success "✓ ${file}"
        FAVICON_OK=$((FAVICON_OK + 1))
    else
        print_warning "⚠ Missing: ${file}"
    fi
done

if [ $FAVICON_OK -eq ${#FAVICON_FILES[@]} ]; then
    print_success "All favicon files deployed"
else
    print_warning "Some favicon files are missing. Check build output."
fi

print_success "Frontend deployed"

# Step 4: Reload Nginx
print_header "Step 4: Reloading Nginx"
if nginx -t; then
    systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# Step 5: Verification
print_header "Step 5: Verification"
print_info "Checking services..."

# Check backend
if pm2 list | grep -q "khandesh-api.*online"; then
    print_success "Backend: Running"
else
    print_error "Backend: Not running"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx: Running"
else
    print_error "Nginx: Not running"
fi

# Check frontend
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "Frontend: Deployed"
else
    print_error "Frontend: Not deployed"
fi

print_success "============================================"
print_success "✅ Deployment Complete!"
print_success "============================================"
print_info "Website: https://www.${DOMAIN}"
print_info "API: https://www.${DOMAIN}/api/health"
echo ""
print_warning "⚠️  Clear browser cache if needed!"

