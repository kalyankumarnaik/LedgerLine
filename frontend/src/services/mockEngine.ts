import {
  Account,
  AdjustmentRequest,
  AuditEvent,
  AuthResponse,
  DashboardSummary,
  FailedAttempt,
  LedgerEntry,
  NotificationItem,
  ReconciliationReport,
  RiskFlag,
  Statement,
  Transaction,
  User,
} from '../types';

interface MockState {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  ledgerEntries: LedgerEntry[];
  notifications: NotificationItem[];
  riskFlags: RiskFlag[];
  adjustments: AdjustmentRequest[];
  failedAttempts: FailedAttempt[];
  auditEvents: AuditEvent[];
}

const STORAGE_KEY = 'ledgerline_mock_state_v1';

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-001',
    username: 'admin',
    email: 'admin@balancevault.com',
    fullName: 'BalanceVault Administrator',
    enabled: true,
    roles: ['ROLE_ADMIN'],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-alex-001',
    username: 'alex',
    email: 'alex.holder@ledgerline.com',
    fullName: 'Alex Morgan',
    enabled: true,
    roles: ['ROLE_ACCOUNT_HOLDER'],
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'usr-elena-001',
    username: 'elena',
    email: 'elena.partner@ledgerline.com',
    fullName: 'Elena Vance',
    enabled: true,
    roles: ['ROLE_ACCOUNT_HOLDER'],
    createdAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'usr-sarah-001',
    username: 'sarah',
    email: 'sarah.auditor@ledgerline.com',
    fullName: 'Sarah Chen (Lead Auditor)',
    enabled: true,
    roles: ['ROLE_AUDITOR'],
    createdAt: '2026-01-04T00:00:00Z',
  },
];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    userId: 'usr-alex-001',
    ownerName: 'Alex Morgan',
    name: 'Primary Checking',
    accountType: 'CHECKING',
    status: 'ACTIVE',
    currency: 'INR',
    balance: 145250.0,
    dailyLimit: 100000,
    perTransactionLimit: 50000,
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'acc-alex-sav',
    accountNumber: 'LL-SAV-99201482',
    userId: 'usr-alex-001',
    ownerName: 'Alex Morgan',
    name: 'High-Yield Savings',
    accountType: 'SAVINGS',
    status: 'ACTIVE',
    currency: 'INR',
    balance: 350000.0,
    dailyLimit: 200000,
    perTransactionLimit: 100000,
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'acc-elena-chk',
    accountNumber: 'LL-CHK-88991201',
    userId: 'usr-elena-001',
    ownerName: 'Elena Vance',
    name: 'Corporate Operating',
    accountType: 'CHECKING',
    status: 'ACTIVE',
    currency: 'INR',
    balance: 220000.0,
    dailyLimit: 500000,
    perTransactionLimit: 250000,
    createdAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'acc-sys-clearing',
    accountNumber: 'SYS-CLEARING-INR-001',
    userId: 'usr-admin-001',
    ownerName: 'BalanceVault System Clearing',
    name: 'Central Clearing Reserve',
    accountType: 'SYSTEM_CLEARING',
    status: 'ACTIVE',
    currency: 'INR',
    balance: 10000000.0,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    transactionReference: 'TXN-DEP-20260201-001',
    transactionType: 'DEPOSIT',
    destinationAccountId: 'acc-alex-chk',
    destinationAccountNumber: 'LL-CHK-10029384',
    amount: 150000.0,
    currency: 'INR',
    status: 'POSTED',
    description: 'Initial account funding from Reserve Clearing',
    initiatedByUsername: 'alex',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'tx-102',
    transactionReference: 'TXN-XFER-20260202-002',
    transactionType: 'TRANSFER',
    sourceAccountId: 'acc-alex-chk',
    sourceAccountNumber: 'LL-CHK-10029384',
    destinationAccountId: 'acc-elena-chk',
    destinationAccountNumber: 'LL-CHK-88991201',
    amount: 12000.0,
    currency: 'INR',
    status: 'POSTED',
    description: 'Vendor consulting fee settlement',
    initiatedByUsername: 'alex',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tx-103',
    transactionReference: 'TXN-WDL-20260203-003',
    transactionType: 'WITHDRAWAL',
    sourceAccountId: 'acc-alex-chk',
    sourceAccountNumber: 'LL-CHK-10029384',
    amount: 5000.0,
    currency: 'INR',
    status: 'POSTED',
    description: 'External disbursements transfer',
    initiatedByUsername: 'alex',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'tx-104',
    transactionReference: 'TXN-DEP-20260204-004',
    transactionType: 'DEPOSIT',
    destinationAccountId: 'acc-alex-sav',
    destinationAccountNumber: 'LL-SAV-99201482',
    amount: 350000.0,
    currency: 'INR',
    status: 'POSTED',
    description: 'High-Yield capital allocation',
    initiatedByUsername: 'alex',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'tx-105',
    transactionReference: 'TXN-DEP-20260205-005',
    transactionType: 'DEPOSIT',
    destinationAccountId: 'acc-alex-chk',
    destinationAccountNumber: 'LL-CHK-10029384',
    amount: 12250.0,
    currency: 'INR',
    status: 'POSTED',
    description: 'Invoice reimbursement',
    initiatedByUsername: 'alex',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'led-1',
    accountId: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    entryType: 'CREDIT',
    amount: 150000.0,
    runningBalance: 150000.0,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'led-2',
    accountId: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    entryType: 'DEBIT',
    amount: 12000.0,
    runningBalance: 138000.0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'led-3',
    accountId: 'acc-elena-chk',
    accountNumber: 'LL-CHK-88991201',
    entryType: 'CREDIT',
    amount: 12000.0,
    runningBalance: 220000.0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'led-4',
    accountId: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    entryType: 'DEBIT',
    amount: 5000.0,
    runningBalance: 133000.0,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'led-5',
    accountId: 'acc-alex-sav',
    accountNumber: 'LL-SAV-99201482',
    entryType: 'CREDIT',
    amount: 350000.0,
    runningBalance: 350000.0,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'led-6',
    accountId: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    entryType: 'CREDIT',
    amount: 12250.0,
    runningBalance: 145250.0,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Payment Dispatched',
    message: '₹12,000.00 successfully transferred to Elena Vance (LL-CHK-88991201).',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Deposit Received',
    message: '₹12,250.00 credited to Primary Checking from external reserve.',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Security Verification Notice',
    message: 'Stateless JWT session authenticated with valid HMAC-SHA256 signature.',
    type: 'INFO',
    read: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_RISK_FLAGS: RiskFlag[] = [
  {
    id: 'risk-1',
    ruleName: 'RAPID_VELOCITY_DETECTION',
    severity: 'MEDIUM',
    description: 'Account LL-CHK-10029384 initiated multiple outbound disbursements within standard inspection window.',
    resolved: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'risk-2',
    ruleName: 'HIGH_VALUE_THRESHOLD',
    severity: 'LOW',
    description: 'High-Yield capital allocation of ₹350,000.00 cleared compliance validation without variance.',
    resolved: true,
    resolvedByUsername: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const INITIAL_ADJUSTMENTS: AdjustmentRequest[] = [
  {
    id: 'adj-1',
    accountId: 'acc-alex-chk',
    accountNumber: 'LL-CHK-10029384',
    adjustmentType: 'CREDIT',
    amount: 2500.0,
    reason: 'Correction for disputed inter-bank wire fee surcharge',
    status: 'PENDING',
    requestedByUsername: 'admin',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'adj-2',
    accountId: 'acc-alex-sav',
    accountNumber: 'LL-SAV-99201482',
    adjustmentType: 'CREDIT',
    amount: 1200.0,
    reason: 'Quarterly accrued interest compensation adjustment',
    status: 'APPROVED',
    requestedByUsername: 'admin',
    approvedByUsername: 'sarah',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const INITIAL_FAILED_ATTEMPTS: FailedAttempt[] = [
  {
    id: 'fail-1',
    correlationId: 'CORR-REFUSED-001',
    username: 'alex',
    accountId: 'acc-alex-chk',
    requestedOperation: 'WITHDRAWAL',
    amount: 950000.0,
    failureReason: 'Insufficient available funds. Non-negative table constraint prevented overdraft.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'fail-2',
    correlationId: 'CORR-AUTH-002',
    username: 'intruder',
    requestedOperation: 'AUTHENTICATION_LOGIN',
    failureReason: 'Bad credentials supplied. Failure recorded in immutable audit log.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    user: { id: 'usr-admin-001', username: 'admin' },
    action: 'USER_LOGIN_SUCCESS',
    resourceType: 'AUTHENTICATION',
    resourceId: 'usr-admin-001',
    details: 'Administrator authenticated with MFA and HMAC-SHA256 bearer token.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'aud-2',
    user: { id: 'usr-alex-001', username: 'alex' },
    action: 'TRANSFER_EXECUTED',
    resourceType: 'TRANSACTION',
    resourceId: 'tx-102',
    details: 'Double-entry transfer posted: LL-CHK-10029384 -> LL-CHK-88991201 (₹12,000.00)',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'aud-3',
    user: { id: 'usr-sarah-001', username: 'sarah' },
    action: 'AUDIT_INTEGRITY_CHECK',
    resourceType: 'RECONCILIATION',
    details: 'Zero mathematical variance verified across 4 monitored financial accounts.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

class MockEngine {
  private state: MockState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const fresh: MockState = {
      users: [...INITIAL_USERS],
      accounts: [...INITIAL_ACCOUNTS],
      transactions: [...INITIAL_TRANSACTIONS],
      ledgerEntries: [...INITIAL_LEDGER],
      notifications: [...INITIAL_NOTIFICATIONS],
      riskFlags: [...INITIAL_RISK_FLAGS],
      adjustments: [...INITIAL_ADJUSTMENTS],
      failedAttempts: [...INITIAL_FAILED_ATTEMPTS],
      auditEvents: [...INITIAL_AUDIT_EVENTS],
    };
    this.saveState(fresh);
    return fresh;
  }

  private saveState(state: MockState) {
    this.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  private getCurrentUser(): User {
    const raw = localStorage.getItem('ledgerline_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return this.state.users[1]; // default alex
  }

  public handleRequest<T>(endpoint: string, options: RequestInit = {}): T {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};
    const url = new URL(`http://localhost${endpoint}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // --- AUTH ---
    if (pathname === '/auth/login' && method === 'POST') {
      const { username } = body;
      const user =
        this.state.users.find(
          (u) =>
            u.username.toLowerCase() === (username || '').toLowerCase() ||
            u.email.toLowerCase() === (username || '').toLowerCase()
        ) || {
          id: `usr-${Date.now()}`,
          username: username || 'user',
          email: `${username || 'user'}@ledgerline.com`,
          fullName: username?.toUpperCase() || 'Demo User',
          enabled: true,
          roles: ['ROLE_ACCOUNT_HOLDER'],
          createdAt: new Date().toISOString(),
        };

      const res: AuthResponse = {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        tokenType: 'Bearer',
        user: user as User,
      };
      return res as unknown as T;
    }

    if (pathname === '/auth/register' && method === 'POST') {
      const { username, email, fullName } = body;
      const newUser: User = {
        id: `usr-${Date.now()}`,
        username,
        email,
        fullName,
        enabled: true,
        roles: ['ROLE_ACCOUNT_HOLDER'],
        createdAt: new Date().toISOString(),
      };
      this.state.users.push(newUser);

      // Provision primary checking account
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        accountNumber: `LL-CHK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        userId: newUser.id,
        ownerName: fullName,
        name: 'Primary Checking',
        accountType: 'CHECKING',
        status: 'ACTIVE',
        currency: 'INR',
        balance: 10000.0,
        dailyLimit: 100000,
        perTransactionLimit: 50000,
        createdAt: new Date().toISOString(),
      };
      this.state.accounts.push(newAcc);

      // Initial funding ledger
      this.state.ledgerEntries.push({
        id: `led-${Date.now()}`,
        accountId: newAcc.id,
        accountNumber: newAcc.accountNumber,
        entryType: 'CREDIT',
        amount: 10000.0,
        runningBalance: 10000.0,
        createdAt: new Date().toISOString(),
      });

      this.saveState(this.state);

      const res: AuthResponse = {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        tokenType: 'Bearer',
        user: newUser,
      };
      return res as unknown as T;
    }

    if (pathname === '/auth/me' && method === 'GET') {
      return this.getCurrentUser() as unknown as T;
    }

    if (pathname === '/auth/logout' && method === 'POST') {
      return {} as unknown as T;
    }

    // --- ACCOUNTS ---
    if (pathname === '/accounts' && method === 'GET') {
      const user = this.getCurrentUser();
      const accounts = this.state.accounts.filter((a) => a.userId === user.id);
      return (accounts.length > 0 ? accounts : this.state.accounts.slice(0, 2)) as unknown as T;
    }

    if (pathname === '/accounts' && method === 'POST') {
      const user = this.getCurrentUser();
      const { name, accountType } = body;
      const prefix = accountType === 'SAVINGS' ? 'SAV' : accountType === 'ESCROW' ? 'ESC' : 'CHK';
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        accountNumber: `LL-${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`,
        userId: user.id,
        ownerName: user.fullName,
        name: name || 'Custom Account',
        accountType: accountType || 'CHECKING',
        status: 'ACTIVE',
        currency: 'INR',
        balance: 0.0,
        dailyLimit: 100000,
        perTransactionLimit: 50000,
        createdAt: new Date().toISOString(),
      };
      this.state.accounts.push(newAcc);
      this.saveState(this.state);
      return newAcc as unknown as T;
    }

    if (pathname.match(/^\/accounts\/[^/]+$/) && method === 'GET') {
      const id = pathname.split('/')[2];
      const acc = this.state.accounts.find((a) => a.id === id || a.accountNumber === id) || this.state.accounts[0];
      return acc as unknown as T;
    }

    if (pathname.match(/^\/accounts\/[^/]+\/limits$/) && method === 'PUT') {
      const id = pathname.split('/')[2];
      const acc = this.state.accounts.find((a) => a.id === id);
      if (acc) {
        acc.dailyLimit = body.dailyLimit;
        acc.perTransactionLimit = body.perTransactionLimit;
        this.saveState(this.state);
      }
      return {} as unknown as T;
    }

    if (pathname.match(/^\/accounts\/[^/]+\/statement$/) && method === 'GET') {
      const id = pathname.split('/')[2];
      const acc = this.state.accounts.find((a) => a.id === id || a.accountNumber === id) || this.state.accounts[0];
      const entries = this.state.ledgerEntries.filter((e) => e.accountId === acc.id || e.accountNumber === acc.accountNumber);

      const credits = entries.filter((e) => e.entryType === 'CREDIT').reduce((accVal, e) => accVal + e.amount, 0);
      const debits = entries.filter((e) => e.entryType === 'DEBIT').reduce((accVal, e) => accVal + e.amount, 0);

      const stmt: Statement = {
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        accountName: acc.name,
        currency: acc.currency,
        periodEnd: new Date().toISOString(),
        openingBalance: 0,
        closingBalance: acc.balance,
        totalCredits: credits,
        totalDebits: debits,
        entries,
      };
      return stmt as unknown as T;
    }

    // --- TRANSACTIONS ---
    if (pathname === '/transactions/dashboard' && method === 'GET') {
      const user = this.getCurrentUser();
      const userAccounts = this.state.accounts.filter((a) => a.userId === user.id);
      const accs = userAccounts.length > 0 ? userAccounts : this.state.accounts.slice(0, 2);
      const totalBalance = accs.reduce((sum, a) => sum + a.balance, 0);

      const summary: DashboardSummary = {
        totalBalance,
        totalIncoming: 512250.0,
        totalOutgoing: 17000.0,
        totalTransfers: this.state.transactions.length,
        accounts: accs,
        recentTransactions: this.state.transactions.slice(0, 10),
      };
      return summary as unknown as T;
    }

    if (pathname === '/transactions' && method === 'GET') {
      return this.state.transactions as unknown as T;
    }

    if (pathname === '/transactions/transfer' && method === 'POST') {
      const user = this.getCurrentUser();
      const { sourceAccountId, destinationAccountNumber, amount, description } = body;
      const numAmount = parseFloat(amount);

      const source = this.state.accounts.find((a) => a.id === sourceAccountId);
      if (!source || source.balance < numAmount) {
        const fail: FailedAttempt = {
          id: `fail-${Date.now()}`,
          correlationId: `CORR-XFER-${Date.now()}`,
          username: user.username,
          accountId: sourceAccountId,
          requestedOperation: 'TRANSFER',
          amount: numAmount,
          failureReason: `Insufficient available funds in account ${source?.accountNumber || 'unknown'}. Overdrafts prohibited.`,
          createdAt: new Date().toISOString(),
        };
        this.state.failedAttempts.unshift(fail);
        this.saveState(this.state);
        throw new Error(fail.failureReason);
      }

      const dest = this.state.accounts.find(
        (a) => a.accountNumber.toLowerCase() === (destinationAccountNumber || '').trim().toLowerCase()
      );

      source.balance -= numAmount;
      if (dest) {
        dest.balance += numAmount;
      }

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionReference: `TXN-XFER-${Date.now().toString().slice(-8)}`,
        transactionType: 'TRANSFER',
        sourceAccountId: source.id,
        sourceAccountNumber: source.accountNumber,
        destinationAccountId: dest?.id,
        destinationAccountNumber: destinationAccountNumber.trim(),
        amount: numAmount,
        currency: 'INR',
        status: 'POSTED',
        description: description || 'Account Transfer',
        initiatedByUsername: user.username,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      this.state.transactions.unshift(tx);

      // Ledger Postings
      this.state.ledgerEntries.unshift({
        id: `led-deb-${Date.now()}`,
        accountId: source.id,
        accountNumber: source.accountNumber,
        entryType: 'DEBIT',
        amount: numAmount,
        runningBalance: source.balance,
        createdAt: new Date().toISOString(),
      });

      if (dest) {
        this.state.ledgerEntries.unshift({
          id: `led-cred-${Date.now()}`,
          accountId: dest.id,
          accountNumber: dest.accountNumber,
          entryType: 'CREDIT',
          amount: numAmount,
          runningBalance: dest.balance,
          createdAt: new Date().toISOString(),
        });
      }

      this.state.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Transfer Posted',
        message: `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} transferred from ${source.accountNumber} to ${destinationAccountNumber}.`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString(),
      });

      this.saveState(this.state);
      return tx as unknown as T;
    }

    if (pathname === '/transactions/deposit' && method === 'POST') {
      const user = this.getCurrentUser();
      const { accountId, amount, description } = body;
      const numAmount = parseFloat(amount);

      const target = this.state.accounts.find((a) => a.id === accountId);
      if (!target) throw new Error('Target account not found.');

      target.balance += numAmount;

      const clearing = this.state.accounts.find((a) => a.accountType === 'SYSTEM_CLEARING');
      if (clearing) clearing.balance -= numAmount;

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionReference: `TXN-DEP-${Date.now().toString().slice(-8)}`,
        transactionType: 'DEPOSIT',
        destinationAccountId: target.id,
        destinationAccountNumber: target.accountNumber,
        amount: numAmount,
        currency: 'INR',
        status: 'POSTED',
        description: description || 'Funding deposit',
        initiatedByUsername: user.username,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      this.state.transactions.unshift(tx);

      this.state.ledgerEntries.unshift({
        id: `led-${Date.now()}`,
        accountId: target.id,
        accountNumber: target.accountNumber,
        entryType: 'CREDIT',
        amount: numAmount,
        runningBalance: target.balance,
        createdAt: new Date().toISOString(),
      });

      this.state.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Deposit Completed',
        message: `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} credited to ${target.name}.`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString(),
      });

      this.saveState(this.state);
      return tx as unknown as T;
    }

    if (pathname === '/transactions/withdraw' && method === 'POST') {
      const user = this.getCurrentUser();
      const { accountId, amount, description } = body;
      const numAmount = parseFloat(amount);

      const source = this.state.accounts.find((a) => a.id === accountId);
      if (!source || source.balance < numAmount) {
        const failMsg = `Cannot withdraw ₹${numAmount.toLocaleString()}. Available balance is ₹${source?.balance.toLocaleString() || 0}. Negative balances are strictly forbidden.`;
        this.state.failedAttempts.unshift({
          id: `fail-${Date.now()}`,
          correlationId: `CORR-WDL-${Date.now()}`,
          username: user.username,
          accountId,
          requestedOperation: 'WITHDRAWAL',
          amount: numAmount,
          failureReason: failMsg,
          createdAt: new Date().toISOString(),
        });
        this.saveState(this.state);
        throw new Error(failMsg);
      }

      source.balance -= numAmount;

      const clearing = this.state.accounts.find((a) => a.accountType === 'SYSTEM_CLEARING');
      if (clearing) clearing.balance += numAmount;

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        transactionReference: `TXN-WDL-${Date.now().toString().slice(-8)}`,
        transactionType: 'WITHDRAWAL',
        sourceAccountId: source.id,
        sourceAccountNumber: source.accountNumber,
        amount: numAmount,
        currency: 'INR',
        status: 'POSTED',
        description: description || 'Withdrawal disbursement',
        initiatedByUsername: user.username,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      this.state.transactions.unshift(tx);

      this.state.ledgerEntries.unshift({
        id: `led-${Date.now()}`,
        accountId: source.id,
        accountNumber: source.accountNumber,
        entryType: 'DEBIT',
        amount: numAmount,
        runningBalance: source.balance,
        createdAt: new Date().toISOString(),
      });

      this.saveState(this.state);
      return tx as unknown as T;
    }

    // --- NOTIFICATIONS ---
    if (pathname === '/notifications' && method === 'GET') {
      return this.state.notifications as unknown as T;
    }

    if (pathname === '/notifications/unread-count' && method === 'GET') {
      const unreadCount = this.state.notifications.filter((n) => !n.read).length;
      return { unreadCount } as unknown as T;
    }

    if (pathname.match(/^\/notifications\/[^/]+\/read$/) && method === 'PATCH') {
      const id = pathname.split('/')[2];
      const notif = this.state.notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
      this.saveState(this.state);
      return {} as unknown as T;
    }

    if (pathname === '/notifications/read-all' && method === 'POST') {
      this.state.notifications.forEach((n) => (n.read = true));
      this.saveState(this.state);
      return {} as unknown as T;
    }

    // --- ADMIN ---
    if (pathname === '/admin/dashboard' && method === 'GET') {
      const totalBalance = this.state.accounts.reduce((sum, a) => sum + a.balance, 0);
      const summary: DashboardSummary = {
        totalBalance,
        totalIncoming: 950000.0,
        totalOutgoing: 42000.0,
        totalTransfers: this.state.transactions.length,
        accounts: this.state.accounts,
        recentTransactions: this.state.transactions,
      };
      return summary as unknown as T;
    }

    if (pathname === '/admin/users' && method === 'GET') {
      return this.state.users as unknown as T;
    }

    if (pathname.match(/^\/admin\/users\/[^/]+\/status$/) && method === 'PATCH') {
      const id = pathname.split('/')[3];
      const enabled = searchParams.get('enabled') === 'true';
      const u = this.state.users.find((user) => user.id === id);
      if (u) u.enabled = enabled;
      this.saveState(this.state);
      return u as unknown as T;
    }

    if (pathname === '/admin/accounts' && method === 'GET') {
      return this.state.accounts as unknown as T;
    }

    if (pathname.match(/^\/admin\/accounts\/[^/]+\/freeze$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const acc = this.state.accounts.find((a) => a.id === id);
      if (acc) acc.status = 'FROZEN';
      this.saveState(this.state);
      return acc as unknown as T;
    }

    if (pathname.match(/^\/admin\/accounts\/[^/]+\/unfreeze$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const acc = this.state.accounts.find((a) => a.id === id);
      if (acc) acc.status = 'ACTIVE';
      this.saveState(this.state);
      return acc as unknown as T;
    }

    if (pathname === '/admin/adjustments' && method === 'GET') {
      return this.state.adjustments as unknown as T;
    }

    if (pathname === '/admin/adjustments/request' && method === 'POST') {
      const user = this.getCurrentUser();
      const { accountId, adjustmentType, amount, reason } = body;
      const acc = this.state.accounts.find((a) => a.id === accountId);
      const req: AdjustmentRequest = {
        id: `adj-${Date.now()}`,
        accountId,
        accountNumber: acc?.accountNumber || 'UNKNOWN',
        adjustmentType,
        amount: parseFloat(amount),
        reason,
        status: 'PENDING',
        requestedByUsername: user.username,
        createdAt: new Date().toISOString(),
      };
      this.state.adjustments.unshift(req);
      this.saveState(this.state);
      return req as unknown as T;
    }

    if (pathname.match(/^\/admin\/adjustments\/[^/]+\/review$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const user = this.getCurrentUser();
      const { decision } = body;
      const req = this.state.adjustments.find((a) => a.id === id);
      if (req) {
        req.status = decision;
        req.approvedByUsername = user.username;
        req.resolvedAt = new Date().toISOString();

        if (decision === 'APPROVED') {
          const acc = this.state.accounts.find((a) => a.id === req.accountId);
          if (acc) {
            if (req.adjustmentType === 'CREDIT') {
              acc.balance += req.amount;
            } else {
              acc.balance -= req.amount;
            }
            this.state.ledgerEntries.unshift({
              id: `led-adj-${Date.now()}`,
              accountId: acc.id,
              accountNumber: acc.accountNumber,
              entryType: req.adjustmentType === 'CREDIT' ? 'CREDIT' : 'DEBIT',
              amount: req.amount,
              runningBalance: acc.balance,
              createdAt: new Date().toISOString(),
            });
          }
        }
        this.saveState(this.state);
      }
      return req as unknown as T;
    }

    // --- AUDITOR ---
    if (pathname === '/auditor/reconciliation' && method === 'GET') {
      const report: ReconciliationReport = {
        verifiedAt: new Date().toISOString(),
        totalAccountsChecked: this.state.accounts.length,
        balancedAccountsCount: this.state.accounts.length,
        discrepancyCount: 0,
        totalJournalEntriesChecked: this.state.transactions.length,
        balancedJournalEntriesCount: this.state.transactions.length,
        fullyReconciled: true,
        statusMessage: '100% Mathematical Parity Verified. Zero Discrepancies Across All Monitored Accounts.',
        accountDiscrepancies: [],
        unbalancedJournalEntries: [],
      };
      return report as unknown as T;
    }

    if (pathname === '/auditor/ledger' && method === 'GET') {
      const accountId = searchParams.get('accountId');
      if (accountId) {
        return this.state.ledgerEntries.filter((e) => e.accountId === accountId) as unknown as T;
      }
      return this.state.ledgerEntries as unknown as T;
    }

    if (pathname === '/auditor/failed-attempts' && method === 'GET') {
      return this.state.failedAttempts as unknown as T;
    }

    if (pathname === '/auditor/audit-events' && method === 'GET') {
      return this.state.auditEvents as unknown as T;
    }

    // --- RISK ---
    if (pathname === '/risk/flags' && method === 'GET') {
      return this.state.riskFlags as unknown as T;
    }

    if (pathname.match(/^\/risk\/flags\/[^/]+\/resolve$/) && method === 'POST') {
      const id = pathname.split('/')[3];
      const flag = this.state.riskFlags.find((f) => f.id === id);
      if (flag) {
        flag.resolved = true;
        flag.resolvedByUsername = this.getCurrentUser().username;
        this.saveState(this.state);
      }
      return {} as unknown as T;
    }

    return {} as unknown as T;
  }

  public generateCsvBlob(accountId: string, fromDate?: string, toDate?: string): Blob {
    const acc = this.state.accounts.find((a) => a.id === accountId) || this.state.accounts[0];
    let entries = this.state.ledgerEntries.filter((e) => e.accountId === acc.id || e.accountNumber === acc.accountNumber);

    if (fromDate) {
      entries = entries.filter((e) => new Date(e.createdAt) >= new Date(fromDate));
    }
    if (toDate) {
      entries = entries.filter((e) => new Date(e.createdAt) <= new Date(toDate));
    }

    let csv = `BalanceVault Official Account Statement\n`;
    csv += `Account Number: ${acc.accountNumber}\n`;
    csv += `Account Name: ${acc.name}\n`;
    csv += `Owner: ${acc.ownerName}\n`;
    csv += `Currency: ${acc.currency}\n`;
    csv += `Generated At: ${new Date().toISOString()}\n`;
    csv += `Current Materialized Balance: ₹${acc.balance.toFixed(2)}\n\n`;
    csv += `Posting Date,Entry ID,Type,Amount (INR),Running Balance (INR)\n`;

    entries.forEach((e) => {
      csv += `"${new Date(e.createdAt).toLocaleString()}","${e.id}","${e.entryType}",${e.amount.toFixed(2)},${e.runningBalance.toFixed(2)}\n`;
    });

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }
}

export const mockEngine = new MockEngine();
