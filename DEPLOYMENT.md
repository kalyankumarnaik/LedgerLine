# BalanceVault (formerly LedgerLine) Production Deployment Guide (DEPLOYMENT.md)

This document provides instructions for deploying BalanceVault to **Vercel**, running with **Docker Compose**, configuring production cloud environments, and following the enterprise fintech security checklist.

---

## 1. Deploying the Frontend to Vercel

BalanceVault is fully configured for seamless end-to-end deployment on [Vercel](https://vercel.com). Both repository root deployment and frontend subdirectory deployment are supported out-of-the-box.

### Option A: Import Directly from Git (Repository Root)
1. Push your changes to GitHub, GitLab, or Bitbucket.
2. In the **Vercel Dashboard**, click **Add New...** > **Project** and import your repository.
3. Leave **Root Directory** as `./` (default).
4. Vercel will automatically detect `vercel.json` and `package.json` in root:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/dist`
5. Click **Deploy**.

### Option B: Deploy with Root Directory Set to `frontend`
1. When importing in Vercel, edit **Root Directory** to point to `frontend`.
2. Vercel detects Vite automatically:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Click **Deploy**.

### Environment Variables on Vercel
In your Vercel Project Settings > **Environment Variables**, you can configure:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Optional remote Spring Boot backend URL | `https://api.balancevault.com` |
| `VITE_API_BASE_URL` | Full base API path (alternative to `VITE_API_URL`) | `https://api.balancevault.com/api/v1` |

> **Note on End-to-End Execution on Vercel:**
> - If `VITE_API_URL` is configured and points to an active backend, all calls route directly to your live Spring Boot + PostgreSQL cluster.
> - If no backend is configured or if the backend is temporarily unreachable, the frontend automatically falls back to the **in-memory double-entry Core Engine** with persistent `localStorage`. Every icon, button, transfer, deposit, withdrawal, limit adjustment, audit verification, and receipt functions 100% end-to-end!

---

## 2. Deploying the Backend to Render

Render is ideal for hosting the Spring Boot 3 + PostgreSQL backend using our pre-configured Docker image.

### Step 1: Create a PostgreSQL Database on Render
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and choose **PostgreSQL**.
3. Fill in:
   - **Name:** `balancevault-postgres`
   - **Database:** `ledgerline`
   - **User:** `postgres`
   - **Region:** Choose the region closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **Plan:** Free
4. Click **Create Database**.
5. Once created, keep the database page open. You will need:
   - **Host** (e.g. `dpg-xxxxxx.oregon-postgres.render.com`)
   - **Database** (`ledgerline`)
   - **Username** (`postgres`)
   - **Password** (click to reveal)

### Step 2: Deploy the Backend Web Service on Render
1. In Render, click **New +** and select **Web Service**.
2. Connect your Git repository containing BalanceVault.
3. Configure the service settings:
   - **Name:** `balancevault-backend`
   - **Region:** *Select the same region as your database* (e.g. Oregon).
   - **Language / Runtime:** **Docker**
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `./`)
   - **Dockerfile Path:** `Dockerfile` (Render detects the root `Dockerfile` automatically)
   - **Instance Type:** Free

4. Scroll down to **Environment Variables** and add the following keys:

| Key | Value / Instructions |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<RENDER_DB_HOST>:5432/ledgerline?sslmode=require` *(Replace `<RENDER_DB_HOST>` with your Render DB Host)* |
| `SPRING_DATASOURCE_USERNAME` | `postgres` (or your Render DB username) |
| `SPRING_DATASOURCE_PASSWORD` | *(Paste your Render DB password)* |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173,http://localhost:3000` |
| `SERVER_PORT` | `8080` |

5. Under **Advanced**:
   - **Health Check Path:** `/health/liveness`

6. Click **Create Web Service**.
   Render will build the multi-stage Docker container (compiling with Java 21 & Maven) and start Spring Boot with Flyway applying all 4 database migrations automatically.

### Step 3: Connect Frontend (Vercel) to Render Backend
Once Render finishes deploying, copy your live backend URL (e.g., `https://balancevault-backend.onrender.com`):
1. Go to your **Vercel Project Dashboard** -> **Settings** -> **Environment Variables**.
2. Add or update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://balancevault-backend.onrender.com`
3. Click **Redeploy** on Vercel so the frontend picks up the live backend API.

---

## 3. Quick Start With Docker Compose

To run the full native stack (PostgreSQL 16, Redis 7, Spring Boot 3 Backend, React + Nginx Frontend) in Docker:

```bash
# Clone the repository
git clone https://github.com/organization/BalanceVault.git
cd BalanceVault

# Start all services in the background
docker compose up --build -d

# Check running container health
docker compose ps
```

### Deployed Endpoints:
- **Frontend Application:** `http://localhost:80`
- **Backend REST API:** `http://localhost:8080`
- **OpenAPI / Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Liveness Probe:** `http://localhost:8080/health/liveness`
- **Readiness Probe:** `http://localhost:8080/health/readiness`
- **Actuator Health Checks:** `http://localhost:8080/actuator/health`

---

## 3. Environment Configuration

The backend and frontend are configurable via standard environment variables:

| Variable | Description | Default (Local / Dev) | Production Recommendation |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/ledgerline` | Primary managed PostgreSQL cluster |
| `SPRING_DATASOURCE_USERNAME` | DB username | `postgres` | Least-privileged app user (`bv_app`) |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `postgrespassword` | High-entropy vault secret |
| `SPRING_DATA_REDIS_HOST` | Redis host for rate limiting | `localhost` | Redis Cluster / ElastiCache |
| `SPRING_DATA_REDIS_PORT` | Redis port | `6379` | `6379` |
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA256 | `404E6352...` | 64+ char cryptographically random key |
| `CORS_ALLOWED_ORIGINS` | Allowed browser origins | `http://localhost:5173,http://localhost` | Specific production domains / Vercel domain |
| `SERVER_PORT` | HTTP port for backend service | `8080` | `8080` |

---

## 4. Production Security Checklist

Prior to deploying to production or connecting to real clearing rails:

- [ ] **Rotate JWT Secret:** Ensure `JWT_SECRET` is generated with `openssl rand -hex 32` and injected via AWS Secrets Manager, HashiCorp Vault, or GCP Secret Manager.
- [ ] **TLS / HTTPS Termination:** Enforce TLS 1.3 at the reverse proxy (Vercel / Cloudflare / AWS ALB) with HSTS headers.
- [ ] **Database Credentials:** Restrict application database user permissions to DML (`SELECT`, `INSERT`, `UPDATE`). Deny DDL drop permissions on triggers.
- [ ] **Firewall & Network Isolation:** Ensure PostgreSQL port `5432` is private and accessible only from backend container subnets.
- [ ] **Rate Limiting:** Enable rate limiting at the ingress proxy to mitigate brute-force authentication attacks on `/api/v1/auth/login`.
- [ ] **Immutable Audit Log Shipping:** Configure syslog or Fluentbit to stream `audit_events` and `failed_transaction_attempts` to write-once-read-many (WORM) storage.
