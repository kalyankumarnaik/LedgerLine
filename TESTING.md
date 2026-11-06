# LedgerLine Automated Testing & Verification Strategy (TESTING.md)

This document describes the automated test architecture, concurrency race exercises, and financial invariant assertion suites built into LedgerLine.

---

## 1. Testing Philosophy & Scope

Financial software must never rely solely on mocked repositories to claim correctness. LedgerLine exercises **real transactional semantics**, **row-level pessimistic locks**, and **multi-threaded concurrency race conditions**.

The test suite covers:
1. **Financial Conservation Tests:** Validating mathematical invariants, zero-sum transfers, and clearing reserve balance conservation.
2. **Concurrency & Race Condition Tests:** Exercising multi-threaded race conditions (e.g. concurrent withdrawals exceeding balance, cross-account transfers in opposite directions).
3. **Idempotency Safety Tests:** Replay prevention, altered payload rejection, and concurrent in-flight requests.
4. **Security & Authorization Tests:** Server-side permission boundaries, role isolation, and auditor read-only enforcement.
5. **Reconciliation Auditing Tests:** Dual-verification comparing materialized balances with dynamically computed ledger sums.

---

## 2. Running Automated Tests

### Backend Unit & Integration Tests
Run via Maven using the test profile:
```bash
cd backend
mvn test -Dspring.profiles.active=test
```

### Running Specific Test Suites
```bash
# Run Concurrency & Race Condition Tests
mvn test -Dtest=ConcurrencyAndRaceConditionTest

# Run Financial Conservation Invariant Tests
mvn test -Dtest=FinancialConservationTest

# Run Idempotency Safety Tests
mvn test -Dtest=IdempotencySafetyTest

# Run Security & Authorization Tests
mvn test -Dtest=SecurityAndAuthorizationTest
```

---

## 3. Mandatory Concurrency Test Scenarios

### Scenario A: Simultaneous Withdrawals Exceeding Balance
- **File:** `src/test/java/com/ledgerline/concurrency/ConcurrencyAndRaceConditionTest.java`
- **Method:** `testSimultaneousWithdrawalsExceedingBalance()`
- **Mechanism:**
  - An account is initialized with exactly ₹1,000.0000 balance.
  - Two threads are created using an `ExecutorService`.
  - Both threads are synchronized with a `CountDownLatch(1)` to fire at the exact same millisecond.
  - Both threads request a withdrawal of ₹800.0000.
- **Assertions:**
  1. Exactly 1 withdrawal succeeds (`successCount == 1`).
  2. Exactly 1 withdrawal fails with `InsufficientFundsException` (`failureCount == 1`).
  3. The final balance is exactly ₹200.0000.
  4. The account balance **never becomes negative**.

---

### Scenario B: Opposite Cross-Transfers (Deadlock Prevention)
- **File:** `src/test/java/com/ledgerline/concurrency/ConcurrencyAndRaceConditionTest.java`
- **Method:** `testConcurrentOppositeTransfersDeadlockPrevention()`
- **Mechanism:**
  - Account A has ₹5,000; Account B has ₹5,000. Combined total = ₹10,000.
  - Four concurrent threads are launched: two transfer $A \to B$ (₹500 each) and two transfer $B \to A$ (₹300 each).
- **Assertions:**
  1. All 4 transfers finish within 15 seconds without encountering a database deadlock.
  2. Total funds across both accounts strictly remain ₹10,000.0000.
  3. All journal entries balance.

---

## 4. Financial Invariant Verification Tests

- **File:** `src/test/java/com/ledgerline/financial/FinancialConservationTest.java`
- **Methods:**
  - `testTransferConservation()`: Validates that for every transfer, source balance decrease equals destination balance increase, and the sum of postings equals zero.
  - `testDepositConservation()`: Confirms external deposits credit customer account and debit system clearing account.
  - `testWithdrawalConservation()`: Confirms disbursements debit customer account and credit system clearing account.

---

## 5. Idempotency Safety Tests

- **File:** `src/test/java/com/ledgerline/idempotency/IdempotencySafetyTest.java`
- **Methods:**
  - `testReplayPreventionWithSameKeyAndPayload()`: Asserts that resubmitting the identical request with the same idempotency key returns the original transaction reference without creating additional ledger postings or altering account balances.
  - `testConflictWhenKeyReusedWithDifferentPayload()`: Asserts that altering the payload under the same idempotency key throws `IdempotencyConflictException` (`HTTP 409 Conflict`).
