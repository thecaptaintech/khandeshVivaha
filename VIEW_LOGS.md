# View Logs - Last 1000 Lines

## 📋 Quick Commands

### Backend Logs (PM2)

```bash
# All logs (last 1000 lines)
pm2 logs khandesh-api --lines 1000 --nostream

# Error logs only
pm2 logs khandesh-api --err --lines 1000 --nostream

# Output logs only
pm2 logs khandesh-api --out --lines 1000 --nostream

# Real-time (follow logs)
pm2 logs khandesh-api --lines 1000

# Save to file
pm2 logs khandesh-api --lines 1000 --nostream > backend_logs.txt
```

### Nginx Logs

```bash
# Error logs (last 1000 lines)
sudo tail -1000 /var/log/nginx/error.log

# Access logs (last 1000 lines)
sudo tail -1000 /var/log/nginx/access.log

# Both combined
sudo tail -1000 /var/log/nginx/error.log /var/log/nginx/access.log

# Real-time (follow logs)
sudo tail -f /var/log/nginx/error.log
```

### MySQL Logs

```bash
# Error log (last 1000 lines)
sudo tail -1000 /var/log/mysql/error.log

# General query log (if enabled)
sudo tail -1000 /var/log/mysql/mysql.log

# Slow query log (if enabled)
sudo tail -1000 /var/log/mysql/slow.log
```

### System Logs

```bash
# System journal (last 1000 lines)
sudo journalctl -n 1000

# Nginx service logs
sudo journalctl -u nginx -n 1000

# MySQL service logs
sudo journalctl -u mysql -n 1000

# All services (last 1000 lines)
sudo journalctl -n 1000 --no-pager
```

### Application-Specific Logs

```bash
# PM2 log files (if using file logging)
tail -1000 ~/.pm2/logs/khandesh-api-error.log
tail -1000 ~/.pm2/logs/khandesh-api-out.log

# Or in root
tail -1000 /root/.pm2/logs/khandesh-api-error.log
tail -1000 /root/.pm2/logs/khandesh-api-out.log
```

## 🔍 Detailed Commands

### Backend Logs (PM2) - Detailed

```bash
# View all PM2 processes
pm2 list

# View specific app logs
pm2 logs khandesh-api --lines 1000

# View with timestamps
pm2 logs khandesh-api --lines 1000 --timestamp

# View and save to file
pm2 logs khandesh-api --lines 1000 --nostream > /tmp/backend_logs_$(date +%Y%m%d_%H%M%S).txt

# View error logs only
pm2 logs khandesh-api --err --lines 1000 --nostream

# View output logs only
pm2 logs khandesh-api --out --lines 1000 --nostream

# Clear logs
pm2 flush khandesh-api
```

### Nginx Logs - Detailed

```bash
# Error logs with line numbers
sudo tail -1000 -n +1 /var/log/nginx/error.log | nl

# Search for specific errors
sudo tail -1000 /var/log/nginx/error.log | grep -i "error\|warn\|crit"

# Access logs with IP addresses
sudo tail -1000 /var/log/nginx/access.log | awk '{print $1, $4, $7, $9}'

# Filter by domain
sudo tail -1000 /var/log/nginx/access.log | grep khandeshmatrimony.com

# Filter by status code (errors)
sudo tail -1000 /var/log/nginx/access.log | grep " 50[0-9] "

# Real-time monitoring
sudo tail -f /var/log/nginx/error.log
```

### MySQL Logs - Detailed

```bash
# Check if logging is enabled
mysql -u root -p -e "SHOW VARIABLES LIKE '%log%';"

# Error log
sudo tail -1000 /var/log/mysql/error.log

# General query log (if enabled)
sudo tail -1000 /var/log/mysql/mysql.log

# Slow query log
sudo tail -1000 /var/log/mysql/slow.log

# Binary log (if enabled)
sudo ls -lh /var/log/mysql/
```

## 📊 One-Liner Commands

### All Important Logs (Last 1000 Lines Each)

```bash
# Backend + Nginx + System
echo "=== Backend Logs ===" && pm2 logs khandesh-api --lines 1000 --nostream && \
echo "=== Nginx Error Logs ===" && sudo tail -1000 /var/log/nginx/error.log && \
echo "=== System Logs ===" && sudo journalctl -n 1000 --no-pager
```

### Search for Errors

```bash
# Search backend logs for errors
pm2 logs khandesh-api --lines 1000 --nostream | grep -i "error\|fail\|exception"

# Search Nginx logs for errors
sudo tail -1000 /var/log/nginx/error.log | grep -i "error\|warn\|crit"

# Search system logs for errors
sudo journalctl -n 1000 | grep -i "error\|fail"
```

## 🔧 Useful Log Viewing Scripts

### View All Logs Script

```bash
#!/bin/bash
echo "============================================"
echo "Backend Logs (Last 1000 lines)"
echo "============================================"
pm2 logs khandesh-api --lines 1000 --nostream

echo ""
echo "============================================"
echo "Nginx Error Logs (Last 1000 lines)"
echo "============================================"
sudo tail -1000 /var/log/nginx/error.log

echo ""
echo "============================================"
echo "Nginx Access Logs (Last 1000 lines)"
echo "============================================"
sudo tail -1000 /var/log/nginx/access.log
```

### Save All Logs to File

```bash
#!/bin/bash
LOG_DIR="/tmp/logs_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

echo "Saving logs to $LOG_DIR..."

# Backend logs
pm2 logs khandesh-api --lines 1000 --nostream > "$LOG_DIR/backend.log"

# Nginx logs
sudo tail -1000 /var/log/nginx/error.log > "$LOG_DIR/nginx_error.log"
sudo tail -1000 /var/log/nginx/access.log > "$LOG_DIR/nginx_access.log"

# System logs
sudo journalctl -n 1000 --no-pager > "$LOG_DIR/system.log"

echo "Logs saved to: $LOG_DIR"
```

## 📝 Common Log Locations

```
Backend (PM2):
  ~/.pm2/logs/khandesh-api-error.log
  ~/.pm2/logs/khandesh-api-out.log
  /root/.pm2/logs/khandesh-api-error.log
  /root/.pm2/logs/khandesh-api-out.log

Nginx:
  /var/log/nginx/error.log
  /var/log/nginx/access.log

MySQL:
  /var/log/mysql/error.log
  /var/log/mysql/mysql.log
  /var/log/mysql/slow.log

System:
  /var/log/syslog
  /var/log/messages
  journalctl (systemd)
```

## 🚀 Quick Reference

```bash
# Backend logs
pm2 logs khandesh-api --lines 1000 --nostream

# Nginx error logs
sudo tail -1000 /var/log/nginx/error.log

# Nginx access logs
sudo tail -1000 /var/log/nginx/access.log

# System logs
sudo journalctl -n 1000

# MySQL error logs
sudo tail -1000 /var/log/mysql/error.log

# Real-time backend logs
pm2 logs khandesh-api

# Real-time Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 🔍 Filtering Logs

```bash
# Backend logs with errors only
pm2 logs khandesh-api --lines 1000 --nostream | grep -i error

# Nginx 500 errors
sudo tail -1000 /var/log/nginx/access.log | grep " 500 "

# Database connection errors
pm2 logs khandesh-api --lines 1000 --nostream | grep -i "database\|mysql\|connection"

# API errors
pm2 logs khandesh-api --lines 1000 --nostream | grep -i "api\|route\|endpoint"
```

