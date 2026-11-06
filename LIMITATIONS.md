# LedgerLine Architectural Trade-offs & Limitations (LIMITATIONS.md)

This document transparently documents deliberately unimplemented features, accepted trade-offs, and future improvements for the LedgerLine platform.

---

## 1. Deliberately Unimplemented Features

### 1.1 Overdraft Facilities
- **Decision:** Negative account balances are strictly prohibited by both database check constraints (`chk_account_balance_non_negative`) and service-layer checks.
- **Rationale:** For an authoritative double-entry transaction engine, allowing unbacked negative balances introduces credit risk and complicates mathematical invariant verification. Overdraft was deliberately omitted in Version 1.0 to guarantee financial conservation.

### 1.2 Multi-Currency FX Conversions in Core Ledger
- **Decision:** Version 1.0 operates on a single base currency (`INR`). Multi-currency accounts store ISO currency codes, but automatic real-time FX conversions are not performed.
- **Rationale:** Automatic currency exchange requires integrating live pricing oracles and modeling currency trading gain/loss accounts. The double-entry schema supports introducing exchange accounts in future iterations without altering table structures.

### 1.3 Direct External Banking Rails (SWIFT / UPI / ACH)
- **Decision:** External deposits and disbursements are modeled as authorized funding operations against the `SYSTEM_CLEARING` reserve account.
- **Rationale:** Production bank integrations require external settlement agreements, webhooks, and asynchronous reconciliation. The simulation model strictly mirrors real settlement clearing without requiring proprietary bank sandbox credentials.

---

## 2. Accepted Architectural Trade-offs

### 2.1 Pessimistic Row Locking vs Optimistic Locking
- **Trade-off:** LedgerLine uses pessimistic row locking (`SELECT FOR UPDATE`) on account balance records instead of optimistic version checks (`@Version`).
- **Impact:** High write contention on a single account causes concurrent requests to queue up behind the lock.
- **Justification:** In high-concurrency fintech scenarios (such as flash sales or payroll runs), optimistic locking results in frequent `OptimisticLockingFailureException` rollbacks, forcing clients to retry repeatedly. Pessimistic row locking with deterministic UUID ordering guarantees that transactions process in sequence without aborting valid requests or risking deadlocks.

### 2.2 Materialized Balances vs Event-Sourced Pure Derivation
- **Trade-off:** The platform maintains a materialized `account_balances` table alongside immutable `ledger_entries`.
- **Impact:** Updates must atomically modify both the balance record and append the ledger entry within the same database transaction.
- **Justification:** Recalculating account balances by scanning millions of historical ledger entries on every balance inquiry is prohibitively slow for user dashboards. The dual-verification `ReconciliationService` bridges this trade-off by auditing materialized balances against historical ledger entries continuously.

---

## 3. Known Risks & Mitigations

| Risk | Description | Mitigation in LedgerLine |
| :--- | :--- | :--- |
| **Hotspot Account Contention** | A high-volume centralized account (e.g. system clearing) could face database lock queue latency. | High-throughput batch processing or multi-clearing partition accounts can be assigned per regional cluster. |
| **Database Superuser Trigger Bypass** | An administrator with direct PostgreSQL superuser credentials could drop immutability triggers. | Restrict application database user roles; stream WAL logs to external WORM audit storage. |

---

## 4. Future Enhancements

1. **Multi-Region Cross-Database Sharding:** Partition accounts across regional PostgreSQL clusters by account routing prefix.
2. **Automated End-of-Day (EOD) Reconciliation Cron:** Scheduled automated cron worker running nightly reconciliation and generating cryptographically signed audit summaries.
3. **OpenTelemetry Distributed Tracing:** Trace IDs injected across micro-interactions and database transactions for granular latency telemetry.
