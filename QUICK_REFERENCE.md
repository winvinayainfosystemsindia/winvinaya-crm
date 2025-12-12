# WinVinaya CRM - Quick Command Reference

## 🚀 One-Command Deployment

SSH into your EC2 server and run:

```bash
cd /var/www/winvinaya-crm
bash quick-deploy.sh
```

This will automatically deploy all three environments!

---

## 📋 Manual Step-by-Step Commands

### 1. Fix Database Permissions (Run Once)

```bash
sudo -u postgres psql << 'EOF'
\c winvinaya_dev
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;

\c winvinaya_qa
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;

\c winvinaya_prod
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;
\q
EOF
```

### 2. Create Backend Environment Files

```bash
cd /var/www/winvinaya-crm/backend
cp .env.dev.example .env.dev
cp .env.qa.example .env.qa
cp .env.prod.example .env.prod

# Edit each file with your settings
nano .env.dev
nano .env.qa
nano .env.prod
```

### 3. Deploy All Backend Environments

```bash
cd /var/www/winvinaya-crm/deploy
chmod +x *.sh

./backend-deploy.sh dev
./backend-deploy.sh qa
./backend-deploy.sh prod

# Check status
pm2 list
```

### 4. Create Frontend Environment Files & Deploy

```bash
cd /var/www/winvinaya-crm/frontend

# Create env files
cat > .env.dev << 'EOF'
VITE_API_BASE_URL=https://dev-crm.winvinaya.com/api
VITE_ENVIRONMENT=development
VITE_APP_NAME=WinVinaya CRM - Development
EOF

cat > .env.qa << 'EOF'
VITE_API_BASE_URL=https://qa-crm.winvinaya.com/api
VITE_ENVIRONMENT=qa
VITE_APP_NAME=WinVinaya CRM - QA
EOF

cat > .env.prod << 'EOF'
VITE_API_BASE_URL=https://crm.winvinaya.com/api
VITE_ENVIRONMENT=production
VITE_APP_NAME=WinVinaya CRM
EOF

# Install and build
npm ci

# Build DEV
cp .env.dev .env && npm run build
sudo mkdir -p dist-dev
sudo cp -r dist/* dist-dev/
sudo chown -R www-data:www-data dist-dev
sudo chmod -R 755 dist-dev

# Build QA
cp .env.qa .env && npm run build
sudo mkdir -p dist-qa
sudo cp -r dist/* dist-qa/
sudo chown -R www-data:www-data dist-qa
sudo chmod -R 755 dist-qa

# Build PROD
cp .env.prod .env && npm run build
sudo mkdir -p dist-prod
sudo cp -r dist/* dist-prod/
sudo chown -R www-data:www-data dist-prod
sudo chmod -R 755 dist-prod
```

### 5. Configure Nginx (Initial HTTP Setup)

```bash
# Create temporary HTTP configs
cd /var/www/winvinaya-crm/deploy

sudo tee /etc/nginx/sites-available/dev-crm.winvinaya.com-temp > /dev/null << 'EOF'
server {
    listen 80;
    server_name dev-crm.winvinaya.com;
    location / {
        root /var/www/winvinaya-crm/frontend/dist-dev;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo tee /etc/nginx/sites-available/qa-crm.winvinaya.com-temp > /dev/null << 'EOF'
server {
    listen 80;
    server_name qa-crm.winvinaya.com;
    location / {
        root /var/www/winvinaya-crm/frontend/dist-qa;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo tee /etc/nginx/sites-available/crm.winvinaya.com-temp > /dev/null << 'EOF'
server {
    listen 80;
    server_name crm.winvinaya.com www.crm.winvinaya.com;
    location / {
        root /var/www/winvinaya-crm/frontend/dist-prod;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable sites
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com-temp /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com-temp /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com-temp /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Install SSL Certificates

**IMPORTANT: Make sure DNS is pointing to your EC2 IP first!**

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get certificates
sudo certbot --nginx -d dev-crm.winvinaya.com
sudo certbot --nginx -d qa-crm.winvinaya.com
sudo certbot --nginx -d crm.winvinaya.com -d www.crm.winvinaya.com
```

