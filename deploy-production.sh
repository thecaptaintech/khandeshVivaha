#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# VPS: root@77.37.44.226
# Domain: khandeshmatrimony.com
# ============================================

set -e

# Configuration
VPS="root@77.37.44.226"
DOMAIN="khandeshmatrimony.com"
PROJECT_DIR="/root/khandeshvivah"
BACKEND_DIR="${PROJECT_DIR}/backend"
WEB_ROOT="/var/www/${DOMAIN}"
PM2_APP="khandesh-api"
BACKEND_PORT=5001

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() { echo -e "${CYAN}============================================${NC}\n${CYAN}$1${NC}\n${CYAN}============================================${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Load DB credentials from local .env
load_db_credentials() {
    if [ -f "backend/.env" ]; then
        print_info "Loading credentials from backend/.env..."
        export DB_HOST=$(grep "^DB_HOST=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_USER=$(grep "^DB_USER=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_PASSWORD=$(grep "^DB_PASSWORD=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_NAME=$(grep "^DB_NAME=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export JWT_SECRET=$(grep "^JWT_SECRET=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        
        DB_HOST=${DB_HOST:-localhost}
        DB_USER=${DB_USER:-root}
        DB_NAME=${DB_NAME:-khandesh_vivah}
        
        if [ -n "$DB_PASSWORD" ] && [ -n "$JWT_SECRET" ]; then
            print_success "Credentials loaded"
        else
            print_warning "Some credentials missing, will prompt"
        fi
    else
        print_error "backend/.env file not found!"
        exit 1
    fi
}

# Check SSH
check_ssh() {
    print_info "Checking SSH connection..."
    if ssh -o ConnectTimeout=5 ${VPS} exit 2>/dev/null; then
        print_success "SSH OK"
        return 0
    else
        print_error "Cannot connect to ${VPS}"
        exit 1
    fi
}

# Setup Database
setup_database() {
    print_header "SETTING UP DATABASE"
    
    load_db_credentials
    
    print_info "Uploading database script..."
    scp backend/setup_database.sql ${VPS}:/tmp/setup_database.sql
    
    if [ -z "$DB_PASSWORD" ]; then
        read -sp "MySQL Password: " DB_PASSWORD
        echo ""
    fi
    
    print_info "Creating database and tables..."
    ssh ${VPS} "mysql -h ${DB_HOST} -u ${DB_USER} -p'${DB_PASSWORD}' < /tmp/setup_database.sql && rm /tmp/setup_database.sql"
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed"
    else
        print_error "Database setup failed"
        exit 1
    fi
}

# Upload Files
upload_files() {
    print_header "UPLOADING FILES"
    
    ssh ${VPS} "mkdir -p ${PROJECT_DIR} ${WEB_ROOT}"
    
    print_info "Uploading project files..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude 'build' \
        --exclude '.env' \
        --exclude '.git' \
        --exclude '*.log' \
        ./ ${VPS}:${PROJECT_DIR}/
    
    print_success "Files uploaded"
}

# Setup Backend
setup_backend() {
    print_header "SETTING UP BACKEND"
    
    load_db_credentials
    
    if [ -z "$JWT_SECRET" ]; then
        read -p "JWT Secret (min 32 chars): " JWT_SECRET
    fi
    
    if [ -z "$DB_PASSWORD" ]; then
        read -sp "MySQL Password: " DB_PASSWORD
        echo ""
    fi
    
    ssh ${VPS} << ENDSSH
cd ${BACKEND_DIR}

cat > .env << ENVFILE
NODE_ENV=production
PORT=${BACKEND_PORT}
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=https://${DOMAIN}
ENVFILE

chmod 600 .env

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Install dependencies
npm install --production

# Stop and start backend
pm2 stop ${PM2_APP} 2>/dev/null || true
pm2 delete ${PM2_APP} 2>/dev/null || true
pm2 start server.js --name ${PM2_APP}
pm2 save
pm2 startup systemd -u root --hp /root | grep -v PM2 | tail -1 | bash || true

echo "✅ Backend started"
ENDSSH
    
    print_success "Backend setup completed"
}

# Setup Frontend
setup_frontend() {
    print_header "SETTING UP FRONTEND"
    
    print_info "Building frontend..."
    cd frontend
    
    if [ ! -f ".env" ]; then
        echo "REACT_APP_API_URL=https://${DOMAIN}/api" > .env
    fi
    
    npm install
    npm run build
    
    if [ ! -d "build" ]; then
        print_error "Build failed"
        exit 1
    fi
    
    cd ..
    
    print_info "Uploading frontend..."
    rsync -avz --delete frontend/build/ ${VPS}:${WEB_ROOT}/
    
    print_success "Frontend deployed"
}

# Setup Nginx
setup_nginx() {
    print_header "SETTING UP NGINX"
    
    ssh ${VPS} << ENDSSH
cat > /etc/nginx/sites-available/${DOMAIN} << NGINXCONF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

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
    }

    location /uploads {
        proxy_pass http://localhost:${BACKEND_PORT};
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "✅ Nginx configured"
ENDSSH
    
    print_success "Nginx configured"
}

# Main
main() {
    print_header "PRODUCTION DEPLOYMENT"
    print_info "VPS: ${VPS}"
    print_info "Domain: ${DOMAIN}"
    echo ""
    
    if ! check_ssh; then
        exit 1
    fi
    
    read -p "Setup database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    fi
    
    upload_files
    setup_backend
    setup_frontend
    setup_nginx
    
    print_header "DEPLOYMENT COMPLETE"
    print_success "Visit: https://${DOMAIN}"
    print_info "PM2 Status: ssh ${VPS} 'pm2 list'"
    print_info "Backend Logs: ssh ${VPS} 'pm2 logs ${PM2_APP}'"
}

main "$@"

