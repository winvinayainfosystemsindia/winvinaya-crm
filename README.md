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

## 🛠️ Local Development

To run the project locally, please refer to the specific `README.md` files in each directory:

1.  **Backend Setup**: Go to [backend/README.md](backend/README.md)
2.  **Frontend Setup**: Go to [frontend/README.md](frontend/README.md)


<!-- icacls.exe winvinaya-crm-server.pem  /reset
whoami
icacls.exe winvinaya-crm-server.pem  /grant:r dharanidaran\daran:(R)
icacls.exe winvinaya-crm-server.pem  /inheritance:r -->