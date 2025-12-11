# WinVinaya CRM - Professional CI/CD Implementation Plan

## Overview
Implement a production-grade CI/CD pipeline using GitHub Actions for deploying to AWS EC2 instances across three environments (dev, QA, prod) with automated builds, tests, and deployment.

## Architecture

### Environment Strategy
- **Development**: Auto-deploy on push to `develop` branch
- **QA**: Auto-deploy on push to `qa` branch (requires tests to pass)
- **Production**: Manual approval on push to [main](file:///c:/External-projects/WinVinaya/winvinaya-crm/backend/app/repositories/candidate_profile_repository.py#30-36) branch (requires QA approval)

### Infrastructure (AWS EC2)
- **3 separate EC2 instances** (one per environment)
- **Single instance deployment** (Backend + Frontend + PostgreSQL)
- **Nginx** as reverse proxy for both frontend and API
- **PM2** for process management (backend)
- **SSL/TLS** via Let's Encrypt (Certbot)

---

## Implementation Components

### 1. GitHub Actions Workflows

#### Main CI/CD Pipeline
**File**: `.github/workflows/deploy.yml`
- Trigger on push to `develop`, `qa`, [main](file:///c:/External-projects/WinVinaya/winvinaya-crm/backend/app/repositories/candidate_profile_repository.py#30-36) branches
- Build and test backend (pytest)
- Build frontend (npm build)
- Deploy to respective environment based on branch
- Environment-specific configurations

#### Reusable Deployment Action
**File**: `.github/workflows/deploy-action.yml`
- Parameterized deployment function
- SSH deployment to EC2
- Database migration execution
- Health checks post-deployment

---

### 2. Deployment Scripts

#### Backend Deployment (`deploy/backend-deploy.sh`)
```
- Stop running FastAPI service
- Pull latest code
- Create Python virtual environment
- Install dependencies
- Run database migrations
- Start FastAPI with PM2
- Health check
```

#### Frontend Deployment (`deploy/frontend-deploy.sh`)
```
- Pull latest code
- Install npm dependencies
- Build production bundle
- Copy to nginx serve directory
- Reload nginx
```

#### Database Migration (`deploy/db-migrate.sh`)
```
- Backup current database
- Run Alembic migrations
- Verify migration success
- Rollback on failure
```

---

### 3. Nginx Configuration

#### Dev Environment (`nginx/dev.conf`)
- Domain: `dev-crm.winvinaya.com`
- Frontend: Port 80/443
- API Proxy: `/api` → `http://127.0.0.1:8000`

#### QA Environment (`nginx/qa.conf`)
- Domain: `qa-crm.winvinaya.com`
- Frontend: Port 80/443
- API Proxy: `/api` → `http://127.0.0.1:8000`

#### Prod Environment (`nginx/prod.conf`)
- Domain: `crm.winvinaya.com`
- Frontend: Port 80/443 (HTTPS only)
- API Proxy: `/api` → `http://127.0.0.1:8000`
- Enhanced security headers
- Rate limiting

---

### 4. Environment Configuration

#### Environment Variables
**Backend** (`.env.{dev|qa|prod}`):
- DATABASE_URL
- SECRET_KEY
- ENVIRONMENT (dev|qa|prod)
- BACKEND_CORS_ORIGINS
- RATE_LIMIT_ENABLED

**Frontend** (`.env.{dev|qa|prod}`):
- VITE_API_URL
- VITE_APP_ENV

#### GitHub Secrets (Required)
- `SSH_PRIVATE_KEY` - SSH key for EC2 access
- `DEV_HOST`, `QA_HOST`, `PROD_HOST` - EC2 IP addresses
- `DEV_ENV`, `QA_ENV`, `PROD_ENV` - Environment variable files (base64 encoded)

---

### 5. EC2 Server Setup

#### Prerequisites
- Ubuntu 22.04 LTS
- Python 3.11+
- PostgreSQL 15
- Node.js 20 LTS
- Nginx
- PM2
- Git

#### Directory Structure
```
/var/www/winvinaya-crm/
├── backend/
├── frontend/
│   └── dist/
├── logs/
└── backups/
```

---

## Security Considerations

1. **SSH Access**: Key-based authentication only
2. **Environment Variables**: Stored in GitHub Secrets
3. **Database**: No external access, localhost only
4. **SSL/TLS**: Mandatory for QA and Prod
5. **Firewall**: UFW configured (allow 22, 80, 443)
6. **Rate Limiting**: Nginx + Backend rate limits

---

## Rollback Strategy

1. **Git-based rollback**: Tag each deploymentment
2. **Database backups**: Before each migration
3. **Quick rollback script**: Restore previous version
4. **Health checks**: Auto-rollback on failure

---

## Monitoring & Logging

1. **Application Logs**: `/var/www/winvinaya-crm/logs/`
2. **Nginx Logs**: `/var/log/nginx/`
3. **PM2 Monitoring**: `pm2 monit`
4. **Health Endpoints**: `/api/health` (backend), `/health` (frontend)

---

## Deployment Flow

### Development
```
1. Push to develop → GitHub Actions triggered
2. Run tests
3. Build application
4. Deploy to dev EC2
5. Notify team
```

### QA
```
1. Merge develop to qa → GitHub Actions triggered
2. Run full test suite
3. Build application
4. Deploy to QA EC2  
5. Notify QA team
```

### Production
```
1. Merge qa to main → GitHub Actions triggered
2. Wait for manual approval
3. Run production tests
4. Build application
5. Deploy to prod EC2
6. Verify deployment
7. Notify stakeholders
```

---

## Documentation Artifacts

1. **Server Setup Guide** - EC2 initial configuration
2. **Deployment Guide** - How to deploy manually
3. **Troubleshooting Guide** - Common issues and fixes
4. **Rollback Procedures** - Emergency rollback steps
5. **Security Checklist** - Pre-deployment security verification
