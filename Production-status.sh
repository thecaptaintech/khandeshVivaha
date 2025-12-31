#!/bin/bash

# ============================================
# Production Status Check
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

PROJECT_DIR="/var/www/khandeshVivaha"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"
DOMAIN="khandeshmatrimony.com"

print_header "Production System Status"

# Backend Status
print_header "Backend Service (PM2)"
if command -v pm2 &> /dev/null; then
    pm2 list | grep -E "khandesh-api|Name|Status" || print_error "Backend not found in PM2"
    echo ""
    pm2 info khandesh-api 2>/dev/null | grep -E "status|uptime|restarts|memory" || print_error "Backend service not running"
else
    print_error "PM2 not installed"
fi

# Nginx Status
print_header "Nginx Web Server"
if systemctl is-active --quiet nginx; then
    print_success "Status: Running"
    systemctl status nginx --no-pager -l | head -5
else
    print_error "Status: Not running"
fi

# Frontend Status
print_header "Frontend Files"
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "Status: Deployed"
    print_info "Location: ${WEB_ROOT}"
    print_info "Size: $(du -sh ${WEB_ROOT} 2>/dev/null | cut -f1)"
    print_info "Last modified: $(stat -c %y ${WEB_ROOT}/index.html 2>/dev/null | cut -d' ' -f1)"
else
    print_error "Status: Not deployed"
fi

# Database Status
print_header "Database Connection"
if [ -f "${BACKEND_DIR}/.env" ]; then
    cd "$BACKEND_DIR"
    node -e "
        const db = require('./config/db');
        db.query('SELECT 1').then(() => {
            console.log('✅ Database: Connected');
            process.exit(0);
        }).catch(err => {
            console.log('❌ Database: Connection failed');
            console.log('Error:', err.message);
            process.exit(1);
        });
    " 2>/dev/null || print_error "Database: Connection test failed"
else
    print_error "Database: .env file not found"
fi

# SSL Certificate Status
print_header "SSL Certificate"
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    CERT_INFO=$(certbot certificates 2>/dev/null | grep -A 10 "${DOMAIN}" || echo "")
    if echo "$CERT_INFO" | grep -q "VALID"; then
        print_success "Status: Valid"
        EXPIRY=$(echo "$CERT_INFO" | grep "Expiry Date" | head -1)
        print_info "$EXPIRY"
    else
        print_warning "Status: Check required"
    fi
else
    print_error "Status: Certificate not found"
fi

# Port Status
print_header "Port Status"
if netstat -tuln 2>/dev/null | grep -q ":5001"; then
    print_success "Port 5001: In use (Backend)"
else
    print_error "Port 5001: Not in use"
fi

if netstat -tuln 2>/dev/null | grep -q ":443"; then
    print_success "Port 443: In use (HTTPS)"
else
    print_error "Port 443: Not in use"
fi

# Disk Space
print_header "Disk Usage"
df -h / | tail -1 | awk '{print "Root: " $5 " used (" $3 " / " $2 ")"}'
df -h "$PROJECT_DIR" 2>/dev/null | tail -1 | awk '{print "Project: " $5 " used"}' || print_info "Project: N/A"

# Memory
print_header "Memory Usage"
free -h | grep Mem | awk '{print "Memory: " $3 " / " $2 " (" int($3/$2*100) "%)"}'

print_header "Status Check Complete"

