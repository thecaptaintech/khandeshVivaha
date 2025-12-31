#!/bin/bash

# ============================================
# Fix SSL Certificate - Step by Step
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
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"

echo "============================================"
echo "Fix SSL Certificate - Step by Step"
echo "============================================"
echo ""

# Step 1: Fix Nginx config (remove SSL temporarily)
print_info "Step 1: Fixing Nginx configuration..."

# Create temporary HTTP-only config
cat > /tmp/nginx_temp.conf <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /var/www/khandeshmatrimony.com;
    index index.html;

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
    }
}
EOF

# Backup current config
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "Backed up current config"
fi

# Apply temporary HTTP config
cp /tmp/nginx_temp.conf "$NGINX_CONFIG"
nginx -t && systemctl reload nginx
print_success "Nginx configured for HTTP only (temporary)"

# Step 2: Request certificate
print_info "Step 2: Requesting SSL certificate..."
certbot certonly --nginx -d ${DOMAIN} -d www.${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL}

if [ $? -eq 0 ]; then
    print_success "Certificate obtained!"
else
    print_error "Certificate request failed!"
    exit 1
fi

# Step 3: Update Nginx with SSL
print_info "Step 3: Updating Nginx with SSL configuration..."

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

# HTTPS Configuration
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/khandeshmatrimony.com;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test and reload
nginx -t && systemctl reload nginx
print_success "Nginx configured with SSL"

# Step 4: Verify
print_info "Step 4: Verifying SSL..."
sleep 2
curl -I https://${DOMAIN} 2>&1 | head -5

print_success "============================================"
print_success "✅ SSL Certificate Fixed!"
print_success "============================================"
print_info "Your site should now be secure: https://${DOMAIN}"

