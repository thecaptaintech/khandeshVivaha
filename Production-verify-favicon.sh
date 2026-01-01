#!/bin/bash

# ============================================
# Verify Favicon in Production
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
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

WEB_ROOT="/var/www/khandeshmatrimony.com"
DOMAIN="khandeshmatrimony.com"

print_header "Verifying Favicon in Production"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_warning "Some checks may require root access"
fi

# Check files in web root
print_info "Checking files in: ${WEB_ROOT}"

FAVICON_FILES=(
    "favicon.ico"
    "favicon.svg"
    "favicon-96x96.png"
    "apple-touch-icon.png"
    "web-app-manifest-192x192.png"
    "web-app-manifest-512x512.png"
    "site.webmanifest"
)

MISSING=0
EXISTS=0

for file in "${FAVICON_FILES[@]}"; do
    if [ -f "${WEB_ROOT}/${file}" ]; then
        FILE_SIZE=$(stat -c%s "${WEB_ROOT}/${file}" 2>/dev/null || stat -f%z "${WEB_ROOT}/${file}" 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -gt 0 ]; then
            print_success "✓ ${file} (${FILE_SIZE} bytes)"
            EXISTS=$((EXISTS + 1))
        else
            print_warning "⚠ ${file} exists but is empty"
            MISSING=$((MISSING + 1))
        fi
    else
        print_error "✗ ${file} - NOT FOUND"
        MISSING=$((MISSING + 1))
    fi
done

echo ""
print_info "Summary:"
print_info "  Found: ${EXISTS}/${#FAVICON_FILES[@]} files"
if [ $MISSING -gt 0 ]; then
    print_warning "  Missing: ${MISSING} files"
fi

# Check HTML references
print_header "Checking HTML References"
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_info "Checking index.html for favicon links..."
    
    if grep -q "favicon.ico" "${WEB_ROOT}/index.html"; then
        print_success "✓ favicon.ico referenced in HTML"
    else
        print_error "✗ favicon.ico NOT referenced in HTML"
    fi
    
    if grep -q "favicon.svg" "${WEB_ROOT}/index.html"; then
        print_success "✓ favicon.svg referenced in HTML"
    else
        print_warning "⚠ favicon.svg not referenced in HTML"
    fi
    
    if grep -q "apple-touch-icon" "${WEB_ROOT}/index.html"; then
        print_success "✓ apple-touch-icon referenced in HTML"
    else
        print_warning "⚠ apple-touch-icon not referenced in HTML"
    fi
    
    if grep -q "site.webmanifest" "${WEB_ROOT}/index.html"; then
        print_success "✓ site.webmanifest referenced in HTML"
    else
        print_warning "⚠ site.webmanifest not referenced in HTML"
    fi
else
    print_error "index.html not found in ${WEB_ROOT}"
fi

# Test URLs
print_header "Testing Favicon URLs"
print_info "Test these URLs in your browser:"
echo ""
print_info "https://${DOMAIN}/favicon.ico"
print_info "https://${DOMAIN}/favicon.svg"
print_info "https://${DOMAIN}/favicon-96x96.png"
print_info "https://${DOMAIN}/apple-touch-icon.png"
echo ""

# Check Nginx configuration
print_header "Checking Nginx Configuration"
if [ -f "/etc/nginx/sites-enabled/${DOMAIN}" ] || [ -f "/etc/nginx/sites-enabled/${DOMAIN}.conf" ]; then
    NGINX_CONFIG=$(find /etc/nginx/sites-enabled -name "*${DOMAIN}*" | head -1)
    if grep -q "favicon" "$NGINX_CONFIG" 2>/dev/null; then
        print_info "Nginx has favicon-specific configuration"
    else
        print_info "Nginx should serve static files from ${WEB_ROOT}"
    fi
    print_success "Nginx config found: ${NGINX_CONFIG}"
else
    print_warning "Nginx config for ${DOMAIN} not found"
fi

# Final summary
echo ""
print_success "============================================"
if [ $MISSING -eq 0 ]; then
    print_success "✅ All Favicon Files Present!"
    print_success "============================================"
    print_info "Favicon should work in production."
    print_info "If not visible, clear browser cache:"
    print_info "  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
    print_info "  - Or try incognito/private mode"
else
    print_warning "⚠️  Some Favicon Files Missing!"
    print_success "============================================"
    print_info "Run: sudo ./Production-deploy.sh"
    print_info "This will rebuild and redeploy with favicon files"
fi
echo ""

