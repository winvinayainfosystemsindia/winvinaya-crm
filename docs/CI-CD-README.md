# WinVinaya CRM - CI/CD Deployment

## 🚀 Quick Start

### For First-Time Server Setup
1. Follow [SERVER_SETUP.md](docs/SERVER_SETUP.md) to configure your EC2 instance
2. Configure GitHub Secrets (see below)
3. Push to respective branches to deploy

### GitHub Secrets Configuration

Add these secrets in: **Settings** → **Secrets and variables** → **Actions**

```
EC2_HOST         = Your EC2 Public IP address
EC2_USER         = ubuntu
SSH_PRIVATE_KEY  = Contents of your .pem file
```

## 📋 Deployment Workflows

| Environment | Branch | Auto-Deploy | URL |
|------------|--------|-------------|-----|
| Development | `develop` | ✅ Yes | https://dev-crm.winvinaya.com |
| QA | `qa` | ✅ Yes (after tests) | https://qa-crm.winvinaya.com |
| Production | `main` | ⚠️ Manual approval | https://crm.winvinaya.com |

## 🏗️ Architecture (Single EC2 Instance)

```
AWS EC2 Instance
├── Nginx (Reverse Proxy)
│   ├── dev-crm.winvinaya.com → Backend :8000
│   ├── qa-crm.winvinaya.com → Backend :8001
│   └── crm.winvinaya.com → Backend :8002
│
├── Backend (FastAPI + PM2)
│   ├── Dev: port 8000, venv-dev
│   ├── QA: port 8001, venv-qa
│   └── Prod: port 8002, venv-prod
│
├── Frontend (React SPA)
│   ├── dist-dev/
│   ├── dist-qa/
│   └── dist-prod/
│
└── PostgreSQL
    ├── winvinaya_dev
    ├── winvinaya_qa
    └── winvinaya_prod
```

## 🔄 Deployment Flow

### Development
```bash
git checkout develop
# Make changes
git add .
git commit -m "feat: new feature"
git push origin develop
# ✅ Auto-deploys to dev-crm.winvinaya.com
```

### QA
```bash
git checkout qa
git merge develop
git push origin qa
# ✅ Runs tests → Auto-deploys to qa-crm.winvinaya.com
```

### Production
```bash
git checkout main
git merge qa
git push origin main
# 🔒 Requires approval in GitHub Actions
# ✅ After approval → Deploys to crm.winvinaya.com
```

## 📁 File Structure

```
winvinaya-crm/
├── .github/
│   └── workflows/
│       ├── deploy-dev.yml    # Dev deployment workflow
│       ├── deploy-qa.yml     # QA deployment workflow
│       └── deploy-prod.yml   # Prod deployment workflow
│
├── deploy/
│   ├── backend-deploy.sh     # Backend deployment script
│   ├── frontend-deploy.sh    # Frontend deployment script
│   ├── health-check.sh       # Health check script
│   ├── backup-db.sh          # Database backup script
│   └── rollback.sh           # Rollback script
│
├── nginx/
│   ├── dev.conf             # Dev Nginx config
│   ├── qa.conf              # QA Nginx config
│   └── prod.conf            # Prod Nginx config
│
├── docs/
│   ├── SERVER_SETUP.md      # EC2 server setup guide
│   └── DEPLOYMENT.md        # Deployment guide
│
├── backend/
│   ├── .env.dev.example     # Dev environment template
│   ├── .env.qa.example      # QA environment template
│   └── .env.prod.example    # Prod environment template
│
└── frontend/
    ├── .env.dev.example     # Frontend dev config
    ├── .env.qa.example      # Frontend QA config
    └── .env.prod.example    # Frontend prod config
```

## 🔧 Manual Deployment

If you need to deploy manually on the server:

```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm

# Deploy specific environment
./deploy/backend-deploy.sh {dev|qa|prod}
./deploy/frontend-deploy.sh {dev|qa|prod}
./deploy/health-check.sh {dev|qa|prod}
```

## 🔄 Rollback

### Automatic Rollback
Production deployments automatically rollback on health check failure.

### Manual Rollback
```bash
ssh ubuntu@YOUR_EC2_IP
cd /var/www/winvinaya-crm
./deploy/rollback.sh {dev|qa|prod}
```

## 📊 Monitoring

### Check PM2 Status
```bash
pm2 status
pm2 monit
```

### View Logs
```bash
# Backend logs
pm2 logs winvinaya-backend-dev
pm2 logs winvinaya-backend-qa
pm2 logs winvinaya-backend-prod

# Nginx logs
sudo tail -f /var/log/nginx/dev-crm-access.log
sudo tail -f /var/log/nginx/qa-crm-access.log
sudo tail -f /var/log/nginx/prod-crm-access.log
```

## 🛡️ Security Checklist

Before going live:
- [ ] Change all default passwords in `.env` files
- [ ] Update SECRET_KEY values
- [ ] Configure SSL certificates with Let's Encrypt
- [ ] Enable UFW firewall
- [ ] Set up automated database backups
- [ ] Configure PM2 startup on boot
- [ ] Review Nginx security headers
- [ ] Enable GitHub branch protection rules

## 📚 Documentation

- **Server Setup**: [docs/SERVER_SETUP.md](docs/SERVER_SETUP.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🆘 Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify secrets are configured
3. Ensure SSH connectivity to EC2

### Backend Not Running
```bash
pm2 logs winvinaya-backend-{env} --lines 100
pm2 restart winvinaya-backend-{env}
```

### Nginx 502 Error
```bash
# Check backend is running
curl http://localhost:800{0|1|2}/health

# Test Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

## 🤝 Support

For issues or questions, contact the DevOps team.

---

**🎉 Happy Deploying!**
