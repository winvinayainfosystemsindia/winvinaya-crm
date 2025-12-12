#!/bin/bash

# Quick Deployment Script for WinVinaya CRM
# This script automates the deployment of all three environments
# Run this on your EC2 instance after completing the prerequisites

set -e  # Exit on error

echo "========================================="
echo "WinVinaya CRM - Quick Deployment Script"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "/var/www/winvinaya-crm" ]; then
    echo "❌ Error: /var/www/winvinaya-crm directory not found!"
    echo "Please clone the repository first."
    exit 1
fi

cd /var/www/winvinaya-crm

# Step 1: Set up database permissions
echo "📦 Step 1: Setting up database permissions..."
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
EOF

echo "✅ Database permissions set!"
echo ""

# Step 2: Check if .env files exist
echo "📝 Step 2: Checking environment files..."
cd backend

ENV_FILES_MISSING=0

if [ ! -f ".env.dev" ]; then
    echo "⚠️  .env.dev not found, creating from example..."
    cp .env.dev.example .env.dev
    echo "⚠️  Please edit /var/www/winvinaya-crm/backend/.env.dev with your settings!"
    ENV_FILES_MISSING=1
fi

if [ ! -f ".env.qa" ]; then
    echo "⚠️  .env.qa not found, creating from example..."
    cp .env.qa.example .env.qa
    echo "⚠️  Please edit /var/www/winvinaya-crm/backend/.env.qa with your settings!"
    ENV_FILES_MISSING=1
fi

if [ ! -f ".env.prod" ]; then
    echo "⚠️  .env.prod not found, creating from example..."
    cp .env.prod.example .env.prod
    echo "⚠️  Please edit /var/www/winvinaya-crm/backend/.env.prod with your settings!"
    ENV_FILES_MISSING=1
fi

if [ $ENV_FILES_MISSING -eq 1 ]; then
    echo ""
    echo "❌ Environment files need to be configured!"
    echo "Please edit the .env files and run this script again."
    exit 1
fi

echo "✅ All environment files present!"
echo ""

# Step 3: Make deploy scripts executable
echo "🔧 Step 3: Making deploy scripts executable..."
cd /var/www/winvinaya-crm/deploy
chmod +x *.sh
echo "✅ Deploy scripts ready!"
echo ""

# Step 4: Deploy backends
echo "🚀 Step 4: Deploying backends..."
echo ""

echo "Deploying DEV backend (port 8000)..."
./backend-deploy.sh dev
echo ""

echo "Deploying QA backend (port 8001)..."
./backend-deploy.sh qa
echo ""

echo "Deploying PROD backend (port 8002)..."
./backend-deploy.sh prod
echo ""

echo "✅ All backends deployed!"
pm2 list
echo ""

# Step 5: Create frontend environment files
echo "📝 Step 5: Creating frontend environment files..."
cd /var/www/winvinaya-crm/frontend

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

echo "✅ Frontend environment files created!"
echo ""

# Step 6: Build and deploy frontends
echo "🎨 Step 6: Building and deploying frontends..."
echo ""

# Install dependencies once
echo "Installing frontend dependencies..."
npm ci
echo ""

# Build and deploy dev
echo "Building DEV frontend..."
cp .env.dev .env
npm run build
sudo mkdir -p dist-dev
sudo cp -r dist/* dist-dev/
sudo chown -R www-data:www-data dist-dev
sudo chmod -R 755 dist-dev
echo "✅ DEV frontend deployed!"
echo ""

# Build and deploy qa
echo "Building QA frontend..."
cp .env.qa .env
npm run build
sudo mkdir -p dist-qa
sudo cp -r dist/* dist-qa/
sudo chown -R www-data:www-data dist-qa
sudo chmod -R 755 dist-qa
echo "✅ QA frontend deployed!"
echo ""

# Build and deploy prod
echo "Building PROD frontend..."
cp .env.prod .env
npm run build
sudo mkdir -p dist-prod
sudo cp -r dist/* dist-prod/
sudo chown -R www-data:www-data dist-prod
sudo chmod -R 755 dist-prod
echo "✅ PROD frontend deployed!"
echo ""

# Step 7: Configure Nginx with temporary HTTP configs
echo "🌐 Step 7: Configuring Nginx..."

# Create temporary HTTP-only configs
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

echo "✅ Nginx configured!"
echo ""

# Step 8: Configure PM2 startup
echo "⚡ Step 8: Configuring PM2 auto-start..."
pm2 save
pm2 startup | tail -1 > /tmp/pm2-startup.sh
sudo bash /tmp/pm2-startup.sh
echo "✅ PM2 auto-start configured!"
echo ""

# Step 9: Configure firewall
echo "🔒 Step 9: Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✅ Firewall configured!"
echo ""

echo "========================================="
echo "✨ Deployment Complete! ✨"
echo "========================================="
echo ""
echo "📊 Status Summary:"
echo ""
echo "Backend Services (PM2):"
pm2 list
echo ""
echo "🌐 Your applications are running at:"
echo "  Development: http://dev-crm.winvinaya.com"
echo "  QA:          http://qa-crm.winvinaya.com"
echo "  Production:  http://crm.winvinaya.com"
echo ""
echo "🔐 Next Steps:"
echo "1. Make sure your DNS is pointing to this EC2 instance"
echo "2. Install SSL certificates with:"
echo "   sudo certbot --nginx -d dev-crm.winvinaya.com"
echo "   sudo certbot --nginx -d qa-crm.winvinaya.com"
echo "   sudo certbot --nginx -d crm.winvinaya.com -d www.crm.winvinaya.com"
echo ""
echo "3. After SSL is installed, copy the full nginx configs:"
echo "   cd /var/www/winvinaya-crm/deploy"
echo "   sudo cp nginx-dev.conf /etc/nginx/sites-available/dev-crm.winvinaya.com"
echo "   sudo cp nginx-qa.conf /etc/nginx/sites-available/qa-crm.winvinaya.com"
echo "   sudo cp nginx-prod.conf /etc/nginx/sites-available/crm.winvinaya.com"
echo "   sudo rm /etc/nginx/sites-enabled/*-temp"
echo "   sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com /etc/nginx/sites-enabled/"
echo "   sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com /etc/nginx/sites-enabled/"
echo "   sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "📚 For detailed information, see DEPLOYMENT_GUIDE.md"
echo "========================================="
