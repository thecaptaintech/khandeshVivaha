# Production Management Guide

## 📋 Available Scripts

All production scripts are prefixed with `Production-` and should be run with `sudo`:

### 1. Production-deploy.sh
**Main deployment script** - Deploys backend and frontend to production.

```bash
sudo ./Production-deploy.sh
```

**What it does:**
- Pulls latest code (if git)
- Installs backend dependencies
- Restarts backend service (PM2)
- Builds frontend
- Deploys frontend to web root
- Reloads Nginx
- Verifies all services

---

### 2. Production-status.sh
**System status check** - Shows status of all services.

```bash
./Production-status.sh
```

**Shows:**
- Backend service status (PM2)
- Nginx status
- Frontend deployment status
- Database connection
- SSL certificate status
- Port status
- Disk and memory usage

---

### 3. Production-logs.sh
**Log viewer** - View various logs.

```bash
./Production-logs.sh [lines]
```

**Options:**
- `1` - Backend logs (last N lines, default 50)
- `2` - Backend logs (live/follow)
- `3` - Nginx access log
- `4` - Nginx error log
- `5` - System log
- `6` - All backend logs (error + output)

**Examples:**
```bash
./Production-logs.sh          # Last 50 lines
./Production-logs.sh 100       # Last 100 lines
```

---

### 4. Production-db-check.sh
**Database connection test** - Verifies database connectivity.

```bash
./Production-db-check.sh
```

**Checks:**
- .env file exists
- Database credentials are set
- Connection to database
- Table access
- Sample queries

---

### 5. Production-restart.sh
**Service restart** - Restart services individually or all.

```bash
sudo ./Production-restart.sh
```

**Options:**
- `1` - Restart Backend only
- `2` - Restart Nginx only
- `3` - Restart Backend + Nginx
- `4` - Restart All (Backend + Nginx + MySQL)

---

### 6. Production-backup.sh
**Database backup** - Creates compressed database backup.

```bash
sudo ./Production-backup.sh
```

**Features:**
- Creates timestamped backup
- Compresses backup (.sql.gz)
- Auto-cleans backups older than 7 days
- Shows backup location and size

**Backup location:** `/var/www/khandeshVivaha/backups/`

---

### 7. Production-monitor.sh
**Real-time monitor** - Live system monitoring.

```bash
./Production-monitor.sh
```

**Monitors:**
- Backend status
- Nginx status
- Database status
- Memory usage
- CPU usage
- Updates every 5 seconds

**Press `Ctrl+C` to exit**

---

## 🚀 Quick Reference

### Daily Operations

```bash
# Check system status
./Production-status.sh

# View recent logs
./Production-logs.sh

# Restart services if needed
sudo ./Production-restart.sh
```

### Deployment

```bash
# Full deployment
sudo ./Production-deploy.sh
```

### Troubleshooting

```bash
# Check database connection
./Production-db-check.sh

# View error logs
./Production-logs.sh
# Then select option 4 (Nginx Error) or 6 (All Backend Logs)

# Monitor system
./Production-monitor.sh
```

### Backup

```bash
# Create backup before major changes
sudo ./Production-backup.sh
```

---

## 📁 Project Structure

```
/var/www/khandeshVivaha/
├── backend/              # Node.js backend
│   ├── .env            # Database credentials
│   └── server.js        # Main server
├── frontend/            # React frontend
│   └── build/          # Production build
├── backups/            # Database backups
└── Production-*.sh     # Production scripts
```

---

## 🔧 Common Issues

### Backend Not Running
```bash
sudo ./Production-restart.sh  # Select option 1
./Production-logs.sh          # Check logs
```

### Database Connection Failed
```bash
./Production-db-check.sh      # Diagnose issue
sudo ./Production-restart.sh  # Restart services (option 4)
```

### Frontend Not Updating
```bash
sudo ./Production-deploy.sh   # Rebuild and deploy
```

### SSL Issues
```bash
sudo ./fix-ssl-both-domains.sh
```

---

## 📝 Notes

- All scripts require appropriate permissions
- Use `sudo` for scripts that modify services
- Backups are stored in `/var/www/khandeshVivaha/backups/`
- Logs can be viewed without sudo
- Monitor script updates every 5 seconds

---

## 🔐 Security

- Database credentials are in `backend/.env` (never commit!)
- Backups are stored locally (consider off-site backup)
- SSL certificates auto-renew via Certbot
- PM2 keeps services running automatically

---

## 📞 Support

For issues:
1. Check status: `./Production-status.sh`
2. Check logs: `./Production-logs.sh`
3. Check database: `./Production-db-check.sh`
4. Restart services: `sudo ./Production-restart.sh`