### 7. Switch to Full Nginx Configs (After SSL)

```bash
cd /var/www/winvinaya-crm/deploy

# Copy full HTTPS configs
sudo cp nginx-dev.conf /etc/nginx/sites-available/dev-crm.winvinaya.com
sudo cp nginx-qa.conf /etc/nginx/sites-available/qa-crm.winvinaya.com
sudo cp nginx-prod.conf /etc/nginx/sites-available/crm.winvinaya.com

# Remove temp configs and enable new ones
sudo rm /etc/nginx/sites-enabled/*-temp
sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configure Auto-Start

```bash
# Save PM2 processes
pm2 save

# Enable startup script
pm2 startup
# Copy and run the command it outputs

# Enable firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## 🔍 Verification Commands

```bash
# Check backend health
curl http://localhost:8000/health  # DEV
curl http://localhost:8001/health  # QA
curl http://localhost:8002/health  # PROD

# Check via domain (after DNS + SSL)
curl https://dev-crm.winvinaya.com/api/health
curl https://qa-crm.winvinaya.com/api/health
curl https://crm.winvinaya.com/api/health

# Check PM2 processes
pm2 list
pm2 logs

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check SSL certificates
sudo certbot certificates
```

---

## 🔄 Common Operations

### Restart Services
```bash
pm2 restart winvinaya-backend-dev
pm2 restart winvinaya-backend-qa
pm2 restart winvinaya-backend-prod
pm2 restart all

sudo systemctl restart nginx
```

### View Logs
```bash
pm2 logs winvinaya-backend-dev
pm2 logs winvinaya-backend-qa
pm2 logs winvinaya-backend-prod

sudo tail -f /var/log/nginx/dev-crm-error.log
sudo tail -f /var/log/nginx/qa-crm-error.log
sudo tail -f /var/log/nginx/crm-error.log
```

### Update Code and Redeploy
```bash
cd /var/www/winvinaya-crm
git pull origin develop  # or main, or qa

# Redeploy backend
cd deploy
./backend-deploy.sh dev  # or qa, or prod

# Redeploy frontend (build required)
cd ../frontend
cp .env.dev .env && npm run build
sudo rm -rf dist-dev/*
sudo cp -r dist/* dist-dev/
```

### Database Backup
```bash
cd /var/www/winvinaya-crm/deploy
./backup-db.sh dev
./backup-db.sh qa
./backup-db.sh prod
```

---

## 🎯 Environment Overview

| Environment | Backend Port | Database | Domain |
|------------|-------------|----------|---------|
| **Development** | 8000 | winvinaya_dev | dev-crm.winvinaya.com |
| **QA** | 8001 | winvinaya_qa | qa-crm.winvinaya.com |
| **Production** | 8002 | winvinaya_prod | crm.winvinaya.com |

---

## 🐛 Quick Troubleshooting

### Backend not responding
```bash
pm2 logs winvinaya-backend-dev --lines 50
cd /var/www/winvinaya-crm/backend
source venv-dev/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --env-file .env.dev
```

### Database error
```bash
psql -U winvinaya_user -d winvinaya_dev -h localhost
sudo systemctl status postgresql
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx error
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

### Port already in use
```bash
sudo lsof -i :8000  # Check what's using port 8000
sudo kill -9 <PID>  # Kill the process if needed
pm2 delete winvinaya-backend-dev
./backend-deploy.sh dev
```

---

## 📞 Support

- Full Guide: See `DEPLOYMENT_GUIDE.md`
- Backend Logs: `pm2 logs`
- Nginx Logs: `/var/log/nginx/`
- Database Logs: `/var/log/postgresql/`

---

**Last Updated:** December 2025
