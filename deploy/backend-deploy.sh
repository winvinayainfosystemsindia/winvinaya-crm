#!/bin/bash

# Backend Deployment Script for WinVinaya CRM
# Usage: ./backend-deploy.sh {dev|qa|prod}

set -e  # Exit on error

ENV=$1

if [ -z "$ENV" ]; then
    echo "Error: Environment not specified"
    echo "Usage: ./backend-deploy.sh {dev|qa|prod}"
    exit 1
fi

# Environment-specific configurations
case $ENV in
    dev)
        PORT=8000
        APP_NAME="winvinaya-backend-dev"
        ENV_FILE="/var/www/winvinaya-crm/backend/.env.dev"
        ;;
    qa)
        PORT=8001
        APP_NAME="winvinaya-backend-qa"
        ENV_FILE="/var/www/winvinaya-crm/backend/.env.qa"
        ;;
    prod)
        PORT=8002
        APP_NAME="winvinaya-backend-prod"
        ENV_FILE="/var/www/winvinaya-crm/backend/.env.prod"
        ;;
    *)
        echo "Error: Invalid environment. Use dev, qa, or prod"
        exit 1
        ;;
esac

echo "================================"
echo "Deploying Backend - $ENV Environment"
echo "Port: $PORT"
echo "================================"

# Navigate to backend directory
cd /var/www/winvinaya-crm/backend

# Stop existing PM2 process
echo "Stopping existing backend process..."
pm2 stop $APP_NAME || true
pm2 delete $APP_NAME || true

# Create virtual environment if it doesn't exist
if [ ! -d "venv-$ENV" ]; then
    echo "Creating virtual environment..."
    python3.11 -m venv venv-$ENV
fi

# Activate virtual environment
source venv-$ENV/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found!"
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
set -a
source $ENV_FILE
set +a
alembic upgrade head

# Start application with PM2
echo "Starting backend with PM2..."
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port $PORT --env-file $ENV_FILE" \
    --name $APP_NAME \
    --interpreter venv-$ENV/bin/python

# Save PM2 configuration
pm2 save

echo "================================"
echo "✅ Backend deployed successfully!"
echo "Process: $APP_NAME"
echo "Port: $PORT"
echo "================================"

# Display status
pm2 status $APP_NAME
