#!/bin/bash

# ============================================
# Local Development Deployment Script
# ============================================
# Starts backend and frontend for local development
# ============================================

set -e

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
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if .env exists
check_backend_env() {
    if [ ! -f "backend/.env" ]; then
        print_error "backend/.env file not found!"
        print_info "Create backend/.env with:"
        echo "NODE_ENV=development"
        echo "PORT=5001"
        echo "DB_HOST=localhost"
        echo "DB_USER=root"
        echo "DB_PASSWORD=your_password"
        echo "DB_NAME=khandesh_vivah"
        echo "JWT_SECRET=your_secret_key"
        echo "FRONTEND_URL=http://localhost:3001"
        exit 1
    fi
    print_success "backend/.env found"
}

# Setup Database (Local)
setup_database() {
    print_header "SETTING UP DATABASE"
    
    if [ ! -f "backend/setup_database.sql" ]; then
        print_error "backend/setup_database.sql not found"
        exit 1
    fi
    
    print_info "Creating database and tables..."
    
    # Load DB credentials
    DB_HOST=$(grep "^DB_HOST=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    DB_USER=$(grep "^DB_USER=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    DB_PASSWORD=$(grep "^DB_PASSWORD=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    DB_NAME=$(grep "^DB_NAME=" backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    
    DB_HOST=${DB_HOST:-localhost}
    DB_USER=${DB_USER:-root}
    DB_NAME=${DB_NAME:-khandesh_vivah}
    
    if [ -z "$DB_PASSWORD" ]; then
        read -sp "MySQL Password: " DB_PASSWORD
        echo ""
    fi
    
    mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} < backend/setup_database.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed"
    else
        print_error "Database setup failed"
        exit 1
    fi
}

# Start Backend
start_backend() {
    print_header "STARTING BACKEND"
    
    cd backend
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
    fi
    
    print_info "Starting backend on port 5001..."
    npm start &
    BACKEND_PID=$!
    
    cd ..
    
    print_success "Backend started (PID: $BACKEND_PID)"
    print_info "Backend URL: http://localhost:5001/api"
}

# Start Frontend
start_frontend() {
    print_header "STARTING FRONTEND"
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
    fi
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
        print_info "Created frontend/.env"
    fi
    
    print_info "Starting frontend on port 3001..."
    print_info "Frontend URL: http://localhost:3001"
    echo ""
    print_info "Press Ctrl+C to stop both servers"
    
    npm start
    
    cd ..
}

# Stop all
stop_all() {
    print_info "Stopping servers..."
    pkill -f "node.*server.js" || true
    pkill -f "react-scripts" || true
    print_success "Servers stopped"
}

# Main
main() {
    case "${1:-start}" in
        start)
            check_backend_env
            
            read -p "Setup database? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                setup_database
            fi
            
            start_backend
            sleep 2
            start_frontend
            ;;
        stop)
            stop_all
            ;;
        db)
            check_backend_env
            setup_database
            ;;
        *)
            echo "Usage: $0 [start|stop|db]"
            echo "  start - Start backend and frontend (default)"
            echo "  stop  - Stop all servers"
            echo "  db    - Setup database only"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C
trap stop_all INT TERM

main "$@"

