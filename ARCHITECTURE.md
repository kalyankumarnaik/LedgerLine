# LedgerLine System Architecture (ARCHITECTURE.md)

This document describes the architectural principles, component responsibilities, concurrency controls, and financial data lifecycle powering the **LedgerLine** platform.

---

## 1. Architectural Overview & Product Vision

LedgerLine is built as a **Modular Monolith** prioritizing correctness, strict accounting invariants, and atomic transaction guarantees over distributed complexity. 

```
                                  +------------------------------------+
                                  |         React 18 Frontend          |
                                  |  (TypeScript + Tailwind + Vite)    |
                                  +-----------------+------------------+
                                                    |  HTTPS + JWT Bearer
                                                    |  Idempotency-Key
                                                    v
                                  +-----------------+------------------+
                                  |     Spring Boot 3.3.5 Backend      |
                                  |   (Java 21/25 Enterprise Engine)   |
                                  +-----------------+------------------+
                                  |  - Spring Security (Stateless JWT) |
                                  |  - Idempotency Service (SHA-256)   |
                                  |  - Financial Engine Service        |
                                  |  - Risk Review Engine              |
                                  |  - Reconciliation Service          |
                                  +-----------------+------------------+
                                                    |  JDBC (Pessimistic Locks)
                                                    v
                                  +-----------------+------------------+
                                  |     PostgreSQL 16/18 Database      |
                                  |  - NUMERIC(19, 4) Precision        |
                                  |  - Row Locking (SELECT FOR UPDATE) |
                                  |  - Immutability Triggers (DML Block)|
                                  |  - Check Constraints (balance >= 0)|
                                  +------------------------------------+
```

---

## 2. Core Accounting Model: Double-Entry Ledger

Every money movement in LedgerLine complies with the double-entry accounting equation:

$$\sum \text{Debits} - \sum \text{Credits} = 0$$

### Accounting Perspectives & Conventions
For customer accounts (asset perspective from user viewpoint):
- **Credit (CR):** Inflow of funds (increases account balance).
- **Debit (DR):** Outflow of funds (decreases account balance).

### External Operations & Central Clearing Reserve
To ensure that external funding and disbursements adhere to the zero-sum invariant without creating money out of thin air:
- A dedicated **System Clearing Account** (`SYS-CLEARING-INR-001`, UUID: `00000000-0000-0000-0000-000000000001`) acts as the counter-party for external operations.
- **Deposit:** Debit Clearing Reserve $\to$ Credit Customer Account.
- **Withdrawal:** Debit Customer Account $\to$ Credit Clearing Reserve.
- **Internal Transfer:** Debit Source Customer Account $\to$ Credit Destination Customer Account.

Both legs of every transaction are saved in `journal_entries` and individual postings in `ledger_entries`.

---

## 3. Database Transaction & Locking Strategy

### Isolation Level
Transactions use PostgreSQL `READ COMMITTED` isolation with **explicit pessimistic row-level locking** (`SELECT FOR UPDATE`). This avoids the serialization retry loops and high abort rates of `SERIALIZABLE` isolation while providing absolute concurrency safety.

### Deterministic Lock Ordering (Deadlock Prevention)
Transfers touch two accounts simultaneously. Without ordering, concurrent opposite transfers ($A \to B$ and $B \to A$) cause circular lock dependencies and deadlocks.

**Algorithm:**
```java
UUID sourceId = sourceAccount.getId();
UUID destId = destAccount.getId();

AccountBalance firstLock;
AccountBalance secondLock;

// Order lock acquisition deterministically by UUID natural order
if (sourceId.compareTo(destId) < 0) {
    firstLock = accountBalanceRepository.findByAccountIdWithLock(sourceId);
    secondLock = accountBalanceRepository.findByAccountIdWithLock(destId);
} else {
    firstLock = accountBalanceRepository.findByAccountIdWithLock(destId);
    secondLock = accountBalanceRepository.findByAccountIdWithLock(sourceId);
}
```
Because every connection locks accounts in the exact same sequence across the database cluster, **deadlocks are mathematically impossible**.

