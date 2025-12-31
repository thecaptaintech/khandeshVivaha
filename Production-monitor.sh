#!/bin/bash

# ============================================
# Production System Monitor
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

DOMAIN="khandeshmatrimony.com"

clear
echo "============================================"
echo "Production System Monitor"
echo "Press Ctrl+C to exit"
echo "============================================"
echo ""

while true; do
    # Clear screen (keep header)
    tput cup 4 0
    
    # Backend Status
    if pm2 list | grep -q "khandesh-api.*online"; then
        BACKEND_STATUS="${GREEN}✅ Running${NC}"
        BACKEND_UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="khandesh-api") | .pm2_env.status' 2>/dev/null || echo "online")
    else
        BACKEND_STATUS="${RED}❌ Stopped${NC}"
    fi
    
    # Nginx Status
    if systemctl is-active --quiet nginx; then
        NGINX_STATUS="${GREEN}✅ Running${NC}"
    else
        NGINX_STATUS="${RED}❌ Stopped${NC}"
    fi
    
    # Database Status
    DB_STATUS=$(mysqladmin ping -h localhost 2>/dev/null && echo -e "${GREEN}✅ Connected${NC}" || echo -e "${RED}❌ Disconnected${NC}")
    
    # Memory
    MEM_USED=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$MEM_USED > 80" | bc -l) )); then
        MEM_STATUS="${RED}${MEM_USED}%${NC}"
    elif (( $(echo "$MEM_USED > 60" | bc -l) )); then
        MEM_STATUS="${YELLOW}${MEM_USED}%${NC}"
    else
        MEM_STATUS="${GREEN}${MEM_USED}%${NC}"
    fi
    
    # CPU
    CPU_USED=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$CPU_USED > 80" | bc -l) )); then
        CPU_STATUS="${RED}${CPU_USED}%${NC}"
    elif (( $(echo "$CPU_USED > 60" | bc -l) )); then
        CPU_STATUS="${YELLOW}${CPU_USED}%${NC}"
    else
        CPU_STATUS="${GREEN}${CPU_USED}%${NC}"
    fi
    
    # Display
    echo -e "Backend:    $BACKEND_STATUS"
    echo -e "Nginx:      $NGINX_STATUS"
    echo -e "Database:   $DB_STATUS"
    echo -e "Memory:     $MEM_STATUS"
    echo -e "CPU:        $CPU_STATUS"
    echo -e "Time:       $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    sleep 5
done

