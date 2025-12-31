#!/bin/bash

# ============================================
# Cleanup Unnecessary Files
# Keep only essential files for production
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo "============================================"
echo "Cleaning Up Unnecessary Files"
echo "============================================"
echo ""

# Files to KEEP (essential)
KEEP_FILES=(
    "deploy.sh"
    "deploy-final.sh"
    "README.md"
    "backend/setup_database.sql"
)

# Files to DELETE (unnecessary for production)
DELETE_FILES=(
    "fix-*.sh"
    "check-*.sh"
    "view-*.sh"
    "truncate-*.sh"
    "rebuild-*.sh"
    "FIX_*.md"
    "MYSQL_*.md"
    "SETUP_*.md"
    "DEPLOYMENT_*.md"
    "DNS_*.md"
    "VIEW_*.md"
    "TROUBLESHOOT_*.md"
    "PATH_*.md"
    "QUICK_*.md"
    "*.md"  # Will keep README.md separately
)

print_info "Files to keep:"
for file in "${KEEP_FILES[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        echo "  ✅ $file"
    fi
done

echo ""
read -p "Delete unnecessary files? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete fix/check/view scripts (keep deploy.sh and deploy-final.sh)
    for pattern in fix-*.sh check-*.sh view-*.sh truncate-*.sh rebuild-*.sh; do
        for file in $pattern; do
            if [ -f "$file" ] && [[ ! " ${KEEP_FILES[@]} " =~ " ${file} " ]]; then
                rm -f "$file"
                print_info "Deleted: $file"
            fi
        done
    done
    
    # Delete unnecessary .md files (keep README.md)
    for pattern in FIX_*.md MYSQL_*.md SETUP_*.md DEPLOYMENT_*.md DNS_*.md VIEW_*.md TROUBLESHOOT_*.md PATH_*.md QUICK_*.md; do
        for file in $pattern; do
            if [ -f "$file" ] && [[ ! " ${KEEP_FILES[@]} " =~ " ${file} " ]]; then
                rm -f "$file"
                print_info "Deleted: $file"
            fi
        done
    done
    
    print_success "Cleanup complete!"
else
    print_info "Cleanup cancelled"
fi

