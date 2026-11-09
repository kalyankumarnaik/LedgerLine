# LedgerLine Production Deployment Guide (DEPLOYMENT.md)

This document provides instructions for deploying LedgerLine to **Vercel**, running with **Docker Compose**, configuring production cloud environments, and following the enterprise fintech security checklist.

---

## 1. Deploying the Frontend to Vercel

LedgerLine is fully configured for seamless end-to-end deployment on [Vercel](https://vercel.com). Both repository root deployment and frontend subdirectory deployment are supported out-of-the-box.

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
| `VITE_API_URL` | Optional remote Spring Boot backend URL | `https://api.ledgerline.com` |
| `VITE_API_BASE_URL` | Full base API path (alternative to `VITE_API_URL`) | `https://api.ledgerline.com/api/v1` |

> **Note on End-to-End Execution on Vercel:**
> - If `VITE_API_URL` is configured and points to an active backend, all calls route directly to your live Spring Boot + PostgreSQL cluster.
> - If no backend is configured or if the backend is temporarily unreachable, the frontend automatically falls back to the **in-memory double-entry Core Engine** with persistent `localStorage`. Every icon, button, transfer, deposit, withdrawal, limit adjustment, audit verification, and receipt functions 100% end-to-end!

---

## 2. Quick Start With Docker Compose

To run the full native stack (PostgreSQL 16, Spring Boot 3 Backend, React + Nginx Frontend) in Docker:

```bash
# Clone the repository
git clone https://github.com/organization/LedgerLine.git
cd LedgerLine

# Start all services in the background
docker-compose up --build -d

# Check running container health
docker-compose ps
```

### Deployed Endpoints:
- **Frontend Application:** `http://localhost:80`
- **Backend REST API:** `http://localhost:8080`
- **OpenAPI / Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Actuator Health Checks:** `http://localhost:8080/actuator/health`

---

## 3. Environment Configuration

The backend and frontend are configurable via standard environment variables:

| Variable | Description | Default (Local / Dev) | Production Recommendation |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/ledgerline` | Primary managed PostgreSQL cluster |
| `SPRING_DATASOURCE_USERNAME` | DB username | `postgres` | Least-privileged app user |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `postgrespassword` | High-entropy vault secret |
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
