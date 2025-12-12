# 🚀 WinVinaya CRM - Deployment Resources Summary

## What Has Been Created

I've created a complete deployment solution for your WinVinaya CRM application with three environments (dev, qa, prod) on a single EC2 instance. Here's what's available:

### 📚 Documentation Files

1. **DEPLOYMENT_GUIDE.md** (Most Important!)
   - Complete step-by-step guide with detailed instructions
   - Covers everything from environment setup to SSL configuration
   - Includes troubleshooting section
   - ~500 lines of comprehensive documentation

2. **DEPLOYMENT_CHECKLIST.md**
   - Interactive checklist to track your progress
   - Checkboxes for each step
   - Quick reference for what's completed vs. pending
   - Great for ensuring nothing is missed

3. **QUICK_REFERENCE.md**
   - Quick command reference card
   - Common operations and commands
   - Verification commands
   - Troubleshooting snippets
   - Perfect for daily operations

4. **README.md** (Updated)
   - Added deployment section
   - Links to all deployment resources
   - Environment overview table

### 🔧 Automation Scripts

1. **quick-deploy.sh**
   - Automated deployment for all three environments
   - Handles database permissions, backend deployment, frontend builds
   - Configures Nginx automatically
   - One command to deploy everything!

2. **health-check.sh**
   - Comprehensive system health check
   - Checks all services, ports, databases
   - Shows PM2 status and logs
   - Color-coded output for easy reading

### 📁 Existing Scripts (Already in deploy/ folder)

- `backend-deploy.sh` - Deploy specific backend environment
- `frontend-deploy.sh` - Deploy specific frontend environment
- `nginx-dev.conf` - Nginx config for dev environment
- `nginx-qa.conf` - Nginx config for qa environment
- `nginx-prod.conf` - Nginx config for prod environment
- `backup-db.sh` - Database backup script
- `rollback.sh` - Rollback deployment
- `health-check.sh` - Service health checks

---

## 🎯 What You Need to Do Now

Based on your `doc.txt`, you've already completed Steps 1-5. Here's what remains:

### Option 1: Automated Deployment (Recommended)

1. **SSH into your EC2 server:**
   ```bash
   ssh -i "winvinaya-crm-server.pem" ubuntu@ec2-3-110-165-116.ap-south-1.compute.amazonaws.com
   ```

2. **Pull the latest code** (to get the new deployment scripts):
   ```bash
   cd /var/www/winvinaya-crm
   git pull origin develop  # or main, depending on your branch
   ```

3. **Run the automated deployment:**
   ```bash
   bash quick-deploy.sh
   ```
   
   This will:
   - Set database permissions
   - Create environment files (you'll need to edit them)
   - Deploy all three backends (dev port 8000, qa port 8001, prod port 8002)
   - Build and deploy all three frontends
   - Configure Nginx
   - Set up PM2 auto-start
   - Configure firewall

4. **Edit the environment files** (if the script prompts):
   ```bash
   nano /var/www/winvinaya-crm/backend/.env.dev
   nano /var/www/winvinaya-crm/backend/.env.qa
   nano /var/www/winvinaya-crm/backend/.env.prod
   ```
   
   Update:
   - SECRET_KEY (generate with: `openssl rand -hex 32`)
   - Admin passwords
   - Any other environment-specific settings

5. **Set up SSL certificates** (after DNS is configured):
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d dev-crm.winvinaya.com
   sudo certbot --nginx -d qa-crm.winvinaya.com
   sudo certbot --nginx -d crm.winvinaya.com
   ```

6. **Verify deployment:**
   ```bash
   bash health-check.sh
   ```

### Option 2: Manual Step-by-Step

Follow the **DEPLOYMENT_GUIDE.md** step by step. Use the **DEPLOYMENT_CHECKLIST.md** to track your progress.

---

## 🔍 What the Error Might Be

You mentioned an error occurred. Common issues at this stage:

1. **Database Permission Error**
   - PostgreSQL 15+ requires explicit schema permissions
   - Fixed by running the GRANT commands in the scripts

2. **Port Already in Use**
   - Solution: `pm2 delete all` then redeploy

3. **Environment File Missing**
   - Solution: Copy from .example files and edit

4. **Python Package Installation Error**
   - Solution: Make sure you're using Python 3.11
   - Check with: `python3.11 --version`

To see what error you got specifically:
```bash
# Check PM2 logs
pm2 logs --lines 50

# Check Nginx logs
sudo tail -50 /var/log/nginx/error.log

# Check if backend is running
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

---

## 📊 Architecture Overview

After deployment, you'll have:

```
EC2 Instance (Single Server)
├── PostgreSQL (3 databases)
│   ├── winvinaya_dev
│   ├── winvinaya_qa
│   └── winvinaya_prod
│
├── Backend (3 PM2 processes)
│   ├── winvinaya-backend-dev (port 8000)
│   ├── winvinaya-backend-qa (port 8001)
│   └── winvinaya-backend-prod (port 8002)
│
├── Frontend (3 build directories)
│   ├── /var/www/winvinaya-crm/frontend/dist-dev
│   ├── /var/www/winvinaya-crm/frontend/dist-qa
│   └── /var/www/winvinaya-crm/frontend/dist-prod
│
└── Nginx (3 server blocks with SSL)
    ├── dev-crm.winvinaya.com → port 8000 + dist-dev
    ├── qa-crm.winvinaya.com → port 8001 + dist-qa
    └── crm.winvinaya.com → port 8002 + dist-prod
```

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ All 3 PM2 processes are running
✅ All 3 environments accessible via HTTPS
✅ All API health checks return 200 OK
✅ Can login to admin panel on all environments
✅ SSL certificates are installed and valid
✅ PM2 auto-starts on server reboot

---

## 🆘 Getting Help

If you encounter issues:

1. **Run health check:**
   ```bash
   bash health-check.sh
   ```

2. **Check the logs:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Refer to documentation:**
   - DEPLOYMENT_GUIDE.md - Step-by-step instructions
   - QUICK_REFERENCE.md - Common commands
   - DEPLOYMENT_CHECKLIST.md - Track progress

4. **Common fixes:**
   - Backend won't start: Check `.env` files exist and are valid
   - Database error: Run the GRANT permissions script
   - Nginx error: Run `sudo nginx -t` to see the error
   - Port in use: `pm2 delete all` then redeploy

---

## 📞 Next Steps

1. [ ] Pull the latest code with deployment scripts
2. [ ] Run `bash quick-deploy.sh` OR follow DEPLOYMENT_GUIDE.md manually
3. [ ] Configure DNS to point to your EC2 IP
4. [ ] Install SSL certificates
5. [ ] Test all three environments
6. [ ] Set up automated backups
7. [ ] Configure monitoring (optional)

---

## 📝 Notes

- All scripts are in the root of the repository
- Deploy scripts are in the `deploy/` folder
- Environment files should be in `backend/` folder (.env.dev, .env.qa, .env.prod)
- Frontend builds go to `frontend/dist-{env}` folders
- Logs are at `/var/log/nginx/` and via `pm2 logs`

---

**Good luck with your deployment! 🚀**

All the resources you need are now in your repository. Start with either the automated script or follow the detailed guide.
