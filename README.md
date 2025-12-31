# Khandesh Matrimony - Production

## 🚀 Quick Deploy

```bash
cd /var/www/khandeshVivaha
sudo ./Production-deploy.sh
```

## 📋 Production Scripts

All production scripts are prefixed with `Production-`:

- **Production-deploy.sh** - Full deployment
- **Production-status.sh** - System status check
- **Production-logs.sh** - View logs
- **Production-db-check.sh** - Database connection test
- **Production-restart.sh** - Restart services
- **Production-backup.sh** - Database backup
- **Production-monitor.sh** - Real-time monitoring

See [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for detailed documentation.

## 📋 Essential Commands

### Rebuild Frontend
```bash
cd frontend && rm -rf build && npm run build && cp -r build/* /var/www/khandeshmatrimony.com/
```

### Restart Backend
```bash
pm2 restart khandesh-api --update-env
```

### View Logs
```bash
pm2 logs khandesh-api --lines 50
```

## 🔧 Troubleshooting

**CORS Error**: Rebuild frontend and clear browser cache (`Ctrl+Shift+R`)  
**Database Error**: Fix MariaDB password, restart backend  
**SSL Issue**: Run `sudo certbot --nginx -d khandeshmatrimony.com -d www.khandeshmatrimony.com`

## 📁 Project Structure

```
khandeshVivaha/
├── backend/          # Node.js/Express backend
│   ├── .env         # Backend configuration
│   ├── server.js    # Main server file
│   └── setup_database.sql  # Database setup
├── frontend/        # React frontend
│   └── src/        # React source code
├── deploy.sh        # Production deployment
└── deploy-final.sh  # Full deployment (with SSL)
```

## 🗄️ Database

Default Admin:
- Username: `admin`
- Password: `admin123`
