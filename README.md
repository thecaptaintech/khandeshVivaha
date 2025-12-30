# Khandesh Vivah - Matrimony Portal

## 🚀 Quick Start

### Local Development

```bash
# Make script executable
chmod +x deploy-local.sh

# Start development servers
./deploy-local.sh start

# Or setup database only
./deploy-local.sh db

# Stop servers
./deploy-local.sh stop
```

**Backend**: http://localhost:5001  
**Frontend**: http://localhost:3001

### Production Deployment

```bash
# Make script executable
chmod +x deploy-production.sh

# Deploy to VPS
./deploy-production.sh
```

**Production**: https://khandeshmatrimony.com

## 📋 Requirements

### Local:
- Node.js 18+
- MySQL
- npm

### Production:
- VPS with SSH access
- Nginx installed
- MySQL installed
- Node.js 18+ (script will install if missing)

## 🔧 Configuration

### Backend `.env` (Required)
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=khandesh_vivah
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3001
```

### Frontend `.env` (Optional for local)
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## 📁 Project Structure

```
khandeshVivaha/
├── backend/          # Node.js/Express backend
│   ├── .env         # Backend configuration
│   ├── server.js    # Main server file
│   └── setup_database.sql  # Database setup
├── frontend/        # React frontend
│   ├── .env        # Frontend configuration
│   └── src/        # React source code
├── deploy-local.sh      # Local development script
└── deploy-production.sh # Production deployment script
```

## 🗄️ Database

The `setup_database.sql` script creates:
- `admin` - Admin/Agent users
- `userdetails` - User profiles
- `photos` - User photos
- `settings` - Website settings

**Default Admin:**
- Username: `admin`
- Password: `admin123`

## 📝 Scripts

### `deploy-local.sh`
- Starts backend on port 5001
- Starts frontend on port 3001
- Sets up database (optional)
- Uses local `.env` files

### `deploy-production.sh`
- Deploys to VPS (77.37.44.226)
- Sets up database
- Configures backend with PM2
- Builds and deploys frontend
- Configures Nginx
- Uses credentials from `backend/.env`

## ✅ Verification

### Local:
- Backend: http://localhost:5001/api/health
- Frontend: http://localhost:3001

### Production:
- Website: https://khandeshmatrimony.com
- API: https://khandeshmatrimony.com/api/health

## 🔍 Troubleshooting

### Database Connection Failed:
- Check `backend/.env` credentials
- Verify MySQL is running
- Test: `mysql -u root -p`

### Backend Not Starting:
- Check port 5001 is available
- Verify `.env` file exists
- Check logs: `npm start` in backend/

### Frontend Not Loading:
- Check backend is running
- Verify API URL in `frontend/.env`
- Check browser console for errors
