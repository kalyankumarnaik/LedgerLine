# LedgerLine

> **Every movement accounted for. Every balance proven.**

LedgerLine is a modern, production-grade fintech ledger and money movement platform engineered for organizations that require provable financial correctness, immutable auditability, deterministic concurrency safety, and strict double-entry accounting invariants.

---

## 1. Core Architectural Guarantees

1. **Zero Unexplained Money Movement:** All money transfers comply with double-entry accounting ($\sum \text{Debits} - \sum \text{Credits} = 0$). External deposits and disbursements balance against a central reserve clearing account (`SYS-CLEARING-INR-001`).
2. **Deterministic Concurrency & Deadlock Prevention:** Account balance rows are locked via PostgreSQL `SELECT FOR UPDATE` in deterministic UUID natural order, eliminating circular deadlocks during simultaneous cross-account transfers.
3. **Strict Non-Negative Balances:** Overdrafts are prohibited by both service validation logic and PostgreSQL table constraints (`chk_account_balance_non_negative`).
4. **Idempotency & Replay Defense:** All financial writes enforce unique idempotency keys with SHA-256 payload fingerprinting and cached responses. Replays return the original transaction without repeating debit or credit postings.
5. **Database-Enforced Immutability:** PostgreSQL `BEFORE UPDATE` and `BEFORE DELETE` triggers reject any DML tampering on posted `ledger_entries` or `journal_entries`.
6. **Dual Balance Verification & Continuous Reconciliation:** Materialized balances are verified on demand against dynamically computed sums of immutable historical ledger entries.
7. **Complete Refused-Attempt Audit Trail:** Failed, unauthorized, or insufficient balance attempts are recorded in an isolated `failed_transaction_attempts` table with correlation IDs without altering ledger state.

---

## 2. Technology Stack

### Backend
- **Language / Runtime:** Java 21 / 25 LTS
- **Framework:** Spring Boot 3.3.5
- **Security:** Spring Security 6 with stateless HMAC-SHA256 JWT & Token Rotation
- **Persistence:** Spring Data JPA, Hibernate, PostgreSQL Driver
- **Migrations:** Flyway Database Migrations
- **API Documentation:** SpringDoc OpenAPI 3 / Swagger UI
- **Testing:** JUnit 5, Mockito, Spring Boot Test, Testcontainers

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Deep Midnight Navy, Electric Violet, Emerald Green)
- **State & Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Animations & Icons:** Framer Motion, Lucide React
- **Data Visualizations:** Recharts (Volume and Inflow/Outflow Charts)

### Database & Infrastructure
- **Database:** PostgreSQL 16 / 18
- **Containerization:** Docker multi-stage images, Docker Compose
- **CI/CD:** GitHub Actions workflow with test matrix and Docker build validation

---

## 3. Pre-Seeded Demonstration Roles & Credentials

For local testing and demonstration purposes, the database seed migration (`V3__seed_data.sql` and `DataInitializer.java`) provisions four accounts:

| Role | Username | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@ledgerline.com` | `Password@123!` | System statistics, user locks, account freeze, adjustment approvals |
| **Account Holder (1)** | `alex` | `alex.holder@ledgerline.com` | `Password@123!` | Personal banking, deposits, transfers, withdrawals, CSV statements |
| **Account Holder (2)** | `elena` | `elena.partner@ledgerline.com` | `Password@123!` | Corporate holder, counter-party for cross-account transfer demos |
| **Independent Auditor** | `sarah` | `sarah.auditor@ledgerline.com` | `Password@123!` | Strictly read-only ledger exploration and pass/fail integrity audits |

*Note: The Login screen includes one-click buttons to automatically fill credentials for each role.*

---

## 4. How to Run LedgerLine

You can run LedgerLine either natively using your local tools (Node.js, Java, PostgreSQL) or containerized with Docker.

### Option A: Direct Local Execution (Recommended)

#### Step 1: Ensure PostgreSQL 18 is Running and Database is Created
PostgreSQL 18 is installed locally. Open PowerShell and run:
```powershell
# 1. Start PostgreSQL Windows service (if not already running)
Start-Service postgresql-x64-18

# 2. Create the 'ledgerline' database
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres ledgerline
```
*(Alternatively, create database `ledgerline` in **pgAdmin 4**).*

#### Step 2: Start the Backend (Spring Boot 3.3.5)
Open PowerShell and run:
```powershell
cd d:\Projects\LedgerLine
.\start-backend.ps1
```
*Or manually:*
```powershell
cd d:\Projects\LedgerLine\backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd spring-boot:run
```
Flyway will automatically apply database migrations (`V1__init_schema.sql`, `V2__triggers_and_immutability.sql`, `V3__seed_data.sql`) and seed default demo accounts on port **8080**.

#### Step 3: Start the Frontend (Vite + React 18)
In a **second PowerShell window**:
```powershell
cd d:\Projects\LedgerLine
.\start-frontend.ps1
```
*Or manually:*
```powershell
cd d:\Projects\LedgerLine\frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

