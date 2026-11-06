# LedgerLine Production Deployment Guide (DEPLOYMENT.md)

This document provides instructions for deploying LedgerLine using Docker Compose, configuring production environments, and following the enterprise fintech security checklist.

---

## 1. Quick Start With Docker Compose

The simplest way to run the entire stack (PostgreSQL 16, Spring Boot 3 Backend, React + Nginx Frontend) is with Docker Compose:

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

## 2. Environment Configuration

The backend and frontend are configurable via standard environment variables:

| Variable | Description | Default (Local / Dev) | Production Recommendation |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/ledgerline` | Primary managed PostgreSQL cluster |
| `SPRING_DATASOURCE_USERNAME` | DB username | `postgres` | Least-privileged app user |
| `SPRING_DATASOURCE_PASSWORD` | DB password | `postgrespassword` | High-entropy vault secret |
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA256 | `404E6352...` | 64+ char cryptographically random key |
| `CORS_ALLOWED_ORIGINS` | Allowed browser origins | `http://localhost:5173,http://localhost` | Specific production domains |
| `SERVER_PORT` | HTTP port for backend service | `8080` | `8080` |

---

## 3. Production Security Checklist

Prior to deploying to production or connecting to real clearing rails:

- [ ] **Rotate JWT Secret:** Ensure `JWT_SECRET` is generated with `openssl rand -hex 32` and injected via AWS Secrets Manager, HashiCorp Vault, or GCP Secret Manager.
- [ ] **TLS / HTTPS Termination:** Enforce TLS 1.3 at the reverse proxy (Nginx / Cloudflare / AWS ALB) with HSTS headers.
- [ ] **Database Credentials:** Restrict application database user permissions to DML (`SELECT`, `INSERT`, `UPDATE`). Deny DDL drop permissions on triggers.
- [ ] **Firewall & Network Isolation:** Ensure PostgreSQL port `5432` is private and accessible only from backend container subnets.
- [ ] **Rate Limiting:** Enable rate limiting at the ingress proxy to mitigate brute-force authentication attacks on `/api/v1/auth/login`.
- [ ] **Immutable Audit Log Shipping:** Configure syslog or Fluentbit to stream `audit_events` and `failed_transaction_attempts` to write-once-read-many (WORM) storage.
