# Production Deployment Guide

## 🚀 Quick Deploy

```bash
cd /var/www/khandeshVivaha
chmod +x deploy.sh
sudo ./deploy.sh
```

## 📋 Essential Commands

### Rebuild Frontend
```bash
cd /var/www/khandeshVivaha/frontend
rm -rf build node_modules/.cache
npm run build
cp -r build/* /var/www/khandeshmatrimony.com/
chown -R www-data:www-data /var/www/khandeshmatrimony.com
```

### Restart Backend
```bash
pm2 restart khandesh-api --update-env
```

### View Logs
```bash
pm2 logs khandesh-api --lines 50
```

### Fix SSL
```bash
sudo certbot --nginx -d khandeshmatrimony.com -d www.khandeshmatrimony.com
```

## 🔧 Troubleshooting

### CORS Error
- Rebuild frontend: `cd frontend && rm -rf build && npm run build`
- Clear browser cache: `Ctrl+Shift+R`

### Database Error
- Fix MariaDB: `mysql -u root -p` then `SET PASSWORD FOR 'root'@'localhost' = PASSWORD('password');`
- Restart: `pm2 restart khandesh-api --update-env`

### SSL Not Secure
- Renew certificate: `sudo certbot renew --force-renewal`
- Reload Nginx: `sudo systemctl reload nginx`

