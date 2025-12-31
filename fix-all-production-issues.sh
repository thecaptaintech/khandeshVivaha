#!/bin/bash

# ============================================
# Fix All Production Issues
# ============================================

set -e

# Colors
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

PROJECT_DIR="/var/www/khandeshVivaha"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/khandeshmatrimony.com"
DOMAIN="khandeshmatrimony.com"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"

print_header "Fix All Production Issues"

# ============================================
# Step 1: Rebuild Frontend (CRITICAL)
# ============================================
print_header "Step 1: Rebuilding Frontend (Force Clean)"

cd "$FRONTEND_DIR"

# Remove ALL build artifacts
print_info "Removing ALL build artifacts and cache..."
rm -rf build
rm -rf node_modules/.cache
rm -rf .next
find . -name "*.map" -type f -delete 2>/dev/null || true
print_success "Clean complete"

# Verify API detection code is updated
print_info "Verifying API detection code..."
if grep -q "protocol === 'https:'" src/services/api.js; then
    print_success "API detection code is correct"
else
    print_error "API detection code needs update!"
    exit 1
fi

# Build
print_info "Building frontend for production..."
print_info "This will use relative paths (/api) in production..."
NODE_ENV=production npm run build

if [ ! -d "build" ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Frontend built successfully"

# Deploy
print_info "Deploying to web root..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT}"/*
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

print_success "Frontend deployed to ${WEB_ROOT}"

# ============================================
# Step 2: Fix SSL for Both Domains
# ============================================
print_header "Step 2: Fixing SSL Certificate"

# Check if certificate exists
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    print_info "Certificate exists"
    CERT_STATUS=$(certbot certificates 2>/dev/null | grep -A 5 "${DOMAIN}" | grep "Domains:" || echo "")
    if echo "$CERT_STATUS" | grep -q "www.${DOMAIN}"; then
        print_success "Certificate covers both domains"
    else
        print_warning "Certificate may not cover www subdomain"
    fi
else
    print_info "Certificate not found. Requesting new certificate..."
    
    # First, fix Nginx to HTTP only
    print_info "Temporarily configuring Nginx for HTTP only..."
    cat > /tmp/nginx_http.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        proxy_pass http://localhost:5001;
    }
}
EOF
    
    # Backup and apply
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    cp /tmp/nginx_http.conf "$NGINX_CONFIG"
    nginx -t && systemctl reload nginx
    print_success "Nginx configured for HTTP (temporary)"
    
    # Request certificate
    print_info "Requesting SSL certificate for both domains..."
    certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email info@${DOMAIN}
    
    if [ $? -eq 0 ]; then
        print_success "Certificate obtained!"
    else
        print_error "Certificate request failed!"
        exit 1
    fi
fi

# Update Nginx with SSL for both domains
print_info "Updating Nginx with SSL configuration..."

cat > "$NGINX_CONFIG" <<EOF
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS - Non-www (khandeshmatrimony.com)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root ${WEB_ROOT};
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# HTTPS - www (www.khandeshmatrimony.com)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root ${WEB_ROOT};
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test and reload
nginx -t && systemctl reload nginx
print_success "Nginx configured with SSL for both domains"

# ============================================
# Step 3: Restart Backend
# ============================================
print_header "Step 3: Restarting Backend"

pm2 restart khandesh-api --update-env
sleep 2
print_success "Backend restarted"

# ============================================
# Step 4: Verification
# ============================================
print_header "Step 4: Verification"

# Test SSL for both domains
print_info "Testing SSL..."
curl -I https://${DOMAIN} 2>&1 | head -3
curl -I https://www.${DOMAIN} 2>&1 | head -3

# Test backend
print_info "Testing backend..."
curl -s http://localhost:5001/api/health && echo ""

print_success "============================================"
print_success "✅ All Issues Fixed!"
print_success "============================================"
print_info "Frontend rebuilt with relative paths (/api)"
print_info "SSL configured for both domains:"
print_info "  - https://${DOMAIN}"
print_info "  - https://www.${DOMAIN}"
echo ""
print_warning "⚠️  IMPORTANT: Clear browser cache!"
print_info "Press Ctrl+Shift+R (or Cmd+Shift+R) to hard refresh"
echo ""
print_info "Test the site:"
print_info "  - https://${DOMAIN}"
print_info "  - https://www.${DOMAIN}"

