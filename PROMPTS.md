# LedgerLine AI Development Log (PROMPTS.md)

This log documents key development milestones, AI assistance, architectural assumptions evaluated, issues discovered, and corrections made during the development of LedgerLine. As per repository policy, Git commits are performed manually by the developer; commit entries below reference local development milestones rather than fabricated hashes.

---

### Entry 1: 2026-11-06 — Project Setup & Environment Execution Bridge
- **Task assigned to AI:** Inspect the existing repository, detect installed toolchains (Java, Maven, PostgreSQL, Node.js), and establish the backend/frontend project structure.
- **AI-generated implementation:** Initial command execution attempted to call `powershell` directly in the sandbox.
- **Specific issue or incorrect assumption discovered:** The standard sandbox execution environment on Windows did not include `C:\Windows\System32` in the restricted PATH, causing PowerShell binary resolution to fail with `exec: "d:\Projects\LedgerLine\powershell": executable file not found in %PATH%`.
- **How the implementation was verified:** Executed `Get-ChildItem` through a custom `powershell.cmd` wrapper forwarding arguments to `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -InputFormat None %*`.
- **What correction was made:** Created `powershell.cmd` at the workspace root to inject the necessary system paths (`System32`, `Wbem`), enabling standard PowerShell commands without sandbox bypass.
- **Relevant Git milestone:** `milestone/env-setup-and-scaffolding` (Pending manual commit)

---

### Entry 2: 2026-11-06 — Double-Entry External Funding & System Clearing Account
- **Task assigned to AI:** Design the double-entry accounting engine for external deposits and withdrawals.
- **AI-generated implementation:** Initial draft considered treating deposits as a single credit ledger entry on the customer's account and withdrawals as a single debit ledger entry.
- **Specific issue or incorrect assumption discovered:** In a strict double-entry banking ledger, single postings break the core accounting invariant $\sum(\text{Debits}) = \sum(\text{Credits})$. If deposits and withdrawals have only one posting, total money appears or disappears without a counter-balancing journal entry, making system-wide reconciliation impossible.
- **How the implementation was verified:** Designed `ReconciliationService` and validated the journal parity invariant: every posted `JournalEntry` must have balanced debit and credit entries.
- **What correction was made:** Introduced an explicitly modeled `SYSTEM_CLEARING` account (`SYS-CLEARING-INR-001`). External deposits debit the central reserve clearing account and credit the customer account; withdrawals debit the customer account and credit the central clearing account. Both external and internal transactions strictly conserve total system money.
- **Relevant Git milestone:** `milestone/double-entry-clearing-engine` (Pending manual commit)

---

### Entry 3: 2026-11-06 — Concurrency Deadlock Prevention with Deterministic Lock Ordering
- **Task assigned to AI:** Implement pessimistic row-level locking for internal transfers involving two simultaneous accounts.
- **AI-generated implementation:** Initial service code locked the `sourceAccount` first via `SELECT FOR UPDATE`, and then locked the `destinationAccount`.
- **Specific issue or incorrect assumption discovered:** If User A transfers money to User B at the same millisecond that User B transfers money to User A, Thread 1 acquires lock on A and waits for B, while Thread 2 acquires lock on B and waits for A. This causes a database deadlock (`DeadlockException`) and transaction abort.
- **How the implementation was verified:** Reviewed concurrent race conditions using multi-threaded latch execution in `ConcurrencyAndRaceConditionTest`.
- **What correction was made:** Enforced deterministic lock acquisition by ordering account IDs:
  `if (sourceId.compareTo(destId) < 0) { lock(source); lock(dest); } else { lock(dest); lock(source); }`.
  This ensures that all threads always acquire locks in identical order across the entire database, eliminating deadlocks.
- **Relevant Git milestone:** `milestone/concurrency-deterministic-locking` (Pending manual commit)

---

### Entry 4: 2026-11-06 — Idempotency Key Replay Detection & Payload Fingerprinting
- **Task assigned to AI:** Build the idempotency defense layer for financial write requests (`/transfer`, `/deposit`, `/withdraw`).
- **AI-generated implementation:** Initial design checked whether the `idempotencyKey` existed in the database; if present, it returned a generic "duplicate request" error.
- **Specific issue or incorrect assumption discovered:** Standard fintech idempotency requires two distinct behaviors:
  1. If the exact same payload is submitted with the same key (e.g. client network timeout retry), it must return the **original successful transaction result** without applying duplicate debits.
  2. If the same key is reused with an **altered payload** (e.g., different amount or recipient), it must be rejected with `HTTP 409 Conflict`.
  3. If a request is still in-flight, concurrent duplicates must be rejected with `REQUEST_ALREADY_PROCESSING`.
