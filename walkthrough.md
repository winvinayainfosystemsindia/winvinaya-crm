# WinVinaya CRM - CI/CD Implementation Walkthrough

## 🎯 Objective Achieved

Implemented a professional-grade CI/CD pipeline for WinVinaya CRM supporting three environments (dev, QA, production) on a single AWS EC2 instance with automated deployment via GitHub Actions.

---

## 📦 What Was Created

### 1. GitHub Actions Workflows (3 files)

#### [.github/workflows/deploy-dev.yml](file:///c:/External-projects/WinVinaya/winvinaya-crm/.github/workflows/deploy-dev.yml)
- **Trigger**: Push to `develop` branch
- **Features**: Automatic deployment to dev environment
- **Actions**: Build frontend → SSH to EC2 → Deploy backend → Deploy frontend → Health check

#### [.github/workflows/deploy-qa.yml](file:///c:/External-projects/WinVinaya/winvinaya-crm/.github/workflows/deploy-qa.yml)
- **Trigger**: Push to `qa` branch
- **Features**: Runs tests before deployment
- **Actions**: Run backend tests → Run frontend tests → Build → Deploy to QA

#### [.github/workflows/deploy-prod.yml](file:///c:/External-projects/WinVinaya/winvinaya-crm/.github/workflows/deploy-prod.yml)
- **Trigger**: Push to [main](file:///c:/External-projects/WinVinaya/winvinaya-crm/backend/app/repositories/candidate_profile_repository.py#30-36) branch
- **Features**: Manual approval required, automatic rollback on failure
- **Actions**: Full test suite → Manual approval → Backup database → Deploy → Verify → Rollback on failure

---

### 2. Deployment Scripts (5 files in `deploy/` directory)

#### [backend-deploy.sh](file:///c:/External-projects/WinVinaya/winvinaya-crm/deploy/backend-deploy.sh)
- **Purpose**: Deploy FastAPI backend to specific environment
- **Features**:
  - Environment-specific ports (dev:8000, qa:8001, prod:8002)
  - Virtual environment management (venv-dev, venv-qa, venv-prod)
  - PM2 process management
  - Automatic database migrations
  - Health checks

#### [frontend-deploy.sh](file:///c:/External-projects/WinVinaya/winvinaya-crm/deploy/frontend-deploy.sh)
- **Purpose**: Build and deploy React frontend
- **Features**:
  - Environment-specific build directories (dist-dev, dist-qa, dist-prod)
  - Automatic backup of previous deployment
  - Nginx reload
  - Permission management

#### [health-check.sh](file:///c:/External-projects/WinVinaya/winvinaya-crm/deploy/health-check.sh)
- **Purpose**: Verify deployment success
- **Checks**: Backend API health, PM2 process status, database connectivity

#### [backup-db.sh](file:///c:/External-projects/WinVinaya/winvinaya-crm/deploy/backup-db.sh)
- **Purpose**: Create timestamped database backups
- **Features**: Compressed backups, automatic cleanup (keeps last 10)

#### [rollback.sh](file:///c:/External-projects/WinVinaya/winvinaya-crm/deploy/rollback.sh)
- **Purpose**: Revert to previous deployment
- **Features**: Git rollback, database restore, full redeployment

---

### 3. Nginx Configurations (3 files in `nginx/` directory)

#### [dev.conf](file:///c:/External-projects/WinVinaya/winvinaya-crm/nginx/dev.conf) → dev-crm.winvinaya.com
- **Backend Proxy**: Routes `/api` to `http://127.0.0.1:8000`
- **Frontend**: Serves from `/var/www/winvinaya-crm/frontend/dist-dev`
- **Features**: React Router support, static asset caching, SSL ready

#### [qa.conf](file:///c:/External-projects/WinVinaya/winvinaya-crm/nginx/qa.conf) → qa-crm.winwinaya.com
- **Backend Proxy**: Routes `/api` to `http://127.0.0.1:8001`
- **Frontend**: Serves from `/var/www/winvinaya-crm/frontend/dist-qa`

#### [prod.conf](file:///c:/External-projects/WinVinaya/winvinaya-crm/nginx/prod.conf) → crm.winvinaya.com
- **Backend Proxy**: Routes `/api` to `http://127.0.0.1:8002`
- **Frontend**: Serves from `/var/www/winvinaya-crm/frontend/dist-prod`
- **Features**: Mandatory HTTPS, enhanced security headers, rate limiting

---

### 4. Environment Templates (6 files)

**Backend** (`.env.{dev|qa|prod}.example`):
- Database connections (separate databases per environment)
- Secret keys
- CORS origins
- Rate limiting configuration
- Email settings

**Frontend** (`.env.{dev|qa|prod}.example`):
- API URLs pointing to respective environments
- Environment identifiers

---

### 5. Documentation (3 comprehensive guides)

#### [docs/SERVER_SETUP.md](file:///c:/External-projects/WinVinaya/winvinaya-crm/docs/SERVER_SETUP.md)
- **EC2 instance setup**: Ubuntu 22.04, t3.medium specifications
- **Software installation**: Python 3.11, Node.js 20, PostgreSQL 15, Nginx, PM2
- **Database configuration**: Creation of 3 separate databases
- **Security setup**: UFW firewall, SSL certificates with Let's Encrypt
- **Initial deployment**: Step-by-step deployment of all environments

#### [docs/DEPLOYMENT.md](file:///c:/External-projects/WinVinaya/winvinaya-crm/docs/DEPLOYMENT.md)
- **Architecture diagram**: Visual representation of single-instance setup
- **Branch strategy**: develop → qa → main workflow
- **Deployment procedures**: Automated and manual deployment steps
- **Rollback procedures**: Automatic and manual rollback instructions
- **Troubleshooting**: Common issues and solutions
- **Monitoring guide**: PM2, Nginx logs, health endpoints

#### [docs/CI-CD-README.md](file:///c:/External-projects/WinVinaya/winvinaya-crm/docs/CI-CD-README.md)
- **Quick start guide**: GitHub secrets configuration
- **Deployment workflows table**: Environment, branch, auto-deploy status
- **File structure overview**: Complete directory layout
- **Security checklist**: Pre-deployment security verification
- **Support information**: Troubleshooting quick reference

---

## 🏗️ Architecture Overview

### Single EC2 Instance Design

```
┌─────────────────────────────────────────┐
│         AWS EC2 Instance (t3.medium)    │
│                                         │
│  Nginx (Port 80/443)                   │
│    ├─ dev-crm.winvinaya.com  → :8000   │
│    ├─ qa-crm.winvinaya.com   → :8001   │
│    └─ crm.winvinaya.com      → :8002   │
│                                         │
│  Backend (PM2)                          │
│    ├─ winvinaya-backend-dev  (8000)    │
│    ├─ winvinaya-backend-qa   (8001)    │
│    └─ winvinaya-backend-prod (8002)    │
│                                         │
│  Frontend (Static Files)                │
│    ├─ /dist-dev/                        │
│    ├─ /dist-qa/                         │
│    └─ /dist-prod/                       │
│                                         │
│  PostgreSQL                             │
│    ├─ winvinaya_dev                     │
│    ├─ winvinaya_qa                      │
│    └─ winvinaya_prod                    │
└─────────────────────────────────────────┘
```

**Benefits of Single Instance:**
- ✅ Cost-effective (one EC2 instance instead of three)
- ✅ Easier management and monitoring
- ✅ Shared resources (PostgreSQL, Nginx)
- ✅ Environment isolation via ports and directories
- ✅ Simplified networking and security groups

---

## 🔄 Deployment Flow

### Development → QA → Production Pipeline

```
Developer pushes to 'develop'
            ↓
    GitHub Actions triggers
            ↓
    Build frontend + backend
            ↓
    SSH to EC2 instance
            ↓
    Deploy to dev environment (port 8000)
            ↓
    ✅ Live at dev-crm.winvinaya.com

    ─────────────────────

Merge 'develop' to 'qa'
            ↓
    Run all tests
            ↓
    Tests pass? → Deploy to QA (port 8001)
            ↓
    ✅ Live at qa-crm.winvinaya.com

    ─────────────────────

Merge 'qa' to 'main'
            ↓
    Run full test suite
            ↓
    ⚠️ Wait for manual approval
            ↓
    Backup database
            ↓
    Deploy to production (port 8002)
            ↓
    Health checks pass?
       Yes → ✅ Live at crm.winvinaya.com
       No  → ⚠️ Auto-rollback
```

---

## 🛠️ Key Features Implemented

### 1. **Environment Isolation**
- Separate ports for each backend instance
- Separate directories for frontend builds
- Separate PostgreSQL databases
- Independent PM2 processes

### 2. **Automated Deployment**
- Push-to-deploy for dev and QA
- Approval-based deployment for production
- Automatic frontend builds with environment-specific configs
- Database migration automation

### 3. **Safety Mechanisms**
- Mandatory tests for QA and prod
- Automated database backups before prod deployment
- Health checks post-deployment
- Automatic rollback on production failure
- Git tagging for version history

### 4. **Operational Excellence**
- PM2 process management with auto-restart
- Nginx reverse proxy with caching
- Compressed database backups (keeps last 10)
- Comprehensive logging (application + Nginx)

### 5. **Security**
- SSL/TLS ready configurations
- Environment-specific CORS settings
- Security headers in Nginx
- Rate limiting in production
- Firewall configuration guide

---

## 📈 Usage Statistics

**Files Created**: 22 files
- 3 GitHub Actions workflows
- 5 Deployment scripts
- 3 Nginx configurations
- 6 Environment templates
- 3 Documentation files
- 1 README
- 1 Implementation plan

**Lines of Code**: ~1,800 lines
- Bash scripts: ~600 lines
- YAML workflows: ~400 lines
- Nginx configs: ~250 lines
- Documentation: ~550 lines

---

## ✅ What's Ready to Use

1. **GitHub Actions**: Push to develop/qa/main to trigger deployments
2. **EC2 Scripts**: All deployment scripts ready to execute
3. **Nginx Configs**: Ready to copy to `/etc/nginx/sites-available/`
4. **Environment Templates**: Ready to customize and deploy
5. **Documentation**: Complete guides for setup, deployment, and troubleshooting

---

## 🚀 Next Steps for User

### 1. Server Setup (One-time)
```bash
# Follow docs/SERVER_SETUP.md
- Launch EC2 instance
- Install software (Python, Node.js, PostgreSQL, Nginx, PM2)
- Clone repository
- Configure environment files
- Setup Nginx
- Obtain SSL certificates
```

### 2. GitHub Configuration (One-time)
```bash
# Add secrets in GitHub repo settings
EC2_HOST = Your_EC2_IP
EC2_USER = ubuntu
SSH_PRIVATE_KEY = Contents_of_private_key
```

### 3. Start Deploying
```bash
# Development
git push origin develop  # Auto-deploys

# QA
git push origin qa  # Auto-deploys after tests

# Production
git push origin main  # Requires approval
```

---

## 🎓 Learning Outcomes

This implementation demonstrates:
- Professional DevOps practices
- GitHub Actions CI/CD
- Multi-environment deployment strategy
- Nginx reverse proxy configuration
- PM2 process management
- Database management and backups
- Security best practices
- Comprehensive documentation

---

**Status**: ✅ **COMPLETE** - Ready for deployment!
