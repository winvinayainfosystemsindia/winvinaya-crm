#!/bin/bash

# WinVinaya CRM - Health Check & Troubleshooting Script
# Run this to check the status of all environments

echo "========================================="
echo "WinVinaya CRM - System Health Check"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✓${NC} $1 is running"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT running"
        return 1
    fi
}

# Function to check if a port is listening
check_port() {
    if sudo lsof -i :$1 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Port $1 is open"
        return 0
    else
        echo -e "${RED}✗${NC} Port $1 is NOT listening"
        return 1
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    if curl -s -o /dev/null -w "%{http_code}" $1 | grep -q "200"; then
        echo -e "${GREEN}✓${NC} $1 is responding"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT responding"
        return 1
    fi
}

echo "1. System Services"
echo "-------------------"
check_service postgresql
check_service nginx
check_service pm2-ubuntu || echo -e "${YELLOW}⚠${NC} PM2 startup not configured"
echo ""

echo "2. Backend Ports"
echo "-------------------"
check_port 8000 && echo "   DEV backend (8000)" || echo "   DEV backend (8000)"
check_port 8001 && echo "   QA backend (8001)" || echo "   QA backend (8001)"
check_port 8002 && echo "   PROD backend (8002)" || echo "   PROD backend (8002)"
echo ""

echo "3. PM2 Processes"
echo "-------------------"
pm2 list
echo ""

echo "4. Backend Health Endpoints"
echo "-----------------------------"
echo "Testing local backends..."
check_endpoint "http://localhost:8000/health" && echo "   DEV" || echo "   DEV"
check_endpoint "http://localhost:8001/health" && echo "   QA" || echo "   QA"
check_endpoint "http://localhost:8002/health" && echo "   PROD" || echo "   PROD"
echo ""

echo "5. Database Connections"
echo "------------------------"
# Test database connections
for db in winvinaya_dev winvinaya_qa winvinaya_prod; do
    if PGPASSWORD=winvinaya@12345 psql -U winvinaya_user -d $db -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $db is accessible"
    else
        echo -e "${RED}✗${NC} $db connection failed"
    fi
done
echo ""

echo "6. Nginx Configuration"
echo "-----------------------"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓${NC} Nginx configuration is valid"
else
    echo -e "${RED}✗${NC} Nginx configuration has errors"
    sudo nginx -t
fi
echo ""

echo "7. Frontend Builds"
echo "-------------------"
for env in dev qa prod; do
    dir="/var/www/winvinaya-crm/frontend/dist-$env"
    if [ -d "$dir" ] && [ -f "$dir/index.html" ]; then
        echo -e "${GREEN}✓${NC} $env frontend exists at $dir"
    else
        echo -e "${RED}✗${NC} $env frontend NOT found at $dir"
    fi
done
echo ""

echo "8. SSL Certificates"
echo "--------------------"
if command -v certbot &> /dev/null; then
    sudo certbot certificates 2>/dev/null | grep -A 2 "Certificate Name" || echo "No SSL certificates found"
else
    echo -e "${YELLOW}⚠${NC} Certbot not installed"
fi
echo ""

echo "9. Disk Space"
echo "--------------"
df -h / | tail -1 | awk '{print "Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

echo "10. Memory Usage"
echo "-----------------"
free -h | grep "Mem:" | awk '{print "Used: " $3 " / " $2}'
echo ""

echo "11. Recent PM2 Errors (last 20 lines)"
echo "---------------------------------------"
pm2 logs --err --lines 20 --nostream
echo ""

echo "12. Recent Nginx Errors (last 10 lines)"
echo "-----------------------------------------"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No recent errors"
echo ""

echo "========================================="
echo "Health Check Complete"
echo "========================================="
echo ""
echo "For detailed logs, use:"
echo "  pm2 logs [process-name]"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  sudo journalctl -u nginx -f"
echo ""