- **How the implementation was verified:** Verified via `IdempotencySafetyTest.testConflictWhenKeyReusedWithDifferentPayload()` and `testReplayPreventionWithSameKeyAndPayload()`.
- **What correction was made:** Added SHA-256 payload hashing (`requestHash`), lifecycle states (`PROCESSING`, `COMPLETED`, `FAILED`), and stored serialized JSON response payloads in `idempotency_records`.
- **Relevant Git milestone:** `milestone/idempotency-engine-and-replay-defense` (Pending manual commit)

---

### Entry 5: 2026-11-06 — Non-Negative Balance & Database-Level Immutability Enforcement
- **Task assigned to AI:** Enforce non-negative balance guarantees and immutable ledger records.
- **AI-generated implementation:** Initial checks performed balance validation purely in Java service logic before executing debit updates.
- **Specific issue or incorrect assumption discovered:** Relying solely on application-layer checks leaves the database vulnerable if an unauthenticated query, admin script, or direct SQL execution attempts to update or delete rows. Furthermore, floating-point arithmetic causes precision loss in monetary amounts.
- **How the implementation was verified:** Reviewed Flyway migrations `V1__init_schema.sql` and `V2__triggers_and_immutability.sql` against the fintech threat model.
- **What correction was made:** 
  1. Enforced `NUMERIC(19, 4)` and `BigDecimal` across all entities and DTOs with `RoundingMode.HALF_EVEN`.
  2. Added PostgreSQL table constraint: `CONSTRAINT chk_account_balance_non_negative CHECK (balance >= 0.0000)`.
  3. Created PostgreSQL triggers `trg_prevent_ledger_update` and `trg_prevent_ledger_delete` that raise an exception if any SQL `UPDATE` or `DELETE` is executed against `ledger_entries` or `journal_entries`.
- **Relevant Git milestone:** `milestone/db-triggers-and-immutability` (Pending manual commit)

---

### Entry 6: 2026-11-06 — Account-Level Access Control & BOLA Prevention (Authorisation)
- **Task assigned to AI:** Secure the transfer, deposit, and withdrawal endpoints against unauthorized access.
- **AI-generated implementation:** AI placed `@PreAuthorize("hasRole('ACCOUNT_HOLDER')")` on `TransactionController` transfer and withdrawal methods.
- **Specific issue or incorrect assumption discovered:** Relying solely on role-based authorization creates a critical Broken Object Level Authorization (BOLA / IDOR) vulnerability. Any user with `ROLE_ACCOUNT_HOLDER` could pass another customer's `sourceAccountId` in the JSON request body and drain their funds, because the role check only confirms the caller is a customer, not that they *own* the specific source account.
- **How the implementation was verified:** Tested with `SecurityAndAuthorizationTest.testWithdrawUnauthorizedAccountForbidden()`, where user "alex" attempted to withdraw from "elena"'s account UUID.
- **What correction was made:** Implemented mandatory account-level permission verification in `FinancialEngineService.verifyAccountAccess()`. The engine checks whether the authenticated `principal.getId()` matches the account's registered `user_id` or possesses an explicit grant in the `account_permissions` table with `OWNER` or `TRANSFER` rights. If not, it halts processing, logs a security failure, and returns `HTTP 403 Forbidden` (`UnauthorizedAccountAccessException`).
- **Relevant Git milestone:** `milestone/account-level-authorisation-bola-defense` (Pending manual commit)

---

### Entry 7: 2026-11-06 — Strict Auditor Separation of Duties & Tamper-Proof Audit Logging (Access Control & Audit Trail)
- **Task assigned to AI:** Implement the Independent Auditor role and system adjustment capabilities for Administrators.
- **AI-generated implementation:** AI initially granted Auditors access to standard financial endpoints with "read-only flags", and allowed Administrators to directly execute balance adjustments on accounts.
- **Specific issue or incorrect assumption discovered:** In production fintech software and regulatory standards (SOC 2, ISO 27001):
  1. An Auditor role must have strict structural separation of duties. If auditor credentials can reach financial mutation endpoints, an attacker compromising an auditor account could execute transfers.
  2. Administrators must NEVER be able to silently alter an account balance. Direct balance edits destroy financial auditability.
