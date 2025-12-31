#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# Can run from local machine OR on VPS itself
# VPS: root@77.37.44.226
# Domain: khandeshmatrimony.com
# ============================================

set -e

# Detect if running on VPS or local
if [ -f "/root/khandeshvivah/backend/server.js" ] || [ -f "/var/www/khandeshVivaha/backend/server.js" ] || [ -f "$(pwd)/backend/server.js" ]; then
    # Running on VPS - detect project directory
    IS_VPS=true
    if [ -d "/root/khandeshvivah" ]; then
        PROJECT_DIR="/root/khandeshvivah"
    elif [ -d "/var/www/khandeshVivaha" ]; then
        PROJECT_DIR="/var/www/khandeshVivaha"
    elif [ -f "$(pwd)/backend/server.js" ]; then
        PROJECT_DIR="$(pwd)"
    else
        PROJECT_DIR="/var/www/khandeshVivaha"
    fi
    VPS=""
else
    # Running from local machine
    IS_VPS=false
    VPS="root@77.37.44.226"
    PROJECT_DIR="/root/khandeshvivah"
fi

# Configuration
DOMAIN="khandeshmatrimony.com"
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

# Load DB credentials from .env
load_db_credentials() {
    # Try different .env locations
    ENV_FILE=""
    if [ "$IS_VPS" = true ]; then
        # On VPS, check in project directory
        if [ -f "${BACKEND_DIR}/.env" ]; then
            ENV_FILE="${BACKEND_DIR}/.env"
        elif [ -f "backend/.env" ]; then
            ENV_FILE="backend/.env"
        fi
    else
        # On local machine
        if [ -f "backend/.env" ]; then
            ENV_FILE="backend/.env"
        fi
    fi
    
    if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
        print_info "Loading credentials from ${ENV_FILE}..."
        export DB_HOST=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        export JWT_SECRET=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        
        DB_HOST=${DB_HOST:-localhost}
        DB_USER=${DB_USER:-root}
        DB_NAME=${DB_NAME:-khandesh_vivah}
        
        if [ -n "$DB_PASSWORD" ] && [ -n "$JWT_SECRET" ]; then
            print_success "Credentials loaded"
        else
            print_warning "Some credentials missing, will prompt"
        fi
    else
        print_error ".env file not found in backend directory!"
        print_info "Please create ${BACKEND_DIR}/.env with database credentials"
        exit 1
    fi
}

# Check SSH (only if running from local)
check_ssh() {
    if [ "$IS_VPS" = true ]; then
        print_info "Running on VPS - skipping SSH check"
        return 0
    fi
    
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
    
    # Find SQL file
    SQL_FILE=""
    if [ "$IS_VPS" = true ]; then
        if [ -f "${BACKEND_DIR}/setup_database.sql" ]; then
            SQL_FILE="${BACKEND_DIR}/setup_database.sql"
        elif [ -f "backend/setup_database.sql" ]; then
            SQL_FILE="backend/setup_database.sql"
        fi
    else
        SQL_FILE="backend/setup_database.sql"
    fi
    
    if [ -z "$SQL_FILE" ] || [ ! -f "$SQL_FILE" ]; then
        print_error "setup_database.sql not found!"
        exit 1
    fi
    
    if [ "$IS_VPS" = true ]; then
        # Running on VPS - execute directly
        print_info "Creating database and tables..."
        if [ -z "$DB_PASSWORD" ]; then
            read -sp "MySQL Password: " DB_PASSWORD
            echo ""
        fi
        mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} < "$SQL_FILE"
    else
        # Running from local - upload and execute via SSH
        print_info "Uploading database script..."
        scp "$SQL_FILE" ${VPS}:/tmp/setup_database.sql
        
        if [ -z "$DB_PASSWORD" ]; then
            read -sp "MySQL Password: " DB_PASSWORD
            echo ""
        fi
        
        print_info "Creating database and tables..."
        ssh ${VPS} "mysql -h ${DB_HOST} -u ${DB_USER} -p'${DB_PASSWORD}' < /tmp/setup_database.sql && rm /tmp/setup_database.sql"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed"
    else
        print_error "Database setup failed"
        exit 1
    fi
}

# Upload Files (only if running from local)
upload_files() {
    if [ "$IS_VPS" = true ]; then
        print_info "Running on VPS - files already here, skipping upload"
        mkdir -p ${WEB_ROOT}
        return 0
    fi
    
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
    
    if [ "$IS_VPS" = true ]; then
        # Running on VPS - execute directly
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
        
        cd - > /dev/null
    else
        # Running from local - execute via SSH
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
    fi
    
    print_success "Backend setup completed"
}

# Setup Frontend
setup_frontend() {
    print_header "SETTING UP FRONTEND"
    
    if [ "$IS_VPS" = true ]; then
        # On VPS - build locally
        FRONTEND_DIR="${PROJECT_DIR}/frontend"
        if [ ! -d "$FRONTEND_DIR" ]; then
            FRONTEND_DIR="frontend"
        fi
        
        cd "$FRONTEND_DIR"
        
        if [ ! -f ".env" ]; then
            echo "REACT_APP_API_URL=https://${DOMAIN}/api" > .env
        fi
        
        print_info "Installing dependencies..."
        npm install
        
        print_info "Building frontend..."
        npm run build
        
        if [ ! -d "build" ]; then
            print_error "Build failed"
            exit 1
        fi
        
        print_info "Copying build to web root..."
        cp -r build/* ${WEB_ROOT}/
        
        cd - > /dev/null
    else
        # From local - build and upload
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
    fi
    
    print_success "Frontend deployed"
}

# Setup Nginx
setup_nginx() {
    print_header "SETTING UP NGINX"
    
    NGINX_CMD="cat > /etc/nginx/sites-available/${DOMAIN} << 'NGINXCONF'
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:${BACKEND_PORT};
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo '✅ Nginx configured'"
    
    if [ "$IS_VPS" = true ]; then
        # Running on VPS - execute directly
        eval "$NGINX_CMD"
    else
        # Running from local - execute via SSH
        ssh ${VPS} "$NGINX_CMD"
    fi
    
    print_success "Nginx configured"
}

# Main
main() {
    print_header "PRODUCTION DEPLOYMENT"
    
    if [ "$IS_VPS" = true ]; then
        print_info "Running on VPS: $(hostname)"
        print_info "Project: ${PROJECT_DIR}"
    else
        print_info "VPS: ${VPS}"
    fi
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
    
    if [ "$IS_VPS" = true ]; then
        print_info "PM2 Status: pm2 list"
        print_info "Backend Logs: pm2 logs ${PM2_APP}"
    else
        print_info "PM2 Status: ssh ${VPS} 'pm2 list'"
        print_info "Backend Logs: ssh ${VPS} 'pm2 logs ${PM2_APP}'"
    fi
}

main "$@"

