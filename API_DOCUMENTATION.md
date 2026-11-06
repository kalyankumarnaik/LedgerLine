# LedgerLine API Reference Documentation (API_DOCUMENTATION.md)

All REST API endpoints are versioned under `/api/v1` and accept/return JSON payloads.

---

## 1. Authentication & Security Endpoints

### 1.1 Register User & Default Account
- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "alex",
    "email": "alex.holder@ledgerline.com",
    "password": "Password@123!",
    "fullName": "Alex Morgan"
  }
  ```
- **Response (`HTTP 200`):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "d8b3c10e-0937-4d6b-b236-40742f9fa691",
      "tokenType": "Bearer",
      "user": {
        "id": "00000000-0000-0000-0001-000000000002",
        "username": "alex",
        "email": "alex.holder@ledgerline.com",
        "fullName": "Alex Morgan",
        "enabled": true,
        "roles": ["ROLE_ACCOUNT_HOLDER"]
      }
    }
  }
  ```
- **Financial Effect:** Provisions a primary checking account (`LL-CHK-...`) with ₹0.00 initial balance, owner permissions, and default transaction limits.

---

### 1.2 User Login
- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Password@123!"
  }
  ```
- **Response (`HTTP 200`):** Returns JWT access token and refresh token.

---

### 1.3 Refresh Token Rotation
- **Method:** `POST`
- **Path:** `/api/v1/auth/refresh`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "refreshToken": "d8b3c10e-0937-4d6b-b236-40742f9fa691"
  }
  ```
- **Response (`HTTP 200`):** Returns a newly minted access token and revokes the previous refresh token, issuing a fresh one.

---

## 2. Financial Transactions Endpoints

### 2.1 Internal Account-to-Account Transfer
- **Method:** `POST`
- **Path:** `/api/v1/transactions/transfer`
- **Access:** `ROLE_ACCOUNT_HOLDER`, `ROLE_ADMIN`
- **Headers:**
  - `Authorization: Bearer <jwt>`
  - `Idempotency-Key: IDEMP-XFER-20261106-992144`
- **Request Body:**
  ```json
  {
    "sourceAccountId": "11111111-1111-1111-1111-111111111111",
    "destinationAccountNumber": "LL-CHK-88991201",
    "amount": 2500.00,
    "description": "Supplier invoice payment"
  }
  ```
- **Response (`HTTP 200`):**
  ```json
  {
    "success": true,
    "message": "Transfer completed successfully",
    "data": {
      "id": "c0000000-0000-0000-0000-000000000005",
      "transactionReference": "TXN-1730877000-A1B2C3D4",
      "transactionType": "TRANSFER",
      "sourceAccountId": "11111111-1111-1111-1111-111111111111",
      "sourceAccountNumber": "LL-CHK-10020491",
      "destinationAccountId": "33333333-3333-3333-3333-333333333333",
      "destinationAccountNumber": "LL-CHK-88991201",
      "amount": 2500.0000,
      "currency": "INR",
      "status": "POSTED",
      "description": "Supplier invoice payment",
      "initiatedByUsername": "alex",
      "createdAt": "2026-11-06T10:30:00Z",
      "completedAt": "2026-11-06T10:30:00Z"
    }
  }
  ```
- **Financial Effect:** Atomically debits ₹2,500 from source account and credits ₹2,500 to destination account. Creates a balanced journal entry with matching debit and credit ledger rows.

---

### 2.2 External Deposit
- **Method:** `POST`
- **Path:** `/api/v1/transactions/deposit`
- **Access:** `ROLE_ACCOUNT_HOLDER`, `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "accountId": "11111111-1111-1111-1111-111111111111",
    "amount": 5000.00,
    "description": "Salary deposit",
    "idempotencyKey": "IDEMP-DEP-1002"
  }
  ```
- **Financial Effect:** Debits central reserve clearing account `SYS-CLEARING-INR-001` by ₹5,000 and credits target account by ₹5,000. Total platform money remains strictly conserved.

---

### 2.3 External Withdrawal
- **Method:** `POST`
- **Path:** `/api/v1/transactions/withdraw`
- **Access:** `ROLE_ACCOUNT_HOLDER`, `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "accountId": "11111111-1111-1111-1111-111111111111",
    "amount": 1000.00,
    "description": "ATM cash withdrawal",
    "idempotencyKey": "IDEMP-WDL-1003"
  }
  ```
- **Financial Effect:** Debits customer account by ₹1,000 and credits central reserve clearing account. Rejects if balance < ₹1,000.

---

## 3. Account Management Endpoints

### 3.1 List Authorized Accounts
- **Method:** `GET`
- **Path:** `/api/v1/accounts`
- **Access:** Authenticated user

### 3.2 Get Account Statement
- **Method:** `GET`
- **Path:** `/api/v1/accounts/{id}/statement?fromDate=2026-11-01T00:00:00Z&toDate=2026-11-06T23:59:59Z`
- **Access:** Account owner, Administrator, Auditor
- **Response (`HTTP 200`):** Returns opening balance, closing balance, total debits, total credits, and chronological running balance ledger entries.

### 3.3 Export Statement CSV
- **Method:** `GET`
- **Path:** `/api/v1/accounts/{id}/statement/export`
- **Access:** Account owner, Administrator, Auditor
- **Response:** CSV attachment file `statement-{id}.csv`.

---

## 4. Auditor Endpoints (Strictly Read-Only)

### 4.1 Perform Full Reconciliation Verification
- **Method:** `GET`
- **Path:** `/api/v1/auditor/reconciliation`
- **Access:** `ROLE_AUDITOR`, `ROLE_ADMIN`
- **Response (`HTTP 200`):**
  ```json
  {
    "success": true,
    "data": {
      "verifiedAt": "2026-11-06T10:35:00Z",
      "totalAccountsChecked": 5,
      "balancedAccountsCount": 5,
      "discrepancyCount": 0,
      "totalJournalEntriesChecked": 12,
      "balancedJournalEntriesCount": 12,
      "fullyReconciled": true,
      "statusMessage": "All ledger postings are fully verified and reconciled. 0 discrepancies detected."
    }
  }
  ```

### 4.2 Raw Ledger Postings
- **Method:** `GET`
- **Path:** `/api/v1/auditor/ledger`
- **Access:** `ROLE_AUDITOR`, `ROLE_ADMIN`

### 4.3 Refused Attempts Audit Trail
- **Method:** `GET`
- **Path:** `/api/v1/auditor/failed-attempts`
- **Access:** `ROLE_AUDITOR`, `ROLE_ADMIN`

---

## 5. Administrative Endpoints

### 5.1 Freeze Account
- **Method:** `POST`
- **Path:** `/api/v1/admin/accounts/{id}/freeze`
- **Access:** `ROLE_ADMIN`
- **Financial Effect:** Sets account status to `FROZEN`. All subsequent incoming transfers, outgoing debits, and withdrawals are immediately refused.

### 5.2 Submit Account Adjustment Request
- **Method:** `POST`
- **Path:** `/api/v1/admin/adjustments/request`
- **Access:** `ROLE_ADMIN`

### 5.3 Review & Approve Adjustment Request
- **Method:** `POST`
- **Path:** `/api/v1/admin/adjustments/{id}/review`
- **Access:** `ROLE_ADMIN`
- **Financial Effect:** When approved, automatically posts compensating double-entry journal entries against the clearing reserve, adjusting the account balance without violating accounting invariants.
