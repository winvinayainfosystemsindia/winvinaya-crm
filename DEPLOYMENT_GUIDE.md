# WinVinaya CRM - Complete Deployment Guide
## Three Environment Setup on Single EC2 Instance

This guide will help you deploy the WinVinaya CRM application with three environments (dev, qa, prod) on a single EC2 instance.

---

## 📋 Prerequisites Completed (From doc.txt)

Based on your `doc.txt`, you should have already completed:
- ✅ Step 1: Created branches (main, develop, qa)
- ✅ Step 2: Set up EC2 instance (Ubuntu 22.04)
- ✅ Step 3: Installed required software (Python 3.11, Node.js 20, PostgreSQL, Nginx, PM2, Git)
- ✅ Step 4: Created PostgreSQL databases (winvinaya_dev, winvinaya_qa, winvinaya_prod)
- ✅ Step 5: Cloned repository to `/var/www/winvinaya-crm`

---

## 🚀 Complete the Deployment

### Step 6: Create Environment Files on EC2

SSH into your EC2 instance:
```bash
ssh -i "winvinaya-crm-server.pem" ubuntu@ec2-3-110-165-116.ap-south-1.compute.amazonaws.com
```

#### 6.1 Create Development Environment File
```bash
cd /var/www/winvinaya-crm/backend
cp .env.dev.example .env.dev
nano .env.dev
```

Update these values in `.env.dev`:
```env
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_dev
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=dev-secret-key-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","https://dev-crm.winvinaya.com"]

# Rate Limiting
RATE_LIMIT_ENABLED=true
REDIS_URL=memory://

# Admin User
FIRST_SUPERUSER=admin@winvinaya.com
FIRST_SUPERUSER_PASSWORD=changeme123

# API Documentation
PROJECT_NAME="WinVinaya CRM - Development"
```

#### 6.2 Create QA Environment File
```bash
cp .env.qa.example .env.qa
nano .env.qa
```

Update these values in `.env.qa`:
```env
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_qa
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=qa-secret-key-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=qa

# CORS Configuration
BACKEND_CORS_ORIGINS=["https://qa-crm.winvinaya.com"]

# Rate Limiting
RATE_LIMIT_ENABLED=true
REDIS_URL=memory://

# Admin User
FIRST_SUPERUSER=admin@winvinaya.com
FIRST_SUPERUSER_PASSWORD=changeme123

# API Documentation
PROJECT_NAME="WinVinaya CRM - QA"
```

#### 6.3 Create Production Environment File
```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Update these values in `.env.prod`:
```env
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_prod
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=prod-secret-key-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=production

# CORS Configuration
BACKEND_CORS_ORIGINS=["https://crm.winvinaya.com","https://www.crm.winvinaya.com"]

# Rate Limiting
RATE_LIMIT_ENABLED=true
REDIS_URL=memory://

# Admin User
FIRST_SUPERUSER=admin@winvinaya.com
FIRST_SUPERUSER_PASSWORD=YourStrongPasswordHere123!

# API Documentation
PROJECT_NAME="WinVinaya CRM"

# Logging
LOG_LEVEL=INFO
```

---

### Step 7: Grant Database Permissions

PostgreSQL 15+ requires additional permissions. Run these commands:

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:
```sql
-- Connect to each database and grant schema permissions
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
```

---

### Step 8: Deploy Backend for All Environments

Make deploy scripts executable:
```bash
cd /var/www/winvinaya-crm/deploy
chmod +x *.sh
```

#### 8.1 Deploy Development Backend
```bash
./backend-deploy.sh dev
```

This will:
- Create Python virtual environment `venv-dev`
- Install dependencies
- Run database migrations for dev database
- Start FastAPI on port 8000 with PM2

#### 8.2 Deploy QA Backend
```bash
./backend-deploy.sh qa
```

This will:
- Create Python virtual environment `venv-qa`
- Install dependencies
- Run database migrations for qa database
- Start FastAPI on port 8001 with PM2

#### 8.3 Deploy Production Backend
```bash
./backend-deploy.sh prod
```

This will:
- Create Python virtual environment `venv-prod`
- Install dependencies
- Run database migrations for prod database
- Start FastAPI on port 8002 with PM2

#### 8.4 Verify All Backends are Running
```bash
pm2 list
```

You should see:
```
┌─────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                     │ mode    │ status  │ port     │
├─────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ winvinaya-backend-dev    │ fork    │ online  │ 8000     │
│ 1   │ winvinaya-backend-qa     │ fork    │ online  │ 8001     │
│ 2   │ winvinaya-backend-prod   │ fork    │ online  │ 8002     │
└─────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

