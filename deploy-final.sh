#!/bin/bash

# ============================================
# FINAL PRODUCTION DEPLOYMENT SCRIPT
# khandeshmatrimony.com
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

# Configuration
DOMAIN="khandeshmatrimony.com"
VPS_IP="77.37.44.226"
BACKEND_PORT="5001"
FRONTEND_PORT="3001"

# Detect project directory
if [ -d "/var/www/khandeshVivaha" ]; then
    PROJECT_DIR="/var/www/khandeshVivaha"
elif [ -d "/root/khandeshvivah" ]; then
    PROJECT_DIR="/root/khandeshvivah"
else
    PROJECT_DIR="$(pwd)"
fi

BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"

# WEB_ROOT is where Nginx serves the built frontend files
# This is separate from your source code directory
# Source code: /var/www/khandeshVivaha/ (your project)
# Web root: /var/www/khandeshmatrimony.com/ (built frontend files)
WEB_ROOT="/var/www/khandeshmatrimony.com"
EMAIL="info@khandeshmatrimony.com"  # Change this to your email

print_info "Detected project directory: ${PROJECT_DIR}"
print_info "Source code: ${PROJECT_DIR}/"
print_info "Web root (built files): ${WEB_ROOT}/"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo ./deploy-final.sh)"
    exit 1
fi

print_header "FINAL PRODUCTION DEPLOYMENT"
print_info "Domain: ${DOMAIN}"
print_info "VPS IP: ${VPS_IP}"
print_info "Backend Port: ${BACKEND_PORT}"
print_info "Frontend Port: ${FRONTEND_PORT}"
print_info "Project Directory: ${PROJECT_DIR}"
echo ""

# ============================================
# Step 1: Check Prerequisites
# ============================================
print_header "CHECKING PREREQUISITES"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: ${PROJECT_DIR}"
    print_info "Please ensure project is cloned to: ${PROJECT_DIR}"
    exit 1
fi
print_success "Project directory exists"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
NODE_VERSION=$(node -v)
print_success "Node.js installed: ${NODE_VERSION}"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    npm install -g pm2
fi
print_success "PM2 installed"

# Check Nginx
if ! command -v nginx &> /dev/null; then
    print_error "Nginx not found. Installing..."
    apt-get update
    apt-get install -y nginx
fi
print_success "Nginx installed"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found. Make sure MySQL server is installed and running."
fi

# ============================================
# Step 2: Setup Backend
# ============================================
print_header "SETTING UP BACKEND"

cd "$BACKEND_DIR"

# Check .env file
if [ ! -f ".env" ]; then
    print_error ".env file not found in ${BACKEND_DIR}"
    print_info "Creating .env from template..."
    cat > .env <<EOF
PORT=${BACKEND_PORT}
NODE_ENV=production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=khandesh_vivah
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=https://${DOMAIN}
EOF
    print_warning "Please edit ${BACKEND_DIR}/.env with your actual credentials"
    read -p "Press Enter after updating .env file..."
fi
print_success ".env file exists"

# Install dependencies
print_info "Installing backend dependencies..."
npm install --production
print_success "Backend dependencies installed"

# Stop existing PM2 process
print_info "Stopping existing backend process..."
pm2 stop khandesh-api 2>/dev/null || true
pm2 delete khandesh-api 2>/dev/null || true

# Start backend with PM2
print_info "Starting backend on port ${BACKEND_PORT}..."
pm2 start server.js --name khandesh-api --update-env
pm2 save
print_success "Backend started with PM2"

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null; then
    print_success "Backend is responding on port ${BACKEND_PORT}"
else
    print_warning "Backend may not be responding. Check logs: pm2 logs khandesh-api"
fi

# ============================================
# Step 3: Setup Frontend
# ============================================
print_header "SETTING UP FRONTEND"

cd "$FRONTEND_DIR"

# Install dependencies
print_info "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build frontend
print_info "Building frontend for production..."
npm run build
print_success "Frontend built successfully"

# Create web root directory
mkdir -p "$WEB_ROOT"

# Copy build files
print_info "Copying build files to web root..."
cp -r build/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
print_success "Frontend files deployed to ${WEB_ROOT}"

# ============================================
# Step 4: Setup Nginx
# ============================================
print_header "SETTING UP NGINX"

# Create Nginx configuration
print_info "Creating Nginx configuration..."

cat > /etc/nginx/sites-available/${DOMAIN} <<EOF
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
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root ${WEB_ROOT};
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
        proxy_pass http://localhost:${BACKEND_PORT};
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
        proxy_pass http://localhost:${BACKEND_PORT};
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

# Enable site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
print_success "Nginx configuration is valid"

# Reload Nginx
systemctl reload nginx
print_success "Nginx reloaded"

