# WinVinaya CRM - AWS EC2 Server Setup Guide

## Prerequisites

### AWS Account Requirements
- AWS EC2 account with appropriate permissions
- SSH key pair generated and downloaded

### EC2 Instance Specifications
**Recommended Configuration:**
- **Instance Type**: t3.medium or t3.large
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 30GB SSD (General Purpose SSD gp3)
- **vCPUs**: 2-4
- **RAM**: 4-8 GB

## Step 1: Launch EC2 Instance

1. **Login to AWS Console** → Navigate to EC2
2. **Launch Instance**:
   - Name: `winvinaya-crm-server`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t3.medium (2 vCPU, 4 GB RAM)
   - Key pair: Select your SSH key or create new one
   - Storage: 30 GB gp3

3. **Configure Security Group**:
   ```
   SSH (22) - Your IP address only
   HTTP (80) - 0.0.0.0/0
   HTTPS (443) - 0.0.0.0/0
   ```

4. **Launch Instance** and note the Public IP address

## Step 2: Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Required Software

### Install Python 3.11
```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev -y
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
python3 --version  # Verify
```

### Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify
npm --version   # Verify
```

### Install PostgreSQL 15
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup  # Follow the instructions
```

### Install Git
```bash
sudo apt install git -y
git --version
```

## Step 4: Configure PostgreSQL

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create databases for each environment
CREATE DATABASE winvinaya_dev;
CREATE DATABASE winvinaya_qa;
CREATE DATABASE winvinaya_prod;

# Set password for postgres user
ALTER USER postgres WITH PASSWORD 'your_secure_password';

# Exit
\q
```

## Step 5: Clone Application Repository

```bash
# Create application directory
sudo mkdir -p /var/www/winvinaya-crm
sudo chown -R ubuntu:ubuntu /var/www/winvinaya-crm

# Clone repository
cd /var/www
git clone https://github.com/yourusername/winvinaya-crm.git
cd winvinaya-crm

# Create necessary directories
mkdir -p logs backups/db frontend/dist-dev frontend/dist-qa frontend/dist-prod
```

## Step 6: Setup Environment Variables

### Backend Environment Files
```bash
# Development
cd /var/www/winvinaya-crm/backend
cp .env.dev.example .env.dev
nano .env.dev  # Edit with actual values

# QA
cp .env.qa.example .env.qa
nano .env.qa  # Edit with actual values

# Production
cp .env.prod.example .env.prod
nano .env.prod  # Edit with actual values
```

### Frontend Environment Files
```bash
cd /var/www/winvinaya-crm/frontend
cp .env.dev.example .env.dev
cp .env.qa.example .env.qa
cp .env.prod.example .env.prod
```

## Step 7: Configure Nginx

```bash
# Copy Nginx configurations
sudo cp /var/www/winvinaya-crm/nginx/dev.conf /etc/nginx/sites-available/winvinaya-dev
sudo cp /var/www/winvinaya-crm/nginx/qa.conf /etc/nginx/sites-available/winvinaya-qa
sudo cp /var/www/winvinaya-crm/nginx/prod.conf /etc/nginx/sites-available/winvinaya-prod

# Enable sites
sudo ln -s /etc/nginx/sites-available/winvinaya-dev /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/winvinaya-qa /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/winvinaya-prod /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 8: Setup SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificates (do this AFTER DNS is configured)
sudo certbot --nginx -d dev-crm.winvinaya.com
sudo certbot --nginx -d qa-crm.winvinaya.com
sudo certbot --nginx -d crm.winvinaya.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

## Step 9: Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Step 10: Deploy Applications

### Deploy Development
```bash
cd /var/www/winvinaya-crm
git checkout develop
./deploy/backend-deploy.sh dev
./deploy/frontend-deploy.sh dev
```

### Deploy QA
```bash
git checkout qa
./deploy/backend-deploy.sh qa
./deploy/frontend-deploy.sh qa
```

### Deploy Production
```bash
git checkout main
./deploy/backend-deploy.sh prod
./deploy/frontend-deploy.sh prod
```

## Step 11: Setup GitHub Actions Secrets

In your GitHub repository settings → Secrets and variables → Actions, add:

```
EC2_HOST = Your EC2 Public IP
EC2_USER = ubuntu
SSH_PRIVATE_KEY = Contents of your private key file
```

## Step 12: DNS Configuration

Point your domains to EC2 instance:
```
dev-crm.winvinaya.com  → A record → EC2 Public IP
qa-crm.winvinaya.com   → A record → EC2 Public IP
crm.winvinaya.com      → A record → EC2 Public IP
```

## Verification

### Check Backend Services
```bash
pm2 status
pm2 logs winvinaya-backend-dev
pm2 logs winvinaya-backend-qa
pm2 logs winvinaya-backend-prod
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Test Endpoints
```bash
curl http://localhost:8000/health  # Dev
curl http://localhost:8001/health  # QA
curl http://localhost:8002/health  # Prod
```

## Monitoring & Maintenance

### View Logs
```bash
# Application logs
tail -f /var/www/winvinaya-crm/logs/*.log

# Nginx logs
sudo tail -f /var/log/nginx/dev-crm-access.log
sudo tail -f /var/log/nginx/qa-crm-access.log
sudo tail -f /var/log/nginx/prod-crm-access.log
```

### PM2 Monitoring
```bash
pm2 monit
pm2 list
pm2 info winvinaya-backend-prod
```

### Database Backups
```bash
# Manual backup
./deploy/backup-db.sh prod

# View backups
ls -lh /var/www/winvinaya-crm/backups/db/
```

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs winvinaya-backend-prod --lines 100

# Restart process
pm2 restart winvinaya-backend-prod
```

### Nginx Errors
```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -d winvinaya_prod
```

## Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Updated all SECRET_KEY values in .env files
- [ ] Configured firewall (UFW)
- [ ] SSL certificates installed
- [ ] SSH key-based authentication only
- [ ] Disabled root login
- [ ] Regular system updates scheduled
- [ ] Database backups automated
- [ ] PM2 startup configured

---

**🎉 Your WinVinaya CRM is now deployed on AWS EC2!**

Access your environments:
- Development: https://dev-crm.winvinaya.com
- QA: https://qa-crm.winvinaya.com
- Production: https://crm.winvinaya.com
