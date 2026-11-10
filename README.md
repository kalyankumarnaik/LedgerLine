# BalanceVault (formerly LedgerLine)

> **Money movement with a ledger you can prove.**
> A secure account management platform with role-based access, user onboarding, and auditable account operations.

BalanceVault (originally LedgerLine) is a production-grade fintech ledger and money movement platform engineered for organizations that require provable financial correctness, immutable auditability, deterministic concurrency safety, and strict double-entry accounting invariants.

---

## 1. Core Architectural Guarantees & Features

1. **Zero Unexplained Money Movement:** All transfers produce balanced debits and credits ($\sum \text{Debits} - \sum \text{Credits} = 0$). External funding balances against an authorized central reserve clearing account (`SYS-CLEARING-INR-001`). Total money is strictly conserved.
2. **Deterministic Concurrency & Deadlock Prevention:** Account balance rows are locked via PostgreSQL `SELECT FOR UPDATE` in deterministic natural UUID order, eliminating circular deadlocks during simultaneous cross-account transfers.
3. **Strict Non-Negative Balances:** Overdrafts are prohibited by both service validation logic and PostgreSQL table constraints (`chk_account_balance_non_negative`).
4. **Idempotency & Replay Defense:** All financial writes enforce unique idempotency keys with SHA-256 payload fingerprinting and cached responses. Replays return the original transaction without repeating debit or credit postings.
5. **Database-Enforced Immutability:** PostgreSQL `BEFORE UPDATE` and `BEFORE DELETE` triggers reject any DML tampering on posted `ledger_entries` or `journal_entries`.
6. **Dual Balance Verification & Continuous Reconciliation:** Materialized balances are verified on demand against dynamically computed sums of immutable historical ledger entries.
7. **Complete Refused-Attempt Audit Trail:** Failed, unauthorized, or insufficient balance attempts are recorded in an isolated `failed_transaction_attempts` table with correlation IDs without altering ledger state.
8. **Role-Based Access Control (RBAC):** Strict separation of duties across Account Holders (clients), Administrators (approvals & onboarding), and Independent Auditors (strictly read-only zero-mutation oversight).
9. **Redis Rate Limiting:** Sliding-window token-bucket rate limiting (15 req/min on `/auth/`, 40 req/min on financial writes) with `X-RateLimit-*` and `Retry-After` headers.
10. **First-Administrator Bootstrap:** Secure idempotent script (`bootstrap-admin.ps1` / `scripts/bootstrap-admin.sh`) that initializes the root administrator without hardcoded cleartext credentials.
11. **Principle of Least Privilege Database Roles:** Discrete PostgreSQL roles (`bv_owner`, `bv_app`, `bv_auditor`, `bv_bootstrap_operator`).
12. **Deployment Health & Readiness Checks:** Kubernetes-ready `/health/liveness` and `/health/readiness` endpoints probing database and rate limiter states.

---

## 2. Technology Stack

### Backend
- **Language / Runtime:** Java 21 / 25 LTS
- **Framework:** Spring Boot 3.3.5
- **Security:** Spring Security 6 with stateless HMAC-SHA256 JWT, Rate Limiting Filter & Token Rotation
- **Persistence:** Spring Data JPA, Hibernate, PostgreSQL Driver
- **Migrations:** Flyway Database Migrations (`V1` to `V4`) + Prisma Schema representation (`prisma/schema.prisma`)
- **API Documentation:** SpringDoc OpenAPI 3 / Swagger UI
- **Testing:** JUnit 5, Mockito, Spring Boot Test, Testcontainers

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Deep Midnight Navy, Electric Violet, Emerald Green)
- **Routing:** React Router v6
- **Animations & Micro-Interactions:** Framer Motion (spring physics, layout transitions, modal backdrops)
- **Data Visualizations:** Recharts (Rolling Volume and Inflow/Outflow Charts)
- **Icons:** Lucide React

### Database & Infrastructure
- **Database:** PostgreSQL 16 / 18
- **Caching & Rate Limiting:** Redis 7
- **Containerization:** Multi-stage Dockerfiles, Docker Compose
- **Deployment:** Vercel (Frontend SPA with dual rewrites & standalone fallback engine) + Docker / JVM (Full stack)