# ============================================
# Step 5: Setup SSL Certificate
# ============================================
print_header "SETTING UP SSL CERTIFICATE"

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    print_info "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot is already installed"
fi

# Check if certificate already exists
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    print_info "SSL certificate already exists"
    read -p "Do you want to renew/reinstall SSL certificate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Requesting SSL certificate..."
        certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect --force-renewal
    else
        print_info "Skipping SSL setup. Using existing certificate."
    fi
else
    print_info "Requesting SSL certificate from Let's Encrypt..."
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate installed successfully!"
    else
        print_error "SSL certificate installation failed!"
        print_warning "This might be due to:"
        print_warning "1. DNS not pointing to this server"
        print_warning "2. Port 80 not accessible"
        print_warning "3. Firewall blocking Let's Encrypt"
        print_info "You can run SSL setup later with: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    fi
fi

# ============================================
# Step 6: Configure Firewall
# ============================================
print_header "CONFIGURING FIREWALL"

# Check if UFW is active
if command -v ufw &> /dev/null; then
    print_info "Configuring UFW firewall..."
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow ${BACKEND_PORT}/tcp 2>/dev/null || true
    ufw --force enable 2>/dev/null || true
    print_success "Firewall configured"
else
    print_info "UFW not found. Make sure ports 80, 443, and ${BACKEND_PORT} are open."
fi

# ============================================
# Step 7: Verify DNS
# ============================================
print_header "VERIFYING DNS CONFIGURATION"

print_info "Checking DNS records..."
DNS_RESULT=$(dig +short ${DOMAIN} A | head -1)
if [ "$DNS_RESULT" = "$VPS_IP" ]; then
    print_success "DNS A record is correct: ${DOMAIN} -> ${VPS_IP}"
else
    print_warning "DNS A record may not be correct:"
    print_warning "Expected: ${VPS_IP}"
    print_warning "Got: ${DNS_RESULT:-not found}"
    print_info "Please verify DNS in Hostinger DNS Zone Editor:"
    print_info "  Type: A, Name: @, Value: ${VPS_IP}"
fi

WWW_RESULT=$(dig +short www.${DOMAIN} A | head -1)
if [ -n "$WWW_RESULT" ]; then
    print_success "www.${DOMAIN} DNS record exists: ${WWW_RESULT}"
else
    print_warning "www.${DOMAIN} DNS record not found"
    print_info "Please add CNAME record in Hostinger:"
    print_info "  Type: CNAME, Name: www, Value: ${DOMAIN}"
fi

# ============================================
# Step 8: Final Verification
# ============================================
print_header "FINAL VERIFICATION"

# Check PM2 status
print_info "PM2 Status:"
pm2 list

# Check Nginx status
print_info "Nginx Status:"
systemctl status nginx --no-pager -l | head -5

# Test backend
print_info "Testing backend..."
if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null; then
    print_success "Backend is responding"
else
    print_warning "Backend may not be responding. Check: pm2 logs khandesh-api"
fi

# Test frontend files
if [ -f "${WEB_ROOT}/index.html" ]; then
    print_success "Frontend files are deployed"
else
    print_error "Frontend files not found in ${WEB_ROOT}"
fi

# ============================================
# Step 9: Summary
# ============================================
print_header "DEPLOYMENT COMPLETE"

print_success "============================================"
print_success "✅ Deployment Summary"
print_success "============================================"
echo ""
print_info "📂 Project Directory: ${PROJECT_DIR}"
print_info "🌐 Domain: https://${DOMAIN}"
print_info "🔧 Backend: http://localhost:${BACKEND_PORT}"
print_info "📁 Frontend: ${WEB_ROOT}"
print_info "🔒 SSL: Check with: sudo certbot certificates"
echo ""
print_info "📋 Useful Commands:"
echo "  • View backend logs: pm2 logs khandesh-api"
echo "  • Restart backend: pm2 restart khandesh-api"
echo "  • Check PM2: pm2 list"
echo "  • Check Nginx: sudo nginx -t && sudo systemctl status nginx"
echo "  • View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "  • Renew SSL: sudo certbot renew"
echo "  • Test SSL: curl -I https://${DOMAIN}"
echo "  • Test backend: curl http://localhost:${BACKEND_PORT}/api/health"
echo ""
print_warning "⚠️  Important:"
echo "  1. Make sure .env file in ${BACKEND_DIR} has correct database credentials"
echo "  2. Verify DNS records in Hostinger DNS Zone Editor"
echo "  3. If SSL failed, run: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  4. Check backend logs if API is not working: pm2 logs khandesh-api"
echo "  5. Project structure: ${PROJECT_DIR}/{backend,frontend}"
echo ""
print_success "============================================"
print_success "🚀 Your site should be live at: https://${DOMAIN}"
print_success "============================================"

