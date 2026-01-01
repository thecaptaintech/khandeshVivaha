#!/bin/bash

# ============================================
# Verify DNS TXT Record for Google Search Console
# ============================================

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

DOMAIN="khandeshmatrimony.com"
VERIFICATION_STRING="google-site-verification=F9Mw7PBTCiPUFTr0_YK1IZB4lk-fA7uYaxw-krzleMo"

print_header "Google Search Console DNS Verification Check"

print_info "Checking TXT records for: $DOMAIN"
echo ""

# Check if dig is available
if command -v dig &> /dev/null; then
    print_info "Using dig to check DNS..."
    TXT_RECORDS=$(dig TXT $DOMAIN +short 2>/dev/null)
    
    if [ -z "$TXT_RECORDS" ]; then
        print_error "No TXT records found for $DOMAIN"
        print_warning "DNS may not have propagated yet, or record not added"
    else
        echo "Found TXT records:"
        echo "$TXT_RECORDS" | while read -r record; do
            echo "  - $record"
            if echo "$record" | grep -q "google-site-verification"; then
                if echo "$record" | grep -q "$VERIFICATION_STRING"; then
                    print_success "Google verification record found and matches!"
                else
                    print_warning "Google verification found but value doesn't match"
                    print_info "Expected: $VERIFICATION_STRING"
                fi
            fi
        done
    fi
elif command -v nslookup &> /dev/null; then
    print_info "Using nslookup to check DNS..."
    TXT_RECORDS=$(nslookup -type=TXT $DOMAIN 2>/dev/null | grep -A 10 "text =")
    
    if [ -z "$TXT_RECORDS" ]; then
        print_error "No TXT records found for $DOMAIN"
        print_warning "DNS may not have propagated yet, or record not added"
    else
        echo "Found TXT records:"
        echo "$TXT_RECORDS"
        if echo "$TXT_RECORDS" | grep -q "$VERIFICATION_STRING"; then
            print_success "Google verification record found!"
        else
            print_warning "Google verification record not found or doesn't match"
        fi
    fi
else
    print_error "Neither 'dig' nor 'nslookup' is available"
    print_info "Install one of them to check DNS records"
    print_info "  Ubuntu/Debian: sudo apt-get install dnsutils"
    print_info "  CentOS/RHEL: sudo yum install bind-utils"
fi

echo ""
print_header "Verification Details"
print_info "Domain: $DOMAIN"
print_info "Expected TXT Record:"
echo "  $VERIFICATION_STRING"
echo ""
print_info "To add this record in Hostinger:"
print_info "1. Go to Hostinger → Domains → DNS Zone Editor"
print_info "2. Add TXT record with value above"
print_info "3. Wait 5-60 minutes for DNS propagation"
print_info "4. Run this script again to verify"
echo ""
print_warning "Note: DNS changes can take up to 24 hours to propagate globally"

