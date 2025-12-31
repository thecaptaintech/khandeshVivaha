#!/bin/bash

# ============================================
# Fix SSL Certificate - Complete Setup
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

DOMAIN="khandeshmatrimony.com"
EMAIL="info@khandeshmatrimony.com"

echo "============================================"
echo "Fix SSL Certificate"
echo "============================================"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_info "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
fi

# Check if certificate exists
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    print_info "Certificate exists. Checking validity..."
    certbot certificates | grep -A 5 "${DOMAIN}"
    
    read -p "Do you want to renew/reinstall? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting existing certificate..."
        certbot delete --cert-name ${DOMAIN} --non-interactive 2>/dev/null || true
    else
        print_info "Skipping SSL setup"
        exit 0
    fi
fi

# Verify DNS
print_info "Verifying DNS..."
DNS_IP=$(dig +short ${DOMAIN} A | head -1)
EXPECTED_IP="77.37.44.226"

if [ "$DNS_IP" = "$EXPECTED_IP" ]; then
    print_success "DNS is correct: ${DOMAIN} -> ${DNS_IP}"
else
    print_error "DNS mismatch!"
    print_info "Expected: ${EXPECTED_IP}"
    print_info "Got: ${DNS_IP}"
    print_warning "Please fix DNS first, then run this script again"
    exit 1
fi

# Request certificate
print_info "Requesting SSL certificate..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --redirect

if [ $? -eq 0 ]; then
    print_success "SSL certificate installed!"
    
    # Test Nginx
    nginx -t && systemctl reload nginx
    print_success "Nginx reloaded"
    
    # Test SSL
    print_info "Testing SSL..."
    curl -I https://${DOMAIN} 2>&1 | head -5
else
    print_error "SSL installation failed!"
    exit 1
fi

print_success "============================================"
print_success "✅ SSL Certificate Fixed!"
print_success "============================================"

