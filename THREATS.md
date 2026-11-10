# BalanceVault (formerly LedgerLine) Threat Modeling & Security Analysis (THREATS.md)

This document provides a comprehensive security threat analysis for the BalanceVault fintech platform, detailing threat scenarios, prevention mechanisms, database and backend enforcements, and residual risk evaluations.

---

## 1. Simultaneous Withdrawals (Double Spending)
- **Threat Description:** A malicious actor attempts to withdraw funds simultaneously from multiple devices or threads against a balance insufficient to satisfy both.
- **Attack Scenario:** User has ₹1,000 available. They simultaneously dispatch two withdrawal requests of ₹800.
- **Potential Impact:** Overdraft, negative balance, unbacked money loss for the organization.
- **Prevention Mechanism:** Pessimistic row locking (`SELECT FOR UPDATE`) on `account_balances` serializes access.
- **Backend Enforcement:** `accountBalanceRepository.findByAccountIdWithLock(accountId)` locks the row before evaluating `balance >= amount`.
- **Database Enforcement:** PostgreSQL row-level lock + table constraint `CONSTRAINT chk_account_balance_non_negative CHECK (balance >= 0.0000)`.
- **Relevant Automated Test:** `ConcurrencyAndRaceConditionTest.testSimultaneousWithdrawalsExceedingBalance()`
- **Residual Risk:** Minimal. Limited only by database connection pool exhaustion under extreme denial-of-service load.

---

## 2. Duplicate Payment Requests (Network Timeouts & Double Clicks)
- **Threat Description:** A user double clicks "Submit" or a mobile client retries an HTTP request after a connection timeout, leading to duplicate debits.
- **Attack Scenario:** User transfers ₹10,000. Mobile connection drops before HTTP 200 response is acknowledged. Client retries the identical request.
- **Potential Impact:** User is debited twice (₹20,000 instead of ₹10,000).
- **Prevention Mechanism:** Mandatory client-supplied or header-driven `Idempotency-Key` evaluated against stored results.
- **Backend Enforcement:** `IdempotencyService` checks if the key was already completed; if so, returns the cached original response without reprocessing.
- **Database Enforcement:** Unique database constraint `CONSTRAINT uk_user_idempotency_key UNIQUE (user_id, idempotency_key)`.
- **Relevant Automated Test:** `IdempotencySafetyTest.testReplayPreventionWithSameKeyAndPayload()`
- **Residual Risk:** If client fails to send an idempotency key and generates distinct requests, duplicate transfers can occur. Frontend UI generates keys automatically for every financial action.

---

## 3. Idempotency Key Reuse With Altered Payload
- **Threat Description:** An attacker intercepts or reuses an existing idempotency key while modifying the recipient or transaction amount.
- **Attack Scenario:** User initiates ₹100 payment with key `KEY-1`. Attacker replays `KEY-1` with amount changed to ₹10,000 to trick the server into treating it as an idempotent retry.
- **Potential Impact:** Transaction corruption or bypass of transaction validation.
- **Prevention Mechanism:** Cryptographic request payload fingerprinting via SHA-256 hash matching.
- **Backend Enforcement:** `IdempotencyService.computePayloadHash()` calculates SHA-256 digest of the request body and rejects any hash mismatch with `IdempotencyConflictException`.
- **Database Enforcement:** `request_hash VARCHAR(64) NOT NULL` stored in `idempotency_records`.
- **Relevant Automated Test:** `IdempotencySafetyTest.testConflictWhenKeyReusedWithDifferentPayload()`
- **Residual Risk:** None. Any deviation in payload attributes produces a differing SHA-256 hash.

---

