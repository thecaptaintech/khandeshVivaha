#!/bin/bash

# ============================================
# Setup SSL Certificate for khandeshmatrimony.com
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
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

DOMAIN="khandeshmatrimony.com"
EMAIL="info@khandeshmatrimony.com"  # Change this to your email

echo "============================================"
echo "SSL Certificate Setup for ${DOMAIN}"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo ./setup-ssl.sh)"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_info "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot is already installed"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running. Please start it first: systemctl start nginx"
    exit 1
fi

# Check current Nginx config
print_info "Checking current Nginx configuration..."
if [ -f "/etc/nginx/sites-available/${DOMAIN}" ]; then
    print_success "Nginx config found: /etc/nginx/sites-available/${DOMAIN}"
    cat /etc/nginx/sites-available/${DOMAIN}
else
    print_warning "Nginx config not found. Creating basic config..."
    
    # Create basic HTTP config first
    cat > /etc/nginx/sites-available/${DOMAIN} <<EOF
server {
    listen 80;
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
    
    # Enable site
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t && systemctl reload nginx
    print_success "Basic HTTP config created"
fi

echo ""
print_info "Requesting SSL certificate from Let's Encrypt..."
echo ""

# Request certificate
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

if [ $? -eq 0 ]; then
    print_success "SSL certificate installed successfully!"
    echo ""
    print_info "Testing SSL configuration..."
    nginx -t && systemctl reload nginx
    print_success "Nginx reloaded with SSL configuration"
    echo ""
    print_success "============================================"
    print_success "SSL Setup Complete!"
    print_success "============================================"
    print_info "Your site should now be accessible at: https://${DOMAIN}"
    echo ""
    print_info "Certificate will auto-renew. Check renewal with: certbot renew --dry-run"
else
    print_error "SSL certificate installation failed!"
    echo ""
    print_info "Common issues:"
    echo "1. Domain DNS not pointing to this server"
    echo "2. Port 80 not accessible from internet"
    echo "3. Firewall blocking Let's Encrypt"
    echo ""
    print_info "Check DNS: dig ${DOMAIN} +short"
    print_info "Check firewall: ufw status"
    exit 1
fi

