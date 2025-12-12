# 🔧 Quick Fix for Database Connection Error

## Problem
You're getting this error:
```
socket.gaierror: [Errno -2] Name or service not known
```

This means your database connection settings are incorrect in the `.env` files.

---

## ⚡ Quick Fix (Copy-Paste Commands)

### Option 1: Run the Automated Fix Script

```bash
cd /var/www/winvinaya-crm
bash fix-database-connection.sh
```

This script will:
- Fix all `.env` files with correct database settings
- Set database permissions
- Redeploy all backends
- Test connectivity

---

### Option 2: Manual Fix

If you prefer to fix it manually, follow these steps:

#### Step 1: Fix the Development .env File

```bash
cd /var/www/winvinaya-crm/backend

cat > .env.dev << 'EOF'
# Database Configuration
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=winvinaya_dev
POSTGRES_USER=winvinaya_user
POSTGRES_PASSWORD=winvinaya@12345

# Application Configuration
SECRET_KEY=dev-secret-key-change-this
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

# Email Configuration
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
```

#### Step 2: Fix Database Permissions

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

#### Step 3: Stop Existing Processes

```bash
pm2 stop all
pm2 delete all
```

#### Step 4: Redeploy Development Backend

```bash
cd /var/www/winvinaya-crm/deploy
chmod +x *.sh
./backend-deploy.sh dev
```

#### Step 5: Test the Backend

```bash
# Check PM2 status
pm2 list

# Test health endpoint
curl http://localhost:8000/health

# Check logs if there are issues
pm2 logs winvinaya-backend-dev --lines 50
```

---

## 🔍 Root Cause

The error occurs because:

1. **Missing or incorrect POSTGRES_SERVER**: The `.env` file might be using a hostname that doesn't resolve
2. **Database permissions**: PostgreSQL 15+ requires explicit schema permissions
3. **Wrong database URL format**: Some configurations use `DATABASE_URL` instead of individual `POSTGRES_*` variables

---

## ✅ Verification

After fixing, you should see:

```bash
pm2 list
```

Output should show:
```
┌─────┬──────────────────────────┬─────────┬─────────┐
│ id  │ name                     │ mode    │ status  │
├─────┼──────────────────────────┼─────────┼─────────┤
│ 0   │ winvinaya-backend-dev    │ fork    │ online  │
└─────┴──────────────────────────┴─────────┴─────────┘
```

And testing the health endpoint:
```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status":"healthy"}
```

---

## 🐛 Still Having Issues?

### Check PostgreSQL is Running
```bash
sudo systemctl status postgresql
```

### Test Database Connection Manually
```bash
PGPASSWORD=winvinaya@12345 psql -U winvinaya_user -d winvinaya_dev -h localhost -c "SELECT 1;"
```

If this fails, the issue is with PostgreSQL or user permissions.

### Check Backend Logs
```bash
pm2 logs winvinaya-backend-dev --lines 100
```

### Check .env File
```bash
cat /var/www/winvinaya-crm/backend/.env.dev
```

Make sure:
- `POSTGRES_SERVER=localhost` (not an IP or hostname)
- `POSTGRES_PORT=5432`
- `POSTGRES_USER=winvinaya_user`
- `POSTGRES_PASSWORD=winvinaya@12345`
- `POSTGRES_DB=winvinaya_dev`

---

## 📞 Next Steps After Fix

Once the development backend is working:

1. **Deploy QA and Production:**
   ```bash
   cd /var/www/winvinaya-crm/deploy
   ./backend-deploy.sh qa
   ./backend-deploy.sh prod
   ```

2. **Deploy Frontends:**
   ```bash
   # Follow DEPLOYMENT_GUIDE.md step 10
   ```

3. **Configure Nginx and SSL:**
   ```bash
   # Follow DEPLOYMENT_GUIDE.md steps 11-12
   ```

---

**The main fix is ensuring `POSTGRES_SERVER=localhost` in your .env files!**
