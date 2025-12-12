# WinVinaya CRM Deployment Checklist

Use this checklist to track your deployment progress.

## Prerequisites ✅

- [x] EC2 instance created (Ubuntu 22.04)
- [x] Security groups configured (ports 22, 80, 443)
- [x] SSH access working
- [x] Domain/subdomain DNS configured:
  - [ ] dev-crm.winvinaya.com → EC2 IP
  - [ ] qa-crm.winvinaya.com → EC2 IP
  - [ ] crm.winvinaya.com → EC2 IP

## Initial Server Setup ✅

- [x] System updated
- [x] Python 3.11 installed
- [x] Node.js 20 installed
- [x] PostgreSQL installed
- [x] Nginx installed
- [x] PM2 installed
- [x] Git installed
- [x] Repository cloned to `/var/www/winvinaya-crm`

## Database Setup ✅

- [x] PostgreSQL databases created:
  - [x] winvinaya_dev
  - [x] winvinaya_qa
  - [x] winvinaya_prod
- [x] Database user created (winvinaya_user)
- [ ] Database permissions granted (Run the script below)

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

## Environment Configuration

### Backend Environment Files
- [ ] Create `.env.dev` from example
- [ ] Create `.env.qa` from example  
- [ ] Create `.env.prod` from example
- [ ] Update SECRET_KEY in all files (use `openssl rand -hex 32`)
- [ ] Update database passwords
- [ ] Update CORS origins with your domains
- [ ] Update admin passwords

### Frontend Environment Files
- [ ] Create `.env.dev` for frontend
- [ ] Create `.env.qa` for frontend
- [ ] Create `.env.prod` for frontend

## Backend Deployment

- [ ] Make deploy scripts executable
  ```bash
  cd /var/www/winvinaya-crm/deploy
  chmod +x *.sh
  ```

- [ ] Deploy Development Backend
  ```bash
  ./backend-deploy.sh dev
  ```

- [ ] Deploy QA Backend
  ```bash
  ./backend-deploy.sh qa
  ```

- [ ] Deploy Production Backend
  ```bash
  ./backend-deploy.sh prod
  ```

- [ ] Verify all backends running
  ```bash
  pm2 list
  curl http://localhost:8000/health
  curl http://localhost:8001/health
  curl http://localhost:8002/health
  ```

## Frontend Deployment

- [ ] Build Development Frontend
  ```bash
  cd /var/www/winvinaya-crm/frontend
  npm ci
  cp .env.dev .env
  npm run build
  sudo mkdir -p dist-dev
  sudo cp -r dist/* dist-dev/
  ```

- [ ] Build QA Frontend
  ```bash
  cp .env.qa .env
  npm run build
  sudo mkdir -p dist-qa
  sudo cp -r dist/* dist-qa/
  ```

- [ ] Build Production Frontend
  ```bash
  cp .env.prod .env
  npm run build
  sudo mkdir -p dist-prod
  sudo cp -r dist/* dist-prod/
  ```

- [ ] Set proper permissions
  ```bash
  sudo chown -R www-data:www-data dist-*
  sudo chmod -R 755 dist-*
  ```

## Nginx Configuration

- [ ] Create temporary HTTP configs
  ```bash
  cd /var/www/winvinaya-crm
  bash quick-deploy.sh  # OR follow manual steps in QUICK_REFERENCE.md
  ```

- [ ] Test Nginx configuration
  ```bash
  sudo nginx -t
  ```

- [ ] Reload Nginx
  ```bash
  sudo systemctl reload nginx
  ```

- [ ] Test HTTP access (if DNS is ready)
  ```bash
  curl http://dev-crm.winvinaya.com
  curl http://qa-crm.winvinaya.com
  curl http://crm.winvinaya.com
  ```

## SSL/HTTPS Setup

- [ ] Verify DNS is pointing to EC2 IP
  ```bash
  nslookup dev-crm.winvinaya.com
  nslookup qa-crm.winvinaya.com
  nslookup crm.winvinaya.com
  ```