### Non-Negative Balance Enforcement
1. **Pessimistic Check:** After acquiring the row lock, the service verifies `sourceBalance.getBalance().compareTo(amount) >= 0`. If insufficient, it throws `InsufficientFundsException`.
2. **Database Hard Constraint:** The `account_balances` table contains:
   ```sql
   CONSTRAINT chk_account_balance_non_negative CHECK (balance >= 0.0000)
   ```
   Even if application logic were bypassed, PostgreSQL rejects any write that would leave a negative balance.

---

## 4. Financial Transaction Lifecycle

```
[Client Request]
       |  (Payload + Idempotency-Key)
       v
[Idempotency Check] -----(Key Exists & Completed)-----> [Return Cached Result]
       |
       +--(Key Exists & Different Hash)---------------> [Throw 409 Conflict]
       |
       +--(Key Exists & Processing)-------------------> [Throw 409 In-Flight]
       |
       v  (New Key -> Status = PROCESSING)
[Begin DB Transaction]
       |
       v
[Deterministic Account Row Locks] (SELECT ... FOR UPDATE in UUID order)
       |
       v
[Status & Permission Checks] (Both accounts ACTIVE, user authorized)
       |
       v
[Limit Verification] (Per-transaction & Daily cumulative check)
       |
       v
[Sufficient Funds Check] (Balance >= Amount)
       |
       v
[Update Materialized Balances] (Source -= Amount, Dest += Amount)
       |
       v
[Create Financial Transaction] (Status = POSTED)
       |
       v
[Create Journal Entry] (Unique reference JRN-...)
       |
       v
[Create Balanced Ledger Postings] (1 Debit Entry, 1 Credit Entry)
       |
       v
[Verify Invariant: Debit == Credit]
       |
       v
[Commit DB Transaction]
       |
       v
[Idempotency Success & Auditing] (Status = COMPLETED, Response cached)
       |
       v
[Client Receives 200 OK + Transaction DTO]
```

---

## 5. Idempotency & Replay Defense Architecture

LedgerLine implements the fintech standard idempotency pattern:
1. **Key Generation:** Clients supply an `Idempotency-Key` header (e.g. UUIDv4 or formatted prefix `IDEMP-XFER-...`).
2. **Payload Fingerprint:** The backend hashes the serialized request body using SHA-256 (`request_hash`).
3. **Database Uniqueness:** A unique constraint on `(user_id, idempotency_key)` guarantees key isolation per user.
4. **Lifecycle States:**
   - `PROCESSING`: Marks the request as active. Concurrent duplicate calls receive `HTTP 409 Conflict` ("Request currently processing").
   - `COMPLETED`: Stores the serialized JSON response. Subsequent identical calls immediately return this response without touching account balances or ledger postings.
   - `FAILED`: Records transaction failures.

---

## 6. Immutable Ledger Protections

To ensure audit records cannot be altered or purged by any user or application process:
1. **Append-Only Schema:** No `UPDATE` or `DELETE` endpoints exist.
2. **PostgreSQL Triggers:**
   ```sql
   CREATE OR REPLACE FUNCTION prevent_ledger_modification()
   RETURNS TRIGGER AS $$
   BEGIN
       RAISE EXCEPTION 'Ledger entries are strictly immutable. Updates and deletions are forbidden by financial integrity policy.';
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trg_prevent_ledger_update BEFORE UPDATE ON ledger_entries FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
   CREATE TRIGGER trg_prevent_ledger_delete BEFORE DELETE ON ledger_entries FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
   ```
3. **Compensating Transactions for Adjustments:** If an administrative adjustment or correction is required, it must follow the two-party review workflow (`account_adjustment_requests` $\to$ `adjustment_approvals`) and post an auditable, counter-balancing double-entry transaction.

---

## 7. Dual Balance Verification & Reconciliation Engine

LedgerLine combines high read performance with verifiable auditability:
- **Materialized Balances (`account_balances.balance`):** Maintained for instantaneous balance queries and dashboard rendering.
- **Ledger-Derived Balances (`calculateReconciledBalance`):** Calculated dynamically on demand by summing all immutable credit postings and subtracting all debit postings.
- **Reconciliation Engine (`ReconciliationService`):** Compares materialized balances against ledger-derived balances across all accounts. Any detected variance ($> 0.0000$) raises a high-severity audit flag and is presented visibly in both Admin and Auditor portals.