Test each backend:
```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

---

### Step 9: Create Frontend Environment Files

#### 9.1 Create Development .env
```bash
cd /var/www/winvinaya-crm/frontend
cat > .env.dev << 'EOF'
VITE_API_BASE_URL=https://dev-crm.winvinaya.com/api
VITE_ENVIRONMENT=development
VITE_APP_NAME=WinVinaya CRM - Development
EOF
```

#### 9.2 Create QA .env
```bash
cat > .env.qa << 'EOF'
VITE_API_BASE_URL=https://qa-crm.winvinaya.com/api
VITE_ENVIRONMENT=qa
VITE_APP_NAME=WinVinaya CRM - QA
EOF
```

#### 9.3 Create Production .env
```bash
cat > .env.prod << 'EOF'
VITE_API_BASE_URL=https://crm.winvinaya.com/api
VITE_ENVIRONMENT=production
VITE_APP_NAME=WinVinaya CRM
EOF
```

---

### Step 10: Build and Deploy Frontend for All Environments

#### 10.1 Deploy Development Frontend
```bash
cd /var/www/winvinaya-crm/frontend

# Install dependencies
npm ci

# Build for dev environment
cp .env.dev .env
npm run build

# Create deploy directory
sudo mkdir -p /var/www/winvinaya-crm/frontend/dist-dev

