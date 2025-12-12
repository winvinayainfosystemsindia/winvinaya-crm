#!/bin/bash

# Fix Database Connection Error
# This script fixes the "Name or service not known" error

echo "========================================="
echo "Fixing Database Connection Issue"
echo "========================================="
echo ""

cd /var/www/winvinaya-crm/backend

# Backup existing .env files
echo "Creating backups..."
cp .env.dev .env.dev.backup 2>/dev/null || true
cp .env.qa .env.qa.backup 2>/dev/null || true
cp .env.prod .env.prod.backup 2>/dev/null || true

# Fix Development Environment
echo "Fixing .env.dev..."
cat > .env.dev << 'EOF'
# WinVinaya CRM - Development Environment Variables

# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_dev
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=dev-secret-key-change-this-in-production-$(openssl rand -hex 16)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development

# CORS Configuration
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","https://dev-crm.winvinaya.com"]

# Rate Limiting
RATE_LIMIT_ENABLED=true
REDIS_URL=memory://

# Admin User (for initial setup)
FIRST_SUPERUSER=admin@winvinaya.com
FIRST_SUPERUSER_PASSWORD=changeme123

# Email Configuration (optional for dev)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=noreply@winvinaya.com

# File Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=["pdf","jpg","jpeg","png","doc","docx"]

# API Documentation
PROJECT_NAME=WinVinaya CRM - Development
EOF

# Fix QA Environment
echo "Fixing .env.qa..."
cat > .env.qa << 'EOF'
# WinVinaya CRM - QA Environment Variables

# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_qa
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=qa-secret-key-change-this-in-production-$(openssl rand -hex 16)
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

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAILS_FROM_EMAIL=noreply@winvinaya.com

# File Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=["pdf","jpg","jpeg","png","doc","docx"]

# API Documentation
PROJECT_NAME=WinVinaya CRM - QA
EOF

# Fix Production Environment
echo "Fixing .env.prod..."
cat > .env.prod << 'EOF'
# WinVinaya CRM - Production Environment Variables

# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_prod
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=prod-secret-key-CHANGE-THIS-$(openssl rand -hex 16)
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
FIRST_SUPERUSER_PASSWORD=ChangeThisStrongPassword123!

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@winvinaya.com
SMTP_PASSWORD=your_production_app_password
EMAILS_FROM_EMAIL=noreply@winvinaya.com

# File Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=["pdf","jpg","jpeg","png","doc","docx"]

# API Documentation
PROJECT_NAME=WinVinaya CRM

# Logging
LOG_LEVEL=INFO
EOF

echo "✅ Environment files fixed!"
echo ""

# Now let's test database connectivity
echo "Testing database connectivity..."
echo ""

for env in dev qa prod; do
    case $env in
        dev) DB="winvinaya_dev" ;;
        qa) DB="winvinaya_qa" ;;
        prod) DB="winvinaya_prod" ;;
    esac
    
    echo "Testing $env ($DB)..."
    if PGPASSWORD=winvinaya@12345 psql -U winvinaya_user -d $DB -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
        echo "  ✅ $DB connection successful"
    else
        echo "  ❌ $DB connection failed - may need permissions"
    fi
done

echo ""
echo "========================================="
echo "Fixing Database Permissions..."
echo "========================================="
echo ""

# Fix database permissions
sudo -u postgres psql << 'EOSQL'
-- Development Database
\c winvinaya_dev
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;

-- QA Database
\c winvinaya_qa
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;

-- Production Database
\c winvinaya_prod
GRANT ALL ON SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO winvinaya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO winvinaya_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO winvinaya_user;
EOSQL

echo "✅ Database permissions fixed!"
echo ""

# Stop all PM2 processes
echo "Stopping existing backend processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

echo ""
echo "========================================="
echo "Redeploying Backends..."
echo "========================================="
echo ""

# Redeploy development
cd /var/www/winvinaya-crm/deploy
chmod +x *.sh

echo "Deploying DEV backend..."
./backend-deploy.sh dev

echo ""
echo "Deploying QA backend..."
./backend-deploy.sh qa

echo ""
echo "Deploying PROD backend..."
./backend-deploy.sh prod

echo ""
echo "========================================="
echo "✅ Fix Complete!"
echo "========================================="
echo ""

# Show status
pm2 list

echo ""
echo "Testing backend health..."
sleep 3
curl http://localhost:8000/health 2>/dev/null && echo "✅ DEV backend is healthy" || echo "❌ DEV backend not responding"
curl http://localhost:8001/health 2>/dev/null && echo "✅ QA backend is healthy" || echo "❌ QA backend not responding"
curl http://localhost:8002/health 2>/dev/null && echo "✅ PROD backend is healthy" || echo "❌ PROD backend not responding"

echo ""
echo "If any backend is not responding, check logs with:"
echo "  pm2 logs"
echo ""
