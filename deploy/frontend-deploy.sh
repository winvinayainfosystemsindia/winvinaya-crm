#!/bin/bash

# Frontend Deployment Script for WinVinaya CRM
# Usage: ./frontend-deploy.sh {dev|qa|prod}

set -e  # Exit on error

ENV=$1

if [ -z "$ENV" ]; then
    echo "Error: Environment not specified"
    echo "Usage: ./frontend-deploy.sh {dev|qa|prod}"
    exit 1
fi

# Environment-specific configurations
case $ENV in
    dev)
        DEPLOY_DIR="/var/www/winvinaya-crm/frontend/dist-dev"
        ENV_FILE=".env.dev"
        ;;
    qa)
        DEPLOY_DIR="/var/www/winvinaya-crm/frontend/dist-qa"
        ENV_FILE=".env.qa"
        ;;
    prod)
        DEPLOY_DIR="/var/www/winvinaya-crm/frontend/dist-prod"
        ENV_FILE=".env.prod"
        ;;
    *)
        echo "Error: Invalid environment. Use dev, qa, or prod"
        exit 1
        ;;
esac

echo "================================"
echo "Deploying Frontend - $ENV Environment"
echo "Deploy Directory: $DEPLOY_DIR"
echo "================================"

# Navigate to frontend directory
cd /var/www/winvinaya-crm/frontend

# Ensure 2GB swap is active on EC2 so Vite build (14,600+ modules) never hangs on RAM
if [ "$(swapon --show | wc -l)" -eq 0 ]; then
    echo "Enabling 2GB swapfile for Vite build..."
    if [ ! -f /swapfile ]; then
        sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
    fi
    sudo swapon /swapfile || true
fi

# Install/update dependencies
echo "Installing dependencies..."
npm install --prefer-offline --no-audit

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found!"
    exit 1
fi

# Copy environment file for build
echo "Using environment file: $ENV_FILE"
cp $ENV_FILE .env

# Build application with explicit Node memory ceiling
echo "Building application..."
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# Create deploy directory if it doesn't exist
mkdir -p $DEPLOY_DIR

# Backup existing deployment
if [ -d "$DEPLOY_DIR/assets" ]; then
    echo "Backing up existing deployment..."
    rm -rf ${DEPLOY_DIR}.backup
    cp -r $DEPLOY_DIR ${DEPLOY_DIR}.backup
fi

# Clear old deployment
echo "Clearing old deployment..."
rm -rf $DEPLOY_DIR/*

# Copy new build
echo "Copying new build..."
cp -r dist/* $DEPLOY_DIR/

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 $DEPLOY_DIR

# Reload Nginx
echo "Updating and reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "================================"
echo "✅ Frontend deployed successfully!"
echo "Location: $DEPLOY_DIR"
echo "================================"

# Display directory contents
ls -lah $DEPLOY_DIR