- [ ] Install Certbot
  ```bash
  sudo apt install certbot python3-certbot-nginx -y
  ```

- [ ] Get SSL certificate for Development
  ```bash
  sudo certbot --nginx -d dev-crm.winvinaya.com
  ```

- [ ] Get SSL certificate for QA
  ```bash
  sudo certbot --nginx -d qa-crm.winvinaya.com
  ```

- [ ] Get SSL certificate for Production
  ```bash
  sudo certbot --nginx -d crm.winvinaya.com -d www.crm.winvinaya.com
  ```

- [ ] Replace with full HTTPS Nginx configs
  ```bash
  cd /var/www/winvinaya-crm/deploy
  sudo cp nginx-dev.conf /etc/nginx/sites-available/dev-crm.winvinaya.com
  sudo cp nginx-qa.conf /etc/nginx/sites-available/qa-crm.winvinaya.com
  sudo cp nginx-prod.conf /etc/nginx/sites-available/crm.winvinaya.com
  sudo rm /etc/nginx/sites-enabled/*-temp
  sudo ln -sf /etc/nginx/sites-available/dev-crm.winvinaya.com /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/qa-crm.winvinaya.com /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/crm.winvinaya.com /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

- [ ] Test SSL auto-renewal
  ```bash
  sudo certbot renew --dry-run
  ```

## System Configuration

- [ ] Configure PM2 startup
  ```bash
  pm2 save
  pm2 startup
  # Run the command it outputs
  ```

- [ ] Configure firewall
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
  sudo ufw status
  ```

## Verification & Testing

- [ ] Run health check script
  ```bash
  cd /var/www/winvinaya-crm
  bash health-check.sh
  ```

- [ ] Test all environments via HTTPS:
  - [ ] https://dev-crm.winvinaya.com
  - [ ] https://qa-crm.winvinaya.com
  - [ ] https://crm.winvinaya.com

- [ ] Test API endpoints:
  - [ ] https://dev-crm.winvinaya.com/api/health
  - [ ] https://qa-crm.winvinaya.com/api/health
  - [ ] https://crm.winvinaya.com/api/health

- [ ] Test admin login on all environments

- [ ] Verify PM2 processes
  ```bash
  pm2 list
  pm2 logs --lines 50
  ```

## Post-Deployment

- [ ] Document server credentials securely
- [ ] Set up monitoring (optional)
- [ ] Configure backup schedule
  ```bash
  # Add to crontab for daily backups at 2 AM
  0 2 * * * /var/www/winvinaya-crm/deploy/backup-db.sh dev
  0 2 * * * /var/www/winvinaya-crm/deploy/backup-db.sh qa
  0 2 * * * /var/www/winvinaya-crm/deploy/backup-db.sh prod
  ```

- [ ] Test deployment scripts for future updates
- [ ] Update README.md with deployment information
- [ ] Share access URLs with team

## Troubleshooting Resources

If you encounter issues:

1. **Check health status:**
   ```bash
   bash health-check.sh
   ```

2. **View logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Refer to documentation:**
   - See `DEPLOYMENT_GUIDE.md` for detailed instructions
   - See `QUICK_REFERENCE.md` for common commands
   - See `doc.txt` for initial setup notes

## Success Criteria

Your deployment is successful when:

- ✅ All 3 PM2 processes are running (dev, qa, prod)
- ✅ All 3 environments are accessible via HTTPS
- ✅ All API health checks return 200 OK
- ✅ PostgreSQL databases are connected
- ✅ SSL certificates are valid
- ✅ Can login to admin panel on all environments
- ✅ PM2 is configured to auto-start on boot
- ✅ Firewall is configured and active

---

## Quick Commands

**Run everything automatically:**
```bash
cd /var/www/winvinaya-crm
bash quick-deploy.sh
```

**Check system health:**
```bash
bash health-check.sh
```

**Restart everything:**
```bash
pm2 restart all
sudo systemctl restart nginx
```

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