---

## 3. Pre-Seeded Demonstration Roles & Credentials

For local testing and demonstration purposes, the database seed migration (`V3__seed_data.sql` and `bootstrap-admin.ps1`) provisions the following accounts:

| Role | Username | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@balancevault.com` | `Password@123!` | System statistics, user onboarding approvals, dual-control adjustment approvals |
| **Account Holder (1)** | `alex` | `alex.holder@ledgerline.com` | `Password@123!` | Personal banking, deposits, transfers, withdrawals, CSV statements |
| **Account Holder (2)** | `elena` | `elena.partner@ledgerline.com` | `Password@123!` | Corporate holder, counter-party for cross-account transfer demos |
| **Independent Auditor** | `sarah` | `sarah.auditor@ledgerline.com` | `Password@123!` | Strictly read-only ledger exploration and pass/fail integrity audits |

*Note: The Login screen includes one-click chips to automatically fill credentials for each role.*

---

## 4. How to Run BalanceVault

You can run BalanceVault natively on Windows/Linux or via Docker Compose.

### Step 1: Database Setup & Prisma Schemas
Generate Prisma schemas and verify database configurations:
```bash
# Generate Prisma Client & verify schema definitions
npm run db:generate

# Verify database migrations
npm run db:migrate
```

### Step 2: Bootstrap the First Administrator
Execute the secure administrator bootstrap script:
```powershell
# Windows PowerShell:
.\bootstrap-admin.ps1 -Email "admin@balancevault.com" -Username "admin"

# Or on Linux / macOS:
./scripts/bootstrap-admin.sh admin@balancevault.com admin
```

### Step 3: Start Services

#### Option A: Quick Launch Scripts (PowerShell)
```powershell
# In terminal 1 (Backend - Java 21+ / Spring Boot):
.\start-backend.ps1

# In terminal 2 (Frontend - Vite / React):
.\start-frontend.ps1
```

#### Option B: Full Stack with Docker Compose (PostgreSQL + Redis + Backend + Frontend)
```bash
docker compose up --build -d
docker compose ps
```
- **Frontend App:** [http://localhost](http://localhost) (or `http://localhost:5173` in dev mode)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Liveness Probe:** [http://localhost:8080/health/liveness](http://localhost:8080/health/liveness)
- **Readiness Probe:** [http://localhost:8080/health/readiness](http://localhost:8080/health/readiness)
- **Swagger UI API Docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 5. Deployment Health & Readiness

BalanceVault provides production-ready deployment health checks:
- **`GET /health/liveness`**: Returns `HTTP 200` with uptime and core service status.
- **`GET /health/readiness`**: Probes PostgreSQL connection latency (`SELECT 1`), Redis rate limiter readiness, and double-entry mathematical invariants.
- **`GET /api/v1/health`**: Returns JSON telemetry for frontend status widgets.

---

## 6. Principle of Least Privilege Database Roles

BalanceVault partitions PostgreSQL responsibilities into isolated roles (`V4__database_roles_separation.sql`):
- **`bv_owner`**: Schema owner with DDL privileges for migrations.
- **`bv_app`**: Operational application user with DML privileges (`SELECT`, `INSERT`, `UPDATE`). Triggers prohibit direct deletion on immutable tables.
- **`bv_auditor`**: Regulatory auditor with read-only `SELECT` access across all financial and audit tables.
- **`bv_bootstrap_operator`**: Permitted only to invoke the security-definer `bootstrap_admin_user()` function.

---

## 7. Deliverables & Documentation Index

- **Threat Modeling & Risk Analysis:** [`THREATS.md`](./THREATS.md) (23 attack scenarios and mitigations)
- **AI Development Log & Assumptions:** [`PROMPTS.md`](./PROMPTS.md) (12 detailed milestones)
- **API Reference & RBAC Matrix:** [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)
- **Deployment & Vercel Guide:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Architecture Specification:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Database Schema & Invariants:** [`DATABASE.md`](./DATABASE.md)
- **Prisma Schema Definition:** [`prisma/schema.prisma`](./prisma/schema.prisma)