### Option B: Running with Docker Compose (If Docker Desktop is Installed)

If Docker Desktop is installed and running on your machine:
```powershell
docker compose up --build -d
docker compose ps
```
- **Frontend Application:** [http://localhost](http://localhost) (or `http://localhost:5173` in dev mode)
- **Backend API & Actuator:** [http://localhost:8080](http://localhost:8080)
- **Swagger UI API Explorer:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option C: Deploying to Vercel (Instant Cloud Preview & Production)

LedgerLine is pre-configured for one-click deployment on **Vercel**:
1. Connect this repository to **Vercel**.
2. Deploy either from repository root (`./`) or with Root Directory set to `frontend`.
3. SPA rewrite rules, chunk optimization, and persistent double-entry simulation are configured automatically.
4. If you have a hosted Spring Boot backend, set `VITE_API_URL` (e.g. `https://api.yourdomain.com`) in Vercel Environment Variables. If not set, LedgerLine runs fully functional end-to-end in standalone cloud mode with browser persistence!

---

## 5. Local Development Setup

### Prerequisites
- JDK 21 or later installed
- Node.js 20+ and npm installed
- PostgreSQL 16+ running locally on port 5432 (or running via Docker)

### 1. Database Setup
Ensure a database named `ledgerline` exists on your PostgreSQL instance:
```sql
CREATE DATABASE ledgerline;
```

### 2. Running the Backend
```bash
cd backend
mvn spring-boot:run
```
Flyway will automatically execute migrations `V1__init_schema.sql`, `V2__triggers_and_immutability.sql`, and `V3__seed_data.sql`.

### 3. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Running Automated Tests

```bash
cd backend

# Execute all unit, integration, concurrency, and invariant tests
mvn test -Dspring.profiles.active=test

# Run only the concurrency race condition tests
mvn test -Dtest=ConcurrencyAndRaceConditionTest

# Run only financial conservation tests
mvn test -Dtest=FinancialConservationTest

# Run idempotency replay tests
mvn test -Dtest=IdempotencySafetyTest
```

---

## 7. Project Structure

```
LedgerLine/
├── backend/                             # Spring Boot 3 Java 21 Application
│   ├── src/main/java/com/ledgerline/
│   │   ├── config/                      # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/                  # Auth, Account, Transaction, Admin, Auditor, Risk
│   │   ├── domain/                      # JPA Entities (User, Account, FinancialTransaction, Journal, Ledger)
│   │   ├── dto/                         # Request and Response DTOs
│   │   ├── exception/                   # GlobalExceptionHandler and domain exceptions
│   │   ├── repository/                  # Repositories with pessimistic locking queries
│   │   ├── security/                    # JWT Token Provider, Filters, UserPrincipal
│   │   └── service/                     # FinancialEngineService, Idempotency, Reconciliation
│   └── src/main/resources/
│       ├── application.yml              # PostgreSQL, Actuator, and JWT properties
│       └── db/migration/                # Flyway V1 DDL, V2 Triggers, V3 Seed Data
├── frontend/                            # React 18 + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/                  # UI, Layout (Sidebar, Navbar), Charts, Modals, Receipts
│   │   ├── context/                     # AuthContext, ThemeContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── public/                  # Landing, Login, Register, Forgot Password
│   │   │   ├── account/                 # Dashboard, Accounts, Transfer, Deposit, Withdraw, Statements
│   │   │   ├── admin/                   # AdminDashboard, Users, Accounts, Risk, Reconciliation
│   │   │   └── auditor/                 # AuditorDashboard, LedgerExplorer, IntegrityVerification
│   │   └── services/                    # ApiClient with JWT Bearer, Idempotency-Key
│   └── package.json
├── docker/                              # Multi-stage Dockerfiles for backend and frontend
├── .github/workflows/ci.yml             # GitHub Actions CI Workflow
├── ARCHITECTURE.md                      # In-depth architectural blueprint
├── DATABASE.md                          # Schema, triggers, and foreign keys
├── THREATS.md                           # Threat modeling of financial hazards
├── TESTING.md                           # Concurrency and test strategy
├── API_DOCUMENTATION.md                 # REST API reference
├── DEPLOYMENT.md                        # Production deployment guide
├── LIMITATIONS.md                       # Documented trade-offs & limitations
├── DEMO_SCRIPT.md                       # Five-minute presentation guide
├── PROMPTS.md                           # Dated AI development log
└── docker-compose.yml                   # Production container orchestration
```

---

## 8. License & Commercial Use

Proprietary fintech software developed for the LedgerLine engineering challenge. All rights reserved.
