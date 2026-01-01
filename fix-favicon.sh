#!/bin/bash

# ============================================
# Fix Favicon Display Issues
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

FRONTEND_PUBLIC="frontend/public"

print_header "Fixing Favicon Display"

# Verify all favicon files exist
print_info "Checking favicon files..."

FILES=(
    "favicon.ico"
    "favicon.svg"
    "favicon-96x96.png"
    "apple-touch-icon.png"
    "web-app-manifest-192x192.png"
    "web-app-manifest-512x512.png"
    "site.webmanifest"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "${FRONTEND_PUBLIC}/${file}" ]; then
        print_success "Found: ${file}"
    else
        print_info "⚠️  Missing: ${file}"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    print_info "Some files are missing. Checking favicon/ folder..."
    if [ -d "${FRONTEND_PUBLIC}/favicon" ]; then
        print_info "Copying files from favicon/ folder..."
        cp "${FRONTEND_PUBLIC}/favicon/"*.ico "${FRONTEND_PUBLIC}/" 2>/dev/null || true
        cp "${FRONTEND_PUBLIC}/favicon/"*.svg "${FRONTEND_PUBLIC}/" 2>/dev/null || true
        cp "${FRONTEND_PUBLIC}/favicon/"*.png "${FRONTEND_PUBLIC}/" 2>/dev/null || true
        cp "${FRONTEND_PUBLIC}/favicon/site.webmanifest" "${FRONTEND_PUBLIC}/" 2>/dev/null || true
        print_success "Files copied"
    fi
fi

# Verify favicon.ico exists and is valid
if [ -f "${FRONTEND_PUBLIC}/favicon.ico" ]; then
    FILE_SIZE=$(stat -f%z "${FRONTEND_PUBLIC}/favicon.ico" 2>/dev/null || stat -c%s "${FRONTEND_PUBLIC}/favicon.ico" 2>/dev/null || echo "0")
    if [ "$FILE_SIZE" -gt 0 ]; then
        print_success "favicon.ico is valid (${FILE_SIZE} bytes)"
    else
        print_info "⚠️  favicon.ico appears to be empty"
    fi
else
    print_info "⚠️  favicon.ico not found!"
fi

print_success "============================================"
print_success "✅ Favicon Check Complete!"
print_success "============================================"
echo ""
print_info "Next steps:"
print_info "1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)"
print_info "2. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
print_info "3. Or try: http://localhost:3001/favicon.ico directly"
print_info "4. Restart React dev server if needed"
echo ""
print_info "To test favicon:"
print_info "  Open: http://localhost:3001/favicon.ico"
print_info "  Should see the favicon image"
echo ""

