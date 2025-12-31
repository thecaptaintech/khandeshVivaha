#!/bin/bash

# ============================================
# Production Logs Viewer
# ============================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}============================================${NC}\n"; }

LINES=${1:-50}

print_header "Production Logs Viewer"

echo "Select log type:"
echo "1) Backend (PM2) - Last $LINES lines"
echo "2) Backend (PM2) - Follow (live)"
echo "3) Nginx Access Log"
echo "4) Nginx Error Log"
echo "5) System Log"
echo "6) All Backend Logs (Error + Output)"
echo ""
read -p "Enter choice (1-6): " choice

case $choice in
    1)
        print_header "Backend Logs (Last $LINES lines)"
        pm2 logs khandesh-api --lines $LINES --nostream
        ;;
    2)
        print_header "Backend Logs (Live - Press Ctrl+C to exit)"
        pm2 logs khandesh-api
        ;;
    3)
        print_header "Nginx Access Log (Last $LINES lines)"
        tail -n $LINES /var/log/nginx/access.log
        ;;
    4)
        print_header "Nginx Error Log (Last $LINES lines)"
        tail -n $LINES /var/log/nginx/error.log
        ;;
    5)
        print_header "System Log (Last $LINES lines)"
        journalctl -n $LINES --no-pager
        ;;
    6)
        print_header "All Backend Logs (Last $LINES lines)"
        echo "=== Error Log ==="
        pm2 logs khandesh-api --err --lines $LINES --nostream
        echo ""
        echo "=== Output Log ==="
        pm2 logs khandesh-api --out --lines $LINES --nostream
        ;;
    *)
        print_info "Invalid choice"
        exit 1
        ;;
esac

