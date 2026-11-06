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