## 4. Concurrent Duplicate Idempotency Requests
- **Threat Description:** Two identical requests with the same idempotency key arrive at the server within microseconds of each other while the first is still processing.
- **Attack Scenario:** Client sends two identical payment requests concurrently.
- **Potential Impact:** Both threads could pass initial read checks before either writes the completed record.
- **Prevention Mechanism:** Pessimistic lock on idempotency record and initial state set to `PROCESSING`.
- **Backend Enforcement:** Second request encounters `IdempotencyStatus.PROCESSING` and throws `IdempotencyProcessingException`.
- **Database Enforcement:** Unique constraint `uk_user_idempotency_key` ensures concurrent inserts fail immediately.
- **Relevant Automated Test:** `ConcurrencyAndRaceConditionTest`
- **Residual Risk:** Low. Handled via `HTTP 409 Conflict`.

---

## 5. Transfers in Opposite Directions (Deadlock Hazard)
- **Threat Description:** Two accounts transfer funds to each other simultaneously (A $\to$ B and B $\to$ A).
- **Attack Scenario:** Thread 1 executes Transfer A $\to$ B; Thread 2 executes Transfer B $\to$ A. Thread 1 locks A and requests B; Thread 2 locks B and requests A.
- **Potential Impact:** Database deadlock, transaction abort, failed user transfers.
- **Prevention Mechanism:** Deterministic lock ordering based on UUID natural comparison.
- **Backend Enforcement:** `FinancialEngineService.executeTransfer()` compares `sourceId.compareTo(destId)` and always locks the lower UUID first.
- **Database Enforcement:** PostgreSQL row-level locks acquired in identical sequence across all connections.
- **Relevant Automated Test:** `ConcurrencyAndRaceConditionTest.testConcurrentOppositeTransfersDeadlockPrevention()`
- **Residual Risk:** None for two-party transfers.

---

## 6. Unauthorized Account Access & Parameter Tampering
- **Threat Description:** An authenticated attacker passes another user's `accountId` in a transfer, withdrawal, or balance query.
- **Attack Scenario:** Attacker calls `POST /api/v1/transactions/withdraw` with `accountId: "victim-account-uuid"`.
- **Potential Impact:** Theft of funds from other users.
- **Prevention Mechanism:** Server-side account ownership and permission verification before locking.
- **Backend Enforcement:** `FinancialEngineService.verifyAccountAccess()` checks ownership or explicit `account_permissions` grants; throws `UnauthorizedAccountAccessException`.
- **Database Enforcement:** Foreign keys linking accounts to users; relational permissions table.
- **Relevant Automated Test:** `SecurityAndAuthorizationTest.testWithdrawUnauthorizedAccountForbidden()`
- **Residual Risk:** None. Frontend validation is never trusted.

---

## 7. Privilege Escalation
- **Threat Description:** Standard account holders attempting to call administrative or auditor endpoints.
- **Attack Scenario:** User calls `POST /api/v1/admin/accounts/{id}/freeze` or `GET /api/v1/admin/users`.
- **Potential Impact:** Unauthorized control over platform infrastructure or user accounts.
- **Prevention Mechanism:** Role-Based Access Control (RBAC) enforced via Spring Security `@PreAuthorize` and `SecurityFilterChain`.
- **Backend Enforcement:** `hasRole('ADMIN')` and `hasAnyRole('ADMIN', 'AUDITOR')` enforced on controllers.
- **Database Enforcement:** Canonical roles stored in relational `roles` and `user_roles` tables.
- **Relevant Automated Test:** `SecurityAndAuthorizationTest`
- **Residual Risk:** Minimal; dependent on JWT signature integrity.

---

## 8. SQL Injection
- **Threat Description:** Untrusted client input injected into dynamic SQL strings.
- **Attack Scenario:** Attacker submits `' OR 1=1 --` in search fields or account numbers.
- **Potential Impact:** Unauthorized data exfiltration or table destruction.
- **Prevention Mechanism:** 100% parameterized queries via Spring Data JPA and Hibernate. No string concatenation in SQL.
- **Backend Enforcement:** PreparedStatement parameter binding in all repository queries.
- **Database Enforcement:** Strict typing across all PostgreSQL tables.
- **Relevant Automated Test:** Repository integration tests.
- **Residual Risk:** Negligible.

---