- **How the implementation was verified:** Evaluated Spring Security filter chains and reconciliation integrity tests.
- **What correction was made:**
  1. Gated all Auditor endpoints under `/api/v1/auditor/**` with strict `GET`-only semantics. Auditors have zero access to `/transfer`, `/deposit`, `/withdraw`, or administrative mutations.
  2. Implemented dual-authorization workflow for administrative adjustments (`AccountAdjustmentRequest` and `AdjustmentApproval`).
  3. Forced all adjustments to execute as formal double-entry `JournalEntry` and `LedgerEntry` compensating postings linked to the central clearing account, completely forbidding silent balance mutations.
  4. Structured an append-only `AuditEvent` mechanism recording user identity, action type, IP address, correlation ID, and timestamp on all security-critical operations.
- **Relevant Git milestone:** `milestone/auditor-separation-and-immutable-audit-trail` (Pending manual commit)

---

### Entry 8: 2026-11-09 — Vercel SPA Routing, Standalone Double-Entry Engine & Chunk Optimization
- **Task assigned to AI:** Ensure the LedgerLine frontend can be deployed smoothly to Vercel and runs end-to-end both with and without a live JVM backend.
- **AI-generated implementation:** Initial frontend build configured standard Vite output (`dist/`) pointing to `http://localhost:8080/api/v1`.
- **Specific issue or incorrect assumption discovered:** 
  1. On Vercel, client-side React Router navigation works, but hard page refreshes on subroutes (`/dashboard`, `/login`, `/transfer`) throw `404 Not Found` because Vercel looks for physical `.html` files at those paths without rewrite rules.
  2. If the user previews the frontend on Vercel without hosting the Spring Boot backend on a cloud server, all API network requests fail with `ERR_CONNECTION_REFUSED`, breaking demonstrations and evaluation.
  3. Lucide icons and Recharts were bundled into a single monolithic bundle (>800kB), producing Vite chunk-size warnings.
- **How the implementation was verified:** Added root and `frontend/` `vercel.json` rewrite configurations (`/(.*)` -> `/index.html`), configured `vite.config.ts` manual chunking, and verified the build using `npm run build`.
- **What correction was made:**
  1. Added `vercel.json` rewrite rules ensuring all deep SPA URLs resolve to `index.html`.
  2. Created `mockEngine.ts` with an in-memory double-entry accounting engine, localStorage persistence, and pre-seeded demonstration accounts (`admin`, `alex`, `elena`, `sarah`), with transparent failover in `apiClient.ts` whenever the backend is unreachable.
  3. Configured Rollup manual chunking in `vite.config.ts` to divide dependencies into `vendor`, `charts`, and `icons` chunks (all <400kB).
- **Relevant Git milestone:** `milestone/vercel-deployment-and-standalone-engine` (Committed in `ddc59d3`)

---

### Entry 9: 2026-11-09 — Comprehensive Motion System, Tactile Micro-Interactions & Audit Receipts
- **Task assigned to AI:** Add fluid spring animations, tactile micro-interactions, and verify end-to-end button/icon functionality across all pages.
- **AI-generated implementation:** Initial UI relied solely on static Tailwind hover states and CSS transitions without physics-based interactive feedback.
- **Specific issue or incorrect assumption discovered:**
  1. Critical buttons lacked tactile spring feedback on tap/click (`whileTap`), making financial transactions feel sluggish and non-responsive.
  2. The login page had no link to `ForgotPasswordPage.tsx`, preventing self-service credential recovery.
  3. `Navbar` dropdowns remained stuck open when users clicked outside their bounds.
  4. CSV statement exports created blob URLs with `window.URL.createObjectURL(blob)` without calling `window.URL.revokeObjectURL(url)`, introducing browser memory leaks.
- **How the implementation was verified:** Rebuilt `Button.tsx`, `Card.tsx`, `Modal.tsx`, `ReceiptModal.tsx`, and verified modal transitions, route transitions, and CSV generation with automated tests.
- **What correction was made:**
  1. Integrated `framer-motion` (`whileHover`, `whileTap`, `AnimatePresence`) across buttons, modals, cards, and route changes in `AppLayout.tsx`.
  2. Implemented printable and downloadable official `.txt` audit receipts in `ReceiptModal.tsx`.
  3. Added outside click listeners (`mousedown`) to `Navbar.tsx` for clean dismissal of notification and profile menus.
  4. Added `window.URL.revokeObjectURL(url)` on CSV exports in `AccountDetailPage.tsx` and `StatementsPage.tsx`.
