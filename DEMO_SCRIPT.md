# LedgerLine Five-Minute Live Demonstration Script (DEMO_SCRIPT.md)

This script outlines the exact chronological sequence, actions, and expected outputs for presenting LedgerLine in five minutes.

---

### Segment 1: 0:00–0:30 — Introduction & Product Vision
- **Objective:** Introduce LedgerLine and its core guarantee: *"Every movement accounted for. Every balance proven."*
- **Action:** Open browser at `http://localhost:5173/` (Landing Page).
- **Speaking Points:** 
  > "LedgerLine is an enterprise-grade fintech ledger and money movement platform. Unlike standard CRUD applications that fabricate balances in memory, LedgerLine guarantees mathematical money conservation, deterministic concurrency control, strict double-entry balancing, and unbypassable ledger immutability."
- **Visual:** Highlight the live architectural guarantees on the landing page and the pre-seeded demonstration accounts.

---

### Segment 2: 0:30–1:15 — Authentication & The Three Mandatory User Roles
- **Objective:** Demonstrate role-based access control and pre-seeded demonstration accounts.
- **Action:** Click "Sign In", click the quick **"Holder"** button (`alex.holder@ledgerline.com`), and log in.
- **Speaking Points:**
  > "We have three distinct roles. As an Account Holder, Alex has personal banking views: accounts, transfers, deposits, withdrawals, and statement downloads."
- **Action:** Sign out, click **"Admin"** (`admin@ledgerline.com`), log in. Show the Admin Control Portal with platform liquidity, user controls, and adjustment workflows.
- **Action:** Sign out, click **"Auditor"** (`sarah.auditor@ledgerline.com`), log in.
- **Speaking Points:**
  > "Sarah, our Independent Auditor, has a strictly read-only interface. She can inspect raw immutable ledger postings and verify system integrity, but the backend prevents her from transferring or modifying records."

---

### Segment 3: 1:15–2:00 — Account Provisioning & External Funding (Deposits)
- **Objective:** Demonstrate account creation and simulated external deposit.
- **Action:** Sign back in as Account Holder `alex`. Go to **"My Accounts"**. Click **"Open New Account"**. Enter:
  - Name: `Vacation Fund`
  - Account Type: `SAVINGS`
- **Expected Result:** Account is provisioned with ₹0.00 and default limits.
- **Action:** Navigate to **"Deposit Funds"**. Select the new account. Enter `₹15,000.00`. Click **"Complete Deposit"**.
- **Expected Result:** Receipt popup appears with transaction reference `TXN-DEP-...`. 
- **Speaking Points:**
  > "Notice how the deposit is accounted for: it debits our Central Reserve Clearing Account and credits Alex's account. No money is created out of thin air."

---

### Segment 4: 2:00–2:45 — Core Money Transfer & Double-Entry Postings
- **Objective:** Execute an atomic transfer and inspect matching debit/credit ledger postings.
- **Action:** Navigate to **"Transfer Money"**.
  - Source: Alex Primary Checking (`LL-CHK-10020491`)
  - Destination Account Number: `LL-CHK-88991201` (Elena Vance)
  - Amount: `₹2,500.00`
  - Note: `Invoice settlement #402`
- **Action:** Click **"Review Transfer Details"**, then **"Confirm & Post Transfer"**.
- **Expected Result:** Instant receipt modal shows `₹2,500.00` debited.
- **Action:** Go to **"My Accounts"** $\to$ click **"Alex Primary Checking"**.
- **Expected Result:** The ledger postings table shows exactly two balanced movements: Debit of ₹2,500 with updated running balance, strictly matching the materialized balance.

---

### Segment 5: 2:45–3:30 — Idempotency Protection & Replay Defense
- **Objective:** Prove that duplicate or replayed requests cannot transfer money twice.
- **Action:** Open browser developer tools Network tab or trigger the same transfer with the same `Idempotency-Key`.
- **Expected Result:**
  - The second request immediately returns the **original transaction reference**.
  - Alex's balance **does not decrease again**.
  - No duplicate ledger rows are created.
- **Speaking Points:**
  > "Under network dropouts, clients retry payments. LedgerLine checks the SHA-256 payload hash and returns the cached result without repeating postings. If the payload is mutated under the same key, it returns HTTP 409 Conflict."

---

### Segment 6: 3:30–4:15 — Concurrency Race Exercise (Non-Negative Balance Protection)
- **Objective:** Demonstrate simultaneous withdrawals against an insufficient balance.
- **Action:** Explain the automated multi-threaded test in `ConcurrencyAndRaceConditionTest`:
  ```java
  // Two simultaneous threads withdraw ₹800 against a ₹1,000 balance
  WithdrawRequest req1 = new WithdrawRequest(accId, 800, ...);
  WithdrawRequest req2 = new WithdrawRequest(accId, 800, ...);
  ```
- **Speaking Points:**
  > "Using PostgreSQL `SELECT FOR UPDATE` pessimistic row locking and deterministic UUID order, exactly one withdrawal of ₹800 succeeds. The second thread fails with `InsufficientFundsException`. The remaining balance is exactly ₹200.0000. It is mathematically impossible to produce a negative balance."

---

### Segment 7: 4:15–4:40 — Auditor Dashboard & Mathematical Integrity Verification
- **Objective:** Demonstrate the reconciliation center and pass/fail integrity verification.
- **Action:** Switch to the Auditor session (`sarah.auditor@ledgerline.com`). Navigate to **"Integrity Verification"**.
- **Action:** Click **"Re-verify Invariants"**.
- **Expected Result:**
  - 100% PASS on:
    1. Journal Debit/Credit Parity ($\sum DR - \sum CR = 0$).
    2. Materialized vs Ledger Reconciliation (0 discrepancies).
    3. PostgreSQL Immutability Trigger Enforcement.
    4. Conservation of Money Invariant.

---

### Segment 8: 4:40–5:00 — Summary of Architecture, Security & Testing
- **Objective:** Conclude with technical stack summary.
- **Speaking Points:**
  > "LedgerLine combines Java 21, Spring Boot 3, and PostgreSQL with React and Tailwind CSS. With 100% double-entry bookkeeping, deterministic locking, automated GitHub Actions CI, and full Docker containerization, LedgerLine is ready for production deployment."