## 9. Cross-Site Scripting (XSS)
- **Threat Description:** Injecting malicious JavaScript via transaction descriptions or account names.
- **Attack Scenario:** Attacker inputs `<script>alert('pwned')</script>` as transaction description.
- **Potential Impact:** Session hijacking or credential theft.
- **Prevention Mechanism:** React automatic HTML entity escaping on all data bindings; strict input validation via Bean Validation `@Size` and `@Pattern`.
- **Backend Enforcement:** Input sanitization and length limits on all DTOs.
- **Database Enforcement:** Strict column lengths (`VARCHAR(255)`).
- **Residual Risk:** Negligible with React JSX rendering.

---

## 10. CSRF (Cross-Site Request Forgery)
- **Threat Description:** Forcing an authenticated browser to submit unauthorized requests via forged links.
- **Attack Scenario:** Malicious website submits a hidden POST request to `/api/v1/transactions/transfer`.
- **Potential Impact:** Unauthorized money transfer.
- **Prevention Mechanism:** Stateless JWT authentication delivered via the `Authorization: Bearer <token>` header, not ambient browser cookies.
- **Backend Enforcement:** CORS policy rejects unauthorized cross-origin requests; non-cookie bearer tokens inherently immune to CSRF.
- **Residual Risk:** None when using Authorization header.

---

## 11. JWT Theft, Tampering, and Replay
- **Threat Description:** Eavesdropping or theft of JWT access tokens.
- **Attack Scenario:** Token intercepted or modified to forge administrator permissions.
- **Potential Impact:** Account impersonation.
- **Prevention Mechanism:** HMAC-SHA256 signature verification with 256-bit secret key; short 15-minute access token lifespan; token rotation on refresh; TLS encryption in transit.
- **Backend Enforcement:** `JwtTokenProvider.validateToken()` cryptographically checks signature and expiration date.
- **Database Enforcement:** Refresh tokens stored as SHA-256 hashes in `refresh_tokens`; single-use rotation revokes previous token upon refresh.
- **Residual Risk:** If client machine is compromised via malware, local tokens could be read. Mitigated by short 15-minute lifetime.

---

## 12. Brute-Force Authentication & Credential Stuffing
- **Threat Description:** Repeated dictionary attacks against login endpoints.
- **Attack Scenario:** Automated script submits thousands of passwords against `admin` or user accounts.
- **Potential Impact:** Account takeover.
- **Prevention Mechanism:** Account lockout after 5 consecutive failed login attempts; BCrypt password hashing work factor of 10.
- **Backend Enforcement:** `AuthService.login()` tracks `failedLoginAttempts` and sets `lockedUntil = now() + 15 minutes`.
- **Database Enforcement:** `locked_until TIMESTAMP WITH TIME ZONE` column on `users`.
- **Residual Risk:** Distributed brute-force across multiple accounts. Mitigated by production rate-limiting proxies (Nginx/Cloudflare).

---

## 13. Negative Amount & Zero Amount Manipulation
- **Threat Description:** Submitting negative values (e.g., `-₹500`) in transfers or withdrawals to reverse balance logic and generate unbacked funds.
- **Attack Scenario:** Attacker requests transfer of `-₹1000` to increase source balance.
- **Potential Impact:** Infinite money creation.
- **Prevention Mechanism:** Validation checks requiring amounts strictly greater than zero at DTO, service, and database levels.
- **Backend Enforcement:** `@DecimalMin(value = "0.01")` in all DTOs and explicit assertion `amount.compareTo(BigDecimal.ZERO) > 0` in services.
- **Database Enforcement:** PostgreSQL check constraints: `CHECK (amount > 0.0000)` on `financial_transactions` and `ledger_entries`.
- **Relevant Automated Test:** `FinancialConservationTest`
- **Residual Risk:** None.

---