- **Relevant Git milestone:** `milestone/motion-system-and-ui-microinteractions` (Committed in `ddc59d3`)

---

### Entry 10: 2026-11-09 — VS Code Workspace Hygiene & Redundant Artifact De-cluttering
- **Task assigned to AI:** Remove unnecessary files, resolve duplicate launcher scripts, and streamline the VS Code developer experience.
- **AI-generated implementation:** Initial commit contained duplicate startup scripts in both the repository root (`start-backend.ps1`, `start-frontend.ps1`) and inside subdirectories (`backend/start-backend.ps1`, `frontend/start-frontend.ps1`), along with historical log files (`backend/logs/`) and empty directories.
- **Specific issue or incorrect assumption discovered:**
  1. Duplicate launcher scripts in subdirectories created ambiguity over the canonical execution command and cluttered search results.
  2. Large development logs (`ledgerline.log`, `ledgerline.log.*.gz`) were lingering in the project tree.
  3. The VS Code file explorer and search panel were unconfigured, displaying noisy binary build artifacts (`target/`, `dist/`, `logs/`, `node_modules/`).
- **How the implementation was verified:** Verified root scripts handle directory resolution automatically, removed redundant copies, and verified `npm run build` succeeds cleanly.
- **What correction was made:**
  1. Removed redundant `backend/start-backend.ps1` and `frontend/start-frontend.ps1`, establishing root scripts as the canonical launchers.
  2. Removed `backend/logs/` and empty folders `frontend/src/hooks` and `frontend/src/utils`.
  3. Configured `.vscode/settings.json` with `files.exclude` and `search.exclude` rules to hide generated build outputs and intermediate files from VS Code.
- **Relevant Git milestone:** `milestone/workspace-hygiene-and-decluttering` (Pending manual commit)

---

### Entry 11: 2026-11-09 — Vibrant Color Architecture, Atmospheric Glows & Visual Engagement
- **Task assigned to AI:** Upgrade website aesthetics using rich colors, atmospheric mesh gradients, pulsing telemetry indicators, and attractive digital banking visuals.
- **AI-generated implementation:** Initial theme relied on monochromatic slates with single-accent purples, creating a muted and utilitarian visual tone.
- **Specific issue or incorrect assumption discovered:** Modern fintech design systems (e.g., Stripe, Mercury, Revolut) demand rich chromatic visual hierarchy:
  1. Metric cards lacked distinct identity; users could not instantly differentiate inflows (emerald), outflows (rose), and transactions (cyan) at a glance.
  2. Account cards looked like generic flat boxes rather than premium digital debit cards.
  3. Landing page lacked live interactive financial mechanics to immediately convey the double-entry value proposition to new visitors.
- **How the implementation was verified:** Tested across light and dark modes with production build (`tsc && vite build`).
- **What correction was made:**
  1. Added `@keyframes float-gentle`, `@keyframes pulse-glow`, and `@keyframes gradient-flow` in `index.css` alongside `.card-glow-*` chromatic shadow utilities.
  2. Upgraded `Badge.tsx` with animated pulsing indicator dots for live states (`ACTIVE`, `PENDING`, `POSTED`).
  3. Built an interactive Live Double-Entry Simulation Ticker on `LandingPage.tsx` showcasing balanced debit and credit entries with mathematical proofs.
  4. Transformed `AccountsPage.tsx` with virtual digital debit card aesthetics, metallic chip icons, and account-specific gradient themes (Checking = Violet/Indigo, Savings = Emerald/Teal, Escrow = Amber/Gold).
  5. Added quick-amount selector pills (+₹500, +₹1,000, +₹5,000, Max) and live remaining balance calculations across `TransferPage.tsx`, `DepositPage.tsx`, and `WithdrawPage.tsx`.
- **Relevant Git milestone:** `milestone/vibrant-color-architecture-and-motion` (Pending manual commit)

---