# Copy build
sudo cp -r dist/* /var/www/winvinaya-crm/frontend/dist-dev/

# Set permissions
sudo chown -R www-data:www-data /var/www/winvinaya-crm/frontend/dist-dev
sudo chmod -R 755 /var/www/winvinaya-crm/frontend/dist-dev
```

#### 10.2 Deploy QA Frontend
```bash
# Build for qa environment
cp .env.qa .env
npm run build

# Create deploy directory
sudo mkdir -p /var/www/winvinaya-crm/frontend/dist-qa

# Copy build
sudo cp -r dist/* /var/www/winvinaya-crm/frontend/dist-qa/

# Set permissions
sudo chown -R www-data:www-data /var/www/winvinaya-crm/frontend/dist-qa
sudo chmod -R 755 /var/www/winvinaya-crm/frontend/dist-qa
```

#### 10.3 Deploy Production Frontend
```bash
# Build for prod environment
cp .env.prod .env
npm run build

# Create deploy directory
sudo mkdir -p /var/www/winvinaya-crm/frontend/dist-prod

# Copy build
sudo cp -r dist/* /var/www/winvinaya-crm/frontend/dist-prod/

# Set permissions
sudo chown -R www-data:www-data /var/www/winvinaya-crm/frontend/dist-prod
sudo chmod -R 755 /var/www/winvinaya-crm/frontend/dist-prod
```

---

### Step 11: Configure Nginx

#### 11.1 Copy Nginx Configuration Files
```bash
cd /var/www/winvinaya-crm/deploy

# Copy development config
sudo cp nginx-dev.conf /etc/nginx/sites-available/dev-crm.winvinaya.com

# Copy QA config
sudo cp nginx-qa.conf /etc/nginx/sites-available/qa-crm.winvinaya.com

# Copy production config
sudo cp nginx-prod.conf /etc/nginx/sites-available/crm.winvinaya.com
```

#### 11.2 Create Temporary HTTP-only Configs (for SSL setup)

Before we can use HTTPS, we need to temporarily create HTTP-only configs:

```bash
# Development HTTP config
sudo tee /etc/nginx/sites-available/dev-crm.winvinaya.com-temp << 'EOF'
server {
    listen 80;
    server_name dev-crm.winvinaya.com;

    # Frontend
    location / {
        root /var/www/winvinaya-crm/frontend/dist-dev;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# QA HTTP config
sudo tee /etc/nginx/sites-available/qa-crm.winvinaya.com-temp << 'EOF'
server {
    listen 80;
    server_name qa-crm.winvinaya.com;

    # Frontend
    location / {
        root /var/www/winvinaya-crm/frontend/dist-qa;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Production HTTP config
sudo tee /etc/nginx/sites-available/crm.winvinaya.com-temp << 'EOF'
server {
    listen 80;
    server_name crm.winvinaya.com www.crm.winvinaya.com;

    # Frontend
    location / {
        root /var/www/winvinaya-crm/frontend/dist-prod;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

#### 11.3 Enable Sites
```bash
# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Enable temporary HTTP configs
sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com-temp /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com-temp /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com-temp /etc/nginx/sites-enabled/
```

#### 11.4 Test and Reload Nginx
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Step 12: Set Up SSL Certificates with Let's Encrypt

#### 12.1 Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

#### 12.2 Obtain SSL Certificates

**IMPORTANT:** Before running these commands, make sure your domain DNS is pointing to your EC2 IP address!

```bash
# Get certificate for dev environment
sudo certbot --nginx -d dev-crm.winvinaya.com

# Get certificate for qa environment
sudo certbot --nginx -d qa-crm.winvinaya.com

# Get certificate for production environment
sudo certbot --nginx -d crm.winvinaya.com -d www.crm.winvinaya.com
```

Follow the prompts for each domain:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

#### 12.3 Replace with Full Nginx Configs

After SSL certificates are obtained, replace with the full configs:

```bash
# Remove temporary configs
sudo rm /etc/nginx/sites-enabled/*-temp

# Enable full HTTPS configs
sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 12.4 Set Up Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot automatically creates a cron job for renewal
# Verify it's there:
sudo systemctl list-timers | grep certbot
```

---

### Step 13: Configure PM2 to Start on Boot

```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Copy and run the command that PM2 outputs
# It will look something like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

### Step 14: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

## 🎯 Verification

### Check All Services

```bash
# Check PM2 processes
pm2 list
pm2 logs

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Test backends directly
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health

# Test via Nginx (replace with your actual domains)
curl https://dev-crm.winvinaya.com/api/health
curl https://qa-crm.winvinaya.com/api/health
curl https://crm.winvinaya.com/api/health
```

### Access Applications

Open in your browser:
- **Development:** https://dev-crm.winvinaya.com
- **QA:** https://qa-crm.winvinaya.com
- **Production:** https://crm.winvinaya.com

---

## 📊 Environment Summary

| Environment | Backend Port | Frontend Dir | Nginx Config | Database | Domain |
|------------|-------------|--------------|--------------|----------|---------|
| Development | 8000 | dist-dev | dev-crm.winvinaya.com | winvinaya_dev | https://dev-crm.winvinaya.com |
| QA | 8001 | dist-qa | qa-crm.winvinaya.com | winvinaya_qa | https://qa-crm.winvinaya.com |
| Production | 8002 | dist-prod | crm.winvinaya.com | winvinaya_prod | https://crm.winvinaya.com |

---

## 🔄 Useful Commands

### Restart Services
```bash
# Restart specific backend
pm2 restart winvinaya-backend-dev
pm2 restart winvinaya-backend-qa
pm2 restart winvinaya-backend-prod

# Restart all backends
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx
```

### View Logs
```bash
# PM2 logs for specific environment
pm2 logs winvinaya-backend-dev
pm2 logs winvinaya-backend-qa
pm2 logs winvinaya-backend-prod

# Nginx logs
sudo tail -f /var/log/nginx/dev-crm-access.log
sudo tail -f /var/log/nginx/qa-crm-access.log
sudo tail -f /var/log/nginx/crm-access.log
```

### Redeploy
```bash
# Pull latest code
cd /var/www/winvinaya-crm
git pull origin develop  # or qa, or main

# Redeploy backend
cd /var/www/winvinaya-crm/deploy
./backend-deploy.sh dev  # or qa, or prod

# Redeploy frontend
./frontend-deploy.sh dev  # or qa, or prod
```

### Database Backup
```bash
# Backup specific database
cd /var/www/winvinaya-crm/deploy
./backup-db.sh dev  # or qa, or prod
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs winvinaya-backend-dev

# Check if port is in use
sudo lsof -i :8000

# Manually test
cd /var/www/winvinaya-crm/backend
source venv-dev/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --env-file .env.dev
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U winvinaya_user -d winvinaya_dev -h localhost

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 🎉 Deployment Complete!

Your WinVinaya CRM application is now deployed with three separate environments on a single EC2 instance. Each environment has:

- ✅ Separate database
- ✅ Separate backend process
- ✅ Separate frontend build
- ✅ Separate domain/subdomain
- ✅ SSL/HTTPS enabled
- ✅ PM2 process management
- ✅ Auto-start on boot
- ✅ Nginx reverse proxy

---

## 📚 Next Steps

1. **Set up DNS** - Point your domains to your EC2 IP
2. **Configure GitHub Actions** - Automate deployments
3. **Set up monitoring** - Use PM2 monitoring or external tools
4. **Create backup strategy** - Schedule regular database backups
5. **Set up logging** - Centralize logs for easier debugging
