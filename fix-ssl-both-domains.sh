#!/bin/bash

# ============================================
# Fix SSL for Both www and non-www Domains
# ============================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

DOMAIN="khandeshmatrimony.com"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
WEB_ROOT="/var/www/khandeshmatrimony.com"

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "Run as root: sudo ./fix-ssl-both-domains.sh"
    exit 1
fi

echo "============================================"
echo "Fix SSL for Both Domains"
echo "============================================"
echo ""

# Step 1: Check current certificate
print_info "Step 1: Checking SSL certificate..."
CERT_INFO=$(certbot certificates 2>/dev/null | grep -A 10 "${DOMAIN}" || echo "")

if echo "$CERT_INFO" | grep -q "www.${DOMAIN}"; then
    print_success "Certificate covers both domains"
else
    print_warning "Certificate may not cover www subdomain"
    print_info "Requesting certificate for both domains..."
    
    # Stop Nginx temporarily for standalone mode
    systemctl stop nginx
    
    # Request certificate for both domains
    certbot certonly --standalone \
        -d ${DOMAIN} \
        -d www.${DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email info@${DOMAIN} \
        --preferred-challenges http
    
    # Start Nginx
    systemctl start nginx
    
    print_success "Certificate obtained for both domains"
fi

# Step 2: Update Nginx configuration
print_info "Step 2: Updating Nginx configuration..."

cat > "$NGINX_CONFIG" <<EOF
# HTTP - Redirect to HTTPS (both domains)
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS (prefer www)
    location / {
        return 301 https://www.\$server_name\$request_uri;
    }
}

# HTTPS - Non-www (redirect to www)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Redirect non-www to www
    return 301 https://www.${DOMAIN}\$request_uri;
}

# HTTPS - www (main site)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root ${WEB_ROOT};
    index index.html;

    # Main location
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
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

    # Uploads proxy
    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Step 3: Test and reload Nginx
print_info "Step 3: Testing Nginx configuration..."
if nginx -t; then
    print_success "Nginx configuration is valid"
    systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# Step 4: Verify SSL
print_info "Step 4: Verifying SSL..."
sleep 2

echo ""
print_success "============================================"
print_success "✅ SSL Fixed for Both Domains!"
print_success "============================================"
echo ""
print_info "Both domains now redirect to www:"
print_info "  http://${DOMAIN} → https://www.${DOMAIN}"
print_info "  https://${DOMAIN} → https://www.${DOMAIN}"
print_info "  https://www.${DOMAIN} ✅ (Main site)"
echo ""
print_warning "⚠️  Clear browser cache and test again!"
print_info "Test URLs:"
print_info "  - https://www.${DOMAIN}"
print_info "  - https://${DOMAIN} (should redirect to www)"