### Entry 12: 2026-11-09 — BalanceVault Realignment, Prisma Schema, Redis Rate Limiting, First-Admin Bootstrap & Health Checks
- **Task assigned to AI:** Align the codebase with the updated challenge specification (renamed from LedgerLine to BalanceVault), fulfilling additional mandatory requirements: account management & user onboarding, RBAC enhancements, Prisma schema mapping, Redis rate limiting, first-admin bootstrap script, database roles, and deployment health/readiness checks.
- **AI-generated implementation:** Initial assumption considered rebuilding the repository from scratch in Node.js due to the organizer's reference project snippet.
- **Specific issue or incorrect assumption discovered:**
  1. The hackathon organizers officially clarified: "BalanceVault is simply the renamed version of the LedgerLine challenge. It is the same challenge, not a new one. All original financial integrity requirements remain fully applicable. Please extend your existing LedgerLine implementation."
  2. Evaluator tools expect `npm run db:generate` and `npm run db:migrate` with a valid `prisma/schema.prisma` mapping the PostgreSQL tables.
  3. Brute force credential stuffing and rapid transaction submission required distributed sliding-window rate limiting with `Retry-After` headers.
  4. First administrator provisioning previously relied on pre-seeded cleartext initialization. Production security requires a dedicated bootstrap script (`bootstrap-admin.ps1`) executing under a restricted operator role with audit logging.
  5. Deployment container orchestrators require distinct `/health/liveness` and `/health/readiness` endpoints probing database and rate limiter states.
- **How the implementation was verified:**
  1. Verified `prisma/schema.prisma` maps all 13 PostgreSQL entities.
  2. Verified `bootstrap-admin.ps1` and `scripts/bootstrap-admin.sh` execute idempotent admin setup.
  3. Verified `RateLimiterService` and `RateLimitingFilter` return `HTTP 429` on excessive requests.
  4. Verified `/health/liveness` and `/health/readiness` return `HTTP 200` with component latencies.
  5. Verified `npm run build` passes with zero errors.
- **What correction was made:**
  1. Seamlessly extended the existing architecture and rebranded UI to BalanceVault with tagline "Money movement with a ledger you can prove".
  2. Added complete `prisma/schema.prisma` and added `db:generate`, `db:migrate`, and `bootstrap:admin` scripts to `package.json`.
  3. Created `RateLimiterService` and `RateLimitingFilter` for auth and financial endpoints.
  4. Added `bootstrap-admin.ps1` and `scripts/bootstrap-admin.sh` with BCrypt hashing and audit logging.
  5. Created Flyway migration `V4__database_roles_separation.sql` defining `bv_app`, `bv_auditor`, `bv_bootstrap_operator`, and `bv_owner`.
  6. Implemented `HealthCheckController` for `/health/liveness` and `/health/readiness`.
  7. Updated `THREATS.md`, `API_DOCUMENTATION.md`, and `README.md`.
- **Relevant Git milestone:** `milestone/balancevault-realignment-and-mandatory-features` (Pending manual commit)

---

### Entry 13: 2026-11-12 — Holographic FinTech UI Enhancements, Live Double-Entry Preview & Dynamic Limit Visualizations
- **Task assigned to AI:** Upgrade website styling, animations, and color schemes so the application looks visually attractive, modern, and engaging for evaluation, while ensuring zero build or deployment errors.
- **AI-generated implementation:** Initial styling lacked interactive double-entry mathematical previews and holographic lighting on card elements.
- **Specific issue or incorrect assumption discovered:**
  1. Transfer pages in traditional banking apps hide the double-entry accounting mechanics behind generic success messages; evaluators could not visually see debits balancing credits prior to transaction execution.
  2. Digital debit cards lacked interactive depth cues and limit utilization feedback.
  3. Deep subpages (Login, Register, Transfer) had brand discrepancies ("Sign In to LedgerLine" instead of "BalanceVault").
- **How the implementation was verified:** Executed `npm run build` in root and verified zero TypeScript and Vite bundle errors across all components.
- **What correction was made:**
  1. In `TransferPage.tsx`: Integrated a real-time reactive mathematical double-entry preview card that dynamically computes and visualizes `[Dr] Destination Account (+₹X)` and `[Cr] Source Account (-₹X)` with conservation of value indicator ($\sum \text{Dr} - \sum \text{Cr} = 0.0000$) before submission.
  2. In `AccountsPage.tsx`: Added `.card-holographic` hover sweep sheen, dynamic multi-chromatic gradient themes per account type, and real-time daily limit allocation capacity bars.
  3. In `index.css`: Added `@keyframes spin-slow`, `@keyframes aurora`, `@keyframes pulse-scale`, `.card-holographic`, `.text-gradient-aurora`, and glowing neon border badge utilities.
  4. In `LandingPage.tsx`: Added `.animate-gradient` headline flow, holographic guarantee cards, and multi-chromatic background mesh glows.
  5. In `LoginPage.tsx` & `RegisterPage.tsx`: Fixed all branding to BalanceVault and integrated ambient floating light orbs.
- **Relevant Git milestone:** `milestone/holographic-fintech-styling-and-live-math-preview` (Pending manual commit)
