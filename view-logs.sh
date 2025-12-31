#!/bin/bash

# ============================================
# View Logs - Last 1000 Lines
# ============================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

LINES=${1:-1000}

echo "============================================"
echo "Viewing Logs - Last ${LINES} Lines"
echo "============================================"
echo ""

# Backend Logs (PM2)
print_header "Backend Logs (PM2) - Last ${LINES} Lines"
if command -v pm2 &> /dev/null; then
    pm2 logs khandesh-api --lines ${LINES} --nostream 2>/dev/null || {
        print_info "PM2 logs not available or app not running"
        print_info "Check: pm2 list"
    }
else
    print_info "PM2 not installed"
fi

# Nginx Error Logs
print_header "Nginx Error Logs - Last ${LINES} Lines"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -${LINES} /var/log/nginx/error.log 2>/dev/null || {
        print_info "Nginx error log not accessible"
    }
else
    print_info "Nginx error log not found"
fi

# Nginx Access Logs
print_header "Nginx Access Logs - Last ${LINES} Lines"
if [ -f "/var/log/nginx/access.log" ]; then
    sudo tail -${LINES} /var/log/nginx/access.log 2>/dev/null || {
        print_info "Nginx access log not accessible"
    }
else
    print_info "Nginx access log not found"
fi

# MySQL Error Logs
print_header "MySQL Error Logs - Last ${LINES} Lines"
if [ -f "/var/log/mysql/error.log" ]; then
    sudo tail -${LINES} /var/log/mysql/error.log 2>/dev/null || {
        print_info "MySQL error log not accessible"
    }
else
    print_info "MySQL error log not found"
fi

# System Logs
print_header "System Logs (Journal) - Last ${LINES} Lines"
if command -v journalctl &> /dev/null; then
    sudo journalctl -n ${LINES} --no-pager 2>/dev/null || {
        print_info "System logs not accessible"
    }
else
    print_info "journalctl not available"
fi

echo ""
print_success "Logs displayed (last ${LINES} lines each)"
print_info "To view real-time logs:"
echo "  • Backend: pm2 logs khandesh-api"
echo "  • Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  • System: sudo journalctl -f"