## 14. Floating-Point Rounding & Decimal Precision Loss
- **Threat Description:** Accumulation of binary floating-point rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`).
- **Attack Scenario:** High-volume micropayments lose pennies or fractions of currency over time.
- **Potential Impact:** Accounting imbalances, ledger discrepancies.
- **Prevention Mechanism:** Exclusive use of Java `BigDecimal` with scale 4 and explicit rounding (`RoundingMode.HALF_EVEN`), and PostgreSQL `NUMERIC(19, 4)`. No `FLOAT` or `DOUBLE` permitted in financial paths.
- **Backend Enforcement:** All financial fields typed as `BigDecimal`.
- **Database Enforcement:** Columns defined as `NUMERIC(19, 4)`.
- **Residual Risk:** None.

---

## 15. Partial Database Transaction Failure (Split Transactions)
- **Threat Description:** Database connection drops or server crashes after debiting the source account but before crediting the destination account.
- **Attack Scenario:** Mid-execution power outage or network severance during transfer.
- **Potential Impact:** Money destroyed (debited without corresponding credit).
- **Prevention Mechanism:** Atomic Spring `@Transactional(isolation = Isolation.READ_COMMITTED)` database transactions.
- **Backend Enforcement:** If any step fails, entire transaction rolls back cleanly.
- **Database Enforcement:** ACID PostgreSQL database transactions.
- **Residual Risk:** None. Either all postings commit or none do.

---

## 16. Unauthorized Modification or Deletion of Ledger Records (Tampering)
- **Threat Description:** Malicious insider, rogue administrator, or compromised service attempts to execute `UPDATE` or `DELETE` on posted ledger records.
- **Attack Scenario:** Direct query: `UPDATE ledger_entries SET amount = 0 WHERE account_id = '...'`.
- **Potential Impact:** Destruction of auditability, balance fabrication.
- **Prevention Mechanism:** Append-only ledger architecture enforced by PostgreSQL database triggers.
- **Backend Enforcement:** No update or delete endpoints exist in controllers or services for ledger entities.
- **Database Enforcement:** PostgreSQL triggers `trg_prevent_ledger_update`, `trg_prevent_ledger_delete`, `trg_prevent_journal_update`, and `trg_prevent_journal_delete` raise an unbypassable exception on any DML mutation.
- **Residual Risk:** Database superuser (`postgres`) could theoretically drop the trigger. Mitigated in production by restricting application database credentials to DML without DDL trigger drop permissions.

---

## 17. Silent Balance Manipulation by Administrators
- **Threat Description:** An administrator directly edits an account balance without leaving an audit trail.
- **Attack Scenario:** Administrator wants to adjust a client balance secretly.
- **Potential Impact:** Fraud, regulatory violation.
- **Prevention Mechanism:** No direct balance editing API. All adjustments require a formal, multi-party adjustment workflow (`AccountAdjustmentRequest` + `AdjustmentApproval`) that posts compensating double-entry journal entries.
- **Backend Enforcement:** `AdminService.executeAdjustmentPostings()` posts balanced debit and credit entries against the central clearing reserve.
- **Database Enforcement:** `account_balances` updates trigger reconciliation flags if not backed by matching ledger entries.
- **Relevant Automated Test:** `ReconciliationServiceTest`
- **Residual Risk:** None through application APIs.

---

## 18. Audit Log Manipulation & Data Leakage
- **Threat Description:** Altering or clearing security event logs, or logging sensitive user credentials (passwords, JWTs).
- **Attack Scenario:** Attacker gains access and scrubs their failed login attempts.
- **Potential Impact:** Cover-up of security breaches.
- **Prevention Mechanism:** Failed attempts and audit events are append-only. Passwords and tokens are strictly excluded from logging statements.
- **Backend Enforcement:** Audit logging masks passwords and secrets; uses correlation IDs instead of raw credentials.
- **Database Enforcement:** Append-only tables `audit_events` and `failed_transaction_attempts`.
- **Residual Risk:** Centralized log retention policies should forward to external immutable log stores (SIEM/WORM) in enterprise tier.

---

## 19. Account Freezing During In-Flight Transfer
- **Threat Description:** An administrator freezes an account while a transfer involving that account is currently executing.
- **Attack Scenario:** Admin executes `POST /freeze` while client executes `POST /transfer`.
- **Potential Impact:** Frozen account receives or sends funds unexpectedly.
- **Prevention Mechanism:** Account status is validated after acquiring the row-level lock.
- **Backend Enforcement:** `if (account.getStatus() != AccountStatus.ACTIVE) throw new AccountInactiveException(...)`.
- **Database Enforcement:** Locking guarantees the transfer sees the committed frozen state or vice-versa.
- **Residual Risk:** None.

---

## 20. Application Restart During Financial Processing
- **Threat Description:** JVM process crashes or is killed by OS (OOM / SIGKILL) midway through a financial calculation.
- **Attack Scenario:** Worker node terminates during transfer execution.
- **Potential Impact:** Incomplete transaction or hanging state.
- **Prevention Mechanism:** Database-managed ACID transactions. PostgreSQL rolls back uncommitted transactions upon client disconnect.
- **Backend Enforcement:** State is persisted to database only at transaction commit.
- **Database Enforcement:** PostgreSQL WAL (Write-Ahead Logging) and automatic recovery roll back uncommitted locks.
- **Residual Risk:** Client receives HTTP connection drop; client retries safely using the same `Idempotency-Key`.

---

## 21. Distributed Denial of Service & Brute-Force Flooding
- **Threat Description:** Malicious bots flood financial write endpoints (`/transfer`, `/deposit`, `/withdraw`) or brute-force user authentication (`/auth/login`).
- **Attack Scenario:** Attacker executes 10,000 rapid password guesses or spams transfer requests to exhaust database locks and thread pools.
- **Potential Impact:** Service degradation, legitimate customer lockout, thread pool starvation.
- **Prevention Mechanism:** Multi-tier sliding window rate limiting backed by Redis and token-bucket filters.
- **Backend Enforcement:** `RateLimitingFilter` enforces 15 req/min on `/auth/` and 40 req/min on financial transfers, returning `HTTP 429 Too Many Requests` with `Retry-After`.
- **Database Enforcement:** PostgreSQL connection pooling (`HikariCP`) isolates connection spikes.
- **Residual Risk:** Distributed botnets spoofing client IPs. Mitigated via reverse-proxy header parsing (`X-Forwarded-For`, `X-Real-IP`) and Cloudflare/WAF integration.

---

## 22. Database Privilege Escalation & Role Separation
- **Threat Description:** A compromised application service account or SQL injection attempts to alter schema definitions or drop database triggers.
- **Attack Scenario:** Attacker attempts `DROP TRIGGER trg_prevent_ledger_update ON ledger_entries`.
- **Potential Impact:** Permanent destruction of financial audit guarantees.
- **Prevention Mechanism:** Principle of Least Privilege PostgreSQL database role separation (`bv_app`, `bv_auditor`, `bv_bootstrap_operator`, `bv_owner`).
- **Backend Enforcement:** The operational application connects via `bv_app`, which possesses DML permissions (`SELECT`, `INSERT`, `UPDATE`) only and zero DDL permissions.
- **Database Enforcement:** `REVOKE ALL PRIVILEGES` on DDL schema operations; `bv_auditor` has read-only `SELECT` access with zero write permissions.
- **Residual Risk:** Managed database provider credentials must maintain strong password rotation and TLS encryption in transit.

---

## 23. First-Administrator Bootstrap Hijacking
- **Threat Description:** An unauthorized party invokes bootstrap initialization on a freshly deployed instance to grant themselves superuser privileges.
- **Attack Scenario:** Attacker calls `/bootstrap-admin` or runs bootstrap scripts after the service goes live.
- **Potential Impact:** Complete administrative platform takeover.
- **Prevention Mechanism:** Idempotent one-time bootstrap enforcement in database stored function `bootstrap_admin_user()`.
- **Backend Enforcement:** Script checks if any user with `ROLE_ADMIN` exists; if count > 0, the operation is immediately rejected and logged as a security alert.
- **Database Enforcement:** Security definer stored function enforces single-admin bootstrap and writes an immutable `AuditEvent`.
- **Residual Risk:** None once initialized. Initial bootstrap should be executed before exposing endpoints to the public internet.
