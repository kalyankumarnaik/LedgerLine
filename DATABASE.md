# LedgerLine Relational Database Specification (DATABASE.md)

This document details the PostgreSQL schema, relational constraints, foreign keys, database triggers, Flyway migration files, and precision standards implemented in LedgerLine.

---

## 1. Relational Entity Diagram & Schema Design

```
+-------------------+       +--------------------+       +----------------------+
|       users       |       |       roles        |       |      user_roles      |
+-------------------+       +--------------------+       +----------------------+
| id (PK, UUID)     |<------+ id (PK, UUID)      |<------+ user_id (FK)         |
| username (UQ)     |       | name (UQ)          |       | role_id (FK)         |
| email (UQ)        |       +--------------------+       +----------------------+
| password_hash     |
| enabled           |
+---------+---------+
          |
          | 1:N
          v
+-------------------+       +--------------------+       +----------------------+
|     accounts      |<----->|  account_balances  |       |  transaction_limits  |
+-------------------+ 1:1   +--------------------+       +----------------------+
| id (PK, UUID)     |       | account_id (PK, FK)|<------+ account_id (UQ, FK)  |
| account_number(UQ)|       | balance (NUMERIC)  |       | daily_limit (NUMERIC)|
| user_id (FK)      |       | version (BIGINT)   |       | per_txn_limit        |
| account_type      |       | [CHK balance >= 0] |       +----------------------+
| status            |       +--------------------+
+---------+---------+
          |
          | 1:N
          v
+------------------------+       +-------------------+       +--------------------+
| financial_transactions |<----->|  journal_entries  |1:N    |   ledger_entries   |
+------------------------+ 1:1   +-------------------+------>+--------------------+
| id (PK, UUID)          |       | id (PK, UUID)     |       | id (PK, UUID)      |
| reference (UQ)         |       | transaction_id(FK)|       | journal_id (FK)    |
| source_account_id (FK) |       | entry_ref (UQ)    |       | account_id (FK)    |
| dest_account_id (FK)   |       +-------------------+       | entry_type (DR/CR) |
| amount (NUMERIC)       |                                   | amount (NUMERIC)   |
| status (POSTED/...)    |                                   | running_balance    |
+------------------------+                                   | [TRIGGER: IMMUTABLE|
                                                             +--------------------+
```

---

## 2. Table Specifications & Constraints

### 1. `users`
- Primary identity table with failed login lockout counters.
- Constraints: `UNIQUE(username)`, `UNIQUE(email)`.

### 2. `accounts`
- Core account entity supporting `CHECKING`, `SAVINGS`, `ESCROW`, and `SYSTEM_CLEARING`.
- Constraints: `UNIQUE(account_number)`, `FOREIGN KEY(user_id) REFERENCES users(id)`.

### 3. `account_balances`
- Holds current materialized balance with 4 decimal places.
- Hard check constraint:
  ```sql
  CONSTRAINT chk_account_balance_non_negative CHECK (balance >= 0.0000)
  ```
- Optimistic locking fallback column: `version BIGINT NOT NULL DEFAULT 0`.

### 4. `financial_transactions`
- High-level business transaction record (transfers, deposits, disbursements, adjustments).
- Check constraint: `CHECK (amount > 0.0000)`.
- Foreign keys: `source_account_id` and `destination_account_id` referencing `accounts(id)`.

### 5. `journal_entries`
- Accounting journal transaction header. Exactly 1 per successful financial transaction.
- Constraints: `UNIQUE(transaction_id)`, `UNIQUE(entry_reference)`.

### 6. `ledger_entries`
- Append-only financial line items. Each internal transfer produces exactly two entries (1 DEBIT, 1 CREDIT).
- Check constraint: `CHECK (amount > 0.0000)`.
- Protected by database triggers against `UPDATE` and `DELETE`.

### 7. `idempotency_records`
- Enforces single-execution semantics per client request.
- Constraints: `UNIQUE(user_id, idempotency_key)`.
- Columns: `request_hash VARCHAR(64)` (SHA-256), `status`, `response_payload TEXT`.

### 8. `failed_transaction_attempts`
- Separate audit trail for refused financial operations (insufficient funds, invalid status, unauthorized access).
- Columns: `correlation_id`, `initiating_user_id`, `account_id`, `requested_operation`, `failure_reason`.

### 9. `account_adjustment_requests` & `adjustment_approvals`
- Two-party administrative adjustment workflow.
- Statuses: `PENDING`, `APPROVED`, `REJECTED`.

---

## 3. Database Triggers & Immutability Enforcement

Flyway migration `V2__triggers_and_immutability.sql` establishes database-layer protection against ledger tampering:

```sql
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are strictly immutable. Updates and deletions are forbidden by financial integrity policy.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_ledger_update
BEFORE UPDATE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_prevent_ledger_delete
BEFORE DELETE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_prevent_journal_update
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION prevent_journal_modification();

CREATE TRIGGER trg_prevent_journal_delete
BEFORE DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION prevent_journal_modification();
```

---

## 4. Flyway Database Migrations

Database versioning is managed via Flyway scripts in `backend/src/main/resources/db/migration/`:

1. `V1__init_schema.sql`: Full relational DDL, foreign keys, indexes, check constraints.
2. `V2__triggers_and_immutability.sql`: PostgreSQL PL/pgSQL functions and triggers preventing UPDATE and DELETE on posted ledger and journal entries.
3. `V3__seed_data.sql`: Seed roles, default users (`admin`, `alex`, `elena`, `sarah`), system clearing account, initial balances, and balanced opening journal entries.

---

## 5. Currency & Decimal Precision Policy

- Financial calculations **never** use `FLOAT` or `DOUBLE`.
- Database storage uses `NUMERIC(19, 4)`:
  - 15 digits before the decimal point (up to hundreds of trillions).
  - 4 decimal digits after the decimal point (sub-cent / fractional precision).
- Java calculations use `BigDecimal` configured with `RoundingMode.HALF_EVEN` (Banker's rounding).
