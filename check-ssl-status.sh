#!/bin/bash

# ============================================
# Check SSL Certificate Status
# ============================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

DOMAIN="khandeshmatrimony.com"

echo "============================================"
echo "SSL Certificate Status"
echo "============================================"
echo ""

# Check certificate
print_info "Checking certificate..."
CERT_INFO=$(sudo certbot certificates 2>/dev/null | grep -A 15 "${DOMAIN}" || echo "No certificate found")

if [ -z "$CERT_INFO" ] || echo "$CERT_INFO" | grep -q "No certificates found"; then
    print_error "No certificate found!"
    exit 1
fi

echo "$CERT_INFO"
echo ""

# Check domains covered
if echo "$CERT_INFO" | grep -q "www.${DOMAIN}"; then
    print_success "Certificate covers www.${DOMAIN}"
else
    print_error "Certificate does NOT cover www.${DOMAIN}"
fi

if echo "$CERT_INFO" | grep -q "${DOMAIN}"; then
    print_success "Certificate covers ${DOMAIN}"
else
    print_error "Certificate does NOT cover ${DOMAIN}"
fi

echo ""
print_info "Testing SSL connection..."

# Test www
WWW_TEST=$(echo | openssl s_client -connect www.${DOMAIN}:443 -servername www.${DOMAIN} 2>/dev/null | grep -i "verify return code" || echo "")
if [ -n "$WWW_TEST" ]; then
    echo "www.${DOMAIN}: $WWW_TEST"
fi

# Test non-www
NON_WWW_TEST=$(echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | grep -i "verify return code" || echo "")
if [ -n "$NON_WWW_TEST" ]; then
    echo "${DOMAIN}: $NON_WWW_TEST"
fi

echo ""
print_info "Check Nginx config:"
print_info "  sudo nginx -t"
print_info "  sudo cat /etc/nginx/sites-available/${DOMAIN}"

