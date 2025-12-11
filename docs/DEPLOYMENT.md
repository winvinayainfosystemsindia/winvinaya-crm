# WinVinaya CRM - CI/CD Deployment Guide

## Overview

This guide explains how to use the CI/CD pipeline to deploy WinVinaya CRM across three environments (dev, QA, prod) on a single AWS EC2 instance.

## Architecture

**Single EC2 Instance Multi-Environment Setup:**
```
┌─────────────────────────────────────────┐
│         AWS EC2 Instance                │
│  ┌────────────────────────────────────┐ │
│  │ Nginx (Reverse Proxy)              │ │
│  │  ├─ dev-crm.winvinaya.com:443     │ │
│  │  ├─ qa-crm.winvinaya.com:443      │ │
│  │  └─ crm.winvinaya.com:443         │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Backend (FastAPI + PM2)            │ │
│  │  ├─ dev:  port 8000                │ │
│  │  ├─ qa:   port 8001                │ │
│  │  └─ prod: port 8002                │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Frontend (React Builds)            │ │
│  │  ├─ dist-dev/                      │ │
│  │  ├─ dist-qa/                       │ │
│  │  └─ dist-prod/                     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ PostgreSQL                         │ │
│  │  ├─ winvinaya_dev                  │ │
│  │  ├─ winvinaya_qa                   │ │
│  │  └─ winvinaya_prod                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Branch Strategy

```
develop  → Dev Environment    (Auto-deploy)
qa       → QA Environment     (Auto-deploy after tests)
main     → Prod Environment   (Manual approval required)
```

## Deployment Workflows

### 1. Development Deployment

**Trigger**: Push to `develop` branch

**Steps**:
1. Push code to `develop` branch
2. GitHub Actions automatically triggers
3. Frontend built with dev config
4. Deployed to EC2 dev environment (port 8000)
5. Accessible at: https://dev-crm.winvinaya.com

**Example**:
```bash
git checkout develop
git pull origin develop
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin develop
# ✅ Auto-deploys to dev
```

### 2. QA Deployment

**Trigger**: Push to `qa` branch

**Steps**:
1. Merge `develop` to `qa`
2. GitHub Actions runs all tests
3. If tests pass, deployment starts
4. Deployed to EC2 QA environment (port 8001)
5. Accessible at: https://qa-crm.winvinaya.com

**Example**:
```bash
git checkout qa
git merge develop
git push origin qa
# ✅ Runs tests → Auto-deploys to QA
```

### 3. Production Deployment

**Trigger**: Push to `main` branch

**Steps**:
1. Merge `qa` to `main`
2. GitHub Actions runs full test suite
3. **Waits for manual approval**
4. Creates backup tag
5. Backs up production database
6. Deploys to production (port 8002)
7. Runs health checks
8. **Auto-rollback on failure**
9. Accessible at: https://crm.winvinaya.com

**Example**:
```bash
git checkout main
git merge qa
git push origin main
# 🔒 Waits for approval in GitHub Actions
# ✅ After approval, deploys to production
```

## Manual Deployment

If you need to deploy manually on the server:

### Deploy to Development
```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm
git checkout develop
git pull origin develop
./deploy/backend-deploy.sh dev
./deploy/frontend-deploy.sh dev
./deploy/health-check.sh dev
```

### Deploy to QA
```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm
git checkout qa
git pull origin qa
./deploy/backend-deploy.sh qa
./deploy/frontend-deploy.sh qa
./deploy/health-check.sh qa
```

### Deploy to Production
```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm
git checkout main
git pull origin main
./deploy/backup-db.sh prod  # Backup first!
./deploy/backend-deploy.sh prod
./deploy/frontend-deploy.sh prod
./deploy/health-check.sh prod
```

## Rollback Procedures

### Automatic Rollback
Production deployments automatically rollback if health checks fail.

### Manual Rollback
```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm
./deploy/rollback.sh {dev|qa|prod}
```

### Rollback to Specific Version
```bash
git checkout {commit-hash or tag}
./deploy/backend-deploy.sh {env}
./deploy/frontend-deploy.sh {env}
```

## Monitoring Deployments

### GitHub Actions
1. Go to repository → Actions tab
2. Select the workflow run
3. View real-time logs
4. Check deployment status

### Server Monitoring
```bash
# PM2 status
pm2 status

# View logs
pm2 logs winvinaya-backend-dev  # Dev
pm2 logs winvinaya-backend-qa   # QA
pm2 logs winvinaya-backend-prod # Prod

# Nginx logs
sudo tail -f /var/log/nginx/dev-crm-access.log
sudo tail -f /var/log/nginx/qa-crm-access.log
sudo tail -f /var/log/nginx/prod-crm-access.log
```

## Environment Configuration

### Updating Environment Variables

**Development:**
```bash
ssh ubuntu@YOUR_EC2_IP
nano /var/www/winvinaya-crm/backend/.env.dev
# Make changes
./deploy/backend-deploy.sh dev  # Restart to apply
```

**QA:**
```bash
nano /var/www/winvinaya-crm/backend/.env.qa
./deploy/backend-deploy.sh qa
```

**Production:**
```bash
nano /var/www/winvinaya-crm/backend/.env.prod
./deploy/backend-deploy.sh prod
```

## Database Migrations

Migrations run automatically during deployment. To run manually:

```bash
cd /var/www/winvinaya-crm/backend
source venv-{env}/bin/activate
export $(cat .env.{env} | xargs)
alembic upgrade head
```

## Common Deployment Issues

### Issue: Deployment Fails on GitHub Actions

**Solution**:
1. Check GitHub Actions logs
2. Verify secrets are configured (EC2_HOST, EC2_USER, SSH_PRIVATE_KEY)
3. Ensure branches are up to date

### Issue: Backend Not Starting After Deployment

**Solution**:
```bash
pm2 logs winvinaya-backend-{env} --lines 100
# Check for errors
pm2 restart winvinaya-backend-{env}
```

### Issue: Nginx Returns 502 Bad Gateway

**Solution**:
```bash
# Check if backend is running
pm2 status
curl http://localhost:800{0|1|2}/health

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Database Migration Fails

**Solution**:
```bash
# Check database status
sudo systemctl status postgresql

# Manual migration
cd /var/www/winvinaya-crm/backend
source venv-{env}/bin/activate
alembic current
alembic history
alembic upgrade head
```

## Best Practices

1. **Always test in dev** before promoting to QA
2. **Run all tests in QA** before merging to main
3. **Backup production** database before deployment
4. **Monitor deployments** in GitHub Actions
5. **Check health endpoints** after deployment
6. **Use rollback** if issues detected
7. **Keep environment variables** up to date
8. **Review logs** regularly

## Security Notes

- Never commit `.env` files to git
- Rotate secrets regularly
- Use strong passwords
- Keep system updated
- Monitor access logs
- Enable GitHub branch protection rules

---

**Need Help?** Check logs, run health checks, or consult troubleshooting guide.
