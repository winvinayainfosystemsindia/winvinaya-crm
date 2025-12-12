# WinVinaya CRM

Welcome to the WinVinaya CRM repository. This project is a full-stack application composed of a FastAPI backend and a React/TypeScript frontend.

## 📂 Project Structure

- **[backend/](backend/README.md)**: Python FastAPI application handling API requests, database interactions, and business logic.
- **[frontend/](frontend/README.md)**: React application (Vite + TypeScript + MUI) providing the user interface.
- **`.github/workflows/`**: CI/CD configuration files.

## 🚀 DevOps & CI/CD

This project uses [GitHub Actions](https://github.com/features/actions) for Continuous Integration and Continuous Deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

### The Pipeline Workflow

The pipeline triggers automatically on:
- Pushes to the `main` branch.
- Pull Requests targeting the `main` branch.

It consists of the following jobs:

#### 1. Backend CI (`backend-ci`)
- **Environment**: Ubuntu Latest
- **Services**: PostgreSQL (Service container)
- **Steps**:
    1. Check out the code.
    2. Set up Python 3.11.
    3. Install dependencies from `requirements.txt`.
    4. Run Unit Tests using `pytest`.

#### 2. Frontend CI (`frontend-ci`)
- **Environment**: Ubuntu Latest
- **Steps**:
    1. Check out the code.
    2. Set up Node.js 20.
    3. Install dependencies (`npm ci`).
    4. Lint the code (`npm run lint`).
    5. Build the production bundle (`npm run build`).

#### 3. Deployment (`deploy`)
- **Trigger**: Runs only on pushes to `main` AND if both CI jobs pass.
- **Current Status**: Placeholder.
- **Action Required**: You need to configure your specific deployment target (AWS, Docker Hub, DigitalOcean, etc.).

### 🔧 Setting Up Deployment

To fully automate deployment, follow these steps:

1.  **Container Registry (Docker Hub/GHCR)**:
    -   Uncomment the "Login to Docker Hub" and "Build and Push" steps in `.github/workflows/ci-cd.yml`.
    -   Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` to your GitHub Repository Secrets.

2.  **Server Deployment**:
    -   **Option A (SSH)**: Add a step to SSH into your server, `docker pull` the new images, and `docker-compose up -d`. You'll need to add `SSH_HOST`, `SSH_USER`, and `SSH_KEY` to secrets.
    -   **Option B (Cloud Provider)**: Use an AWS/Azure/GCP action to deploy the container to a managed service (e.g., AWS ECS, App Runner, Azure App Service).

## 🌐 Production Deployment

This project supports deployment to a single EC2 instance with three separate environments (Development, QA, Production). Each environment has its own database, backend process, and frontend build.

### 📚 Deployment Documentation

We provide comprehensive deployment documentation and automation scripts:

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide with detailed explanations
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Interactive checklist to track your deployment progress
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick command reference for common operations
- **[quick-deploy.sh](quick-deploy.sh)** - Automated deployment script for all three environments
- **[health-check.sh](health-check.sh)** - System health check and troubleshooting script

### ⚡ Quick Start Deployment

1. **Prerequisites:**
   - EC2 instance with Ubuntu 22.04
   - Python 3.11, Node.js 20, PostgreSQL, Nginx, and PM2 installed
   - Three PostgreSQL databases created (winvinaya_dev, winvinaya_qa, winvinaya_prod)
   - Repository cloned to `/var/www/winvinaya-crm`

2. **One-Command Deployment:**
   ```bash
   cd /var/www/winvinaya-crm
   bash quick-deploy.sh
   ```

3. **Set up SSL:**
   ```bash
   sudo certbot --nginx -d dev-crm.winvinaya.com
   sudo certbot --nginx -d qa-crm.winvinaya.com
   sudo certbot --nginx -d crm.winvinaya.com
   ```

### 🎯 Environment Overview

| Environment | Backend Port | Database | Domain |
|------------|-------------|----------|---------|
| Development | 8000 | winvinaya_dev | dev-crm.winvinaya.com |
| QA | 8001 | winvinaya_qa | qa-crm.winvinaya.com |
| Production | 8002 | winvinaya_prod | crm.winvinaya.com |

### 📊 Health Monitoring

Check system health at any time:
```bash
bash health-check.sh
```

View application logs:
```bash
pm2 logs
pm2 list
```

For detailed deployment instructions, troubleshooting, and best practices, see the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## 🛠️ Local Development

To run the project locally, please refer to the specific `README.md` files in each directory:

1.  **Backend Setup**: Go to [backend/README.md](backend/README.md)
2.  **Frontend Setup**: Go to [frontend/README.md](frontend/README.md)


<!-- icacls.exe winvinaya-crm-server.pem  /reset
whoami
icacls.exe winvinaya-crm-server.pem  /grant:r dharanidaran\daran:(R)
icacls.exe winvinaya-crm-server.pem  /inheritance:r -->