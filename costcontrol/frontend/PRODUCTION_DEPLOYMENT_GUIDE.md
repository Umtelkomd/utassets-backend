# Production Deployment Guide

## 🚀 Production-Ready Cost Control System

This guide provides step-by-step instructions for deploying the enhanced cost control system to production environments.

## 📋 Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+ (minimum 4GB RAM, 2 vCPU)
- **Database**: MySQL 8.0+ or MariaDB 10.6+
- **Runtime**: Node.js 18+ LTS
- **Reverse Proxy**: Nginx 1.18+
- **Process Manager**: PM2 5.0+
- **SSL**: Valid SSL certificate (Let's Encrypt recommended)

### Pre-deployment Checklist
- [ ] Domain name configured
- [ ] DNS records pointing to server
- [ ] SSL certificate obtained
- [ ] Database server configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools installed

## 🔧 Environment Setup

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server nodejs npm git curl wget

# Install PM2 globally
sudo npm install -g pm2

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Setup
```sql
-- Create database and user
CREATE DATABASE costcontrol_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'costcontrol_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON costcontrol_prod.* TO 'costcontrol_user'@'localhost';
FLUSH PRIVILEGES;

-- Configure MySQL for production
# Edit /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

### 3. Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/costcontrol
sudo chown $USER:$USER /var/www/costcontrol

# Clone repository
cd /var/www/costcontrol
git clone https://github.com/your-repo/cost-control.git .

# Setup backend
cd costcontrol-backend
npm ci --only=production
cp env.example .env

# Configure environment variables
nano .env
```

### 4. Environment Configuration
```bash
# Backend Environment (.env)
NODE_ENV=production
PORT=4000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=costcontrol_user
DB_PASSWORD=STRONG_DATABASE_PASSWORD
DB_NAME=costcontrol_prod

# JWT Security
JWT_SECRET=VERY_LONG_RANDOM_STRING_HERE_64_CHARS_MINIMUM
JWT_EXPIRES_IN=24h

# API Configuration
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api

# Slack Integration (Optional)
SLACK_BOT_TOKEN=xoxb-your-slack-token
SLACK_CHANNEL_ID=your-channel-id

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password
```

## 🚀 Application Launch

### 1. Backend Deployment
```bash
cd /var/www/costcontrol/costcontrol-backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'costcontrol-backend',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/costcontrol/error.log',
    out_file: '/var/log/costcontrol/out.log',
    log_file: '/var/log/costcontrol/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/costcontrol
sudo chown $USER:$USER /var/log/costcontrol

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Frontend Build and Deployment
```bash
cd /var/www/costcontrol/costcontrol-frontend

# Create production environment file
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_APP_TITLE=Cost Control System
VITE_APP_VERSION=2.0.0
EOF

# Build for production
npm ci
npm run build

# Move build files to web server directory
sudo mkdir -p /var/www/html/costcontrol
sudo cp -r dist/* /var/www/html/costcontrol/
sudo chown -R www-data:www-data /var/www/html/costcontrol
```

## 🔒 Nginx Configuration

### 1. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Verify certificate auto-renewal
sudo systemctl status snap.certbot.renew.timer
```

### 2. Nginx Site Configuration
```nginx
# /etc/nginx/sites-available/costcontrol
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Frontend (React App)
    location / {
        root /var/www/html/costcontrol;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Handle client-side routing
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }
    
    # Authentication Rate Limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://localhost:4000/api/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health Check Endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 3. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/costcontrol /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 📊 Monitoring and Logging

### 1. Application Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Setup system monitoring
npm install -g pm2-server-monit
pm2 install pm2-server-monit
```

### 2. Database Monitoring
```sql
-- Create monitoring user
CREATE USER 'monitor'@'localhost' IDENTIFIED BY 'monitor_password';
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'monitor'@'localhost';

-- Enable slow query log
SET GLOBAL slow_query_log = 1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2;
```

### 3. Log Management
```bash
# Setup logrotate for application logs
sudo cat > /etc/logrotate.d/costcontrol << 'EOF'
/var/log/costcontrol/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        pm2 reload costcontrol-backend
    endscript
}
EOF
```

## 🔄 Backup and Recovery

### 1. Database Backup
```bash
# Create backup script
cat > /home/$USER/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="costcontrol_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --databases costcontrol_prod \
  > $BACKUP_DIR/$FILENAME

gzip $BACKUP_DIR/$FILENAME

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
EOF

chmod +x /home/$USER/backup-db.sh

# Schedule daily backups
echo "0 2 * * * /home/$USER/backup-db.sh" | crontab -
```

### 2. Application Backup
```bash
# Backup application files and configurations
cat > /home/$USER/backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/app"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/costcontrol"

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
  -C /var/www \
  --exclude=node_modules \
  --exclude=.git \
  costcontrol/

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/$USER/backup-app.sh
```

## 🚨 Security Hardening

### 1. Fail2Ban Configuration
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure jail for nginx
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

### 2. System Updates
```bash
# Setup automatic security updates
sudo cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
```

## ✅ Post-Deployment Verification

### 1. Health Checks
```bash
# Test backend API
curl -f https://yourdomain.com/api/health

# Test frontend loading
curl -f https://yourdomain.com/

# Check application logs
pm2 logs costcontrol-backend

# Verify database connection
mysql -u costcontrol_user -p -e "SELECT 1 FROM costcontrol_prod.users LIMIT 1;"
```

### 2. Performance Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 https://yourdomain.com/api/health

# Test frontend performance
ab -n 100 -c 5 https://yourdomain.com/
```

## 🔧 Maintenance Tasks

### Daily Tasks
- [ ] Check application logs for errors
- [ ] Verify database backup completed
- [ ] Monitor system resource usage
- [ ] Review security alerts

### Weekly Tasks
- [ ] Update SSL certificates if needed
- [ ] Review and rotate log files
- [ ] Check for security updates
- [ ] Performance monitoring review

### Monthly Tasks
- [ ] Full security audit
- [ ] Database optimization
- [ ] Backup restore testing
- [ ] Capacity planning review

## 🚨 Troubleshooting Guide

### Common Issues
1. **Application Not Starting**
   ```bash
   pm2 logs costcontrol-backend
   # Check for port conflicts, database connectivity
   ```

2. **Database Connection Errors**
   ```bash
   mysql -u costcontrol_user -p costcontrol_prod
   # Verify credentials and network connectivity
   ```

3. **SSL Certificate Issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **High Memory Usage**
   ```bash
   pm2 monit
   # Monitor memory usage and restart if needed
   pm2 restart costcontrol-backend
   ```

This comprehensive deployment guide ensures your cost control system runs securely and efficiently in production with proper monitoring, backup, and maintenance procedures.