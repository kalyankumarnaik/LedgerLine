export type RoleName = 'ROLE_ADMIN' | 'ROLE_ACCOUNT_HOLDER' | 'ROLE_AUDITOR';
export type AccountType = 'CHECKING' | 'SAVINGS' | 'ESCROW' | 'SYSTEM_CLEARING';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'RESTRICTED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'POSTED' | 'REJECTED' | 'FAILED';
export type EntryType = 'DEBIT' | 'CREDIT';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  roles: RoleName[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface Account {
  id: string;
  accountNumber: string;
  userId: string;
  ownerName: string;
  name: string;
  accountType: AccountType;
  status: AccountStatus;
  currency: string;
  balance: number;
  dailyLimit?: number;
  perTransactionLimit?: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionReference: string;
  transactionType: TransactionType;
  sourceAccountId?: string;
  sourceAccountNumber?: string;
  destinationAccountId?: string;
  destinationAccountNumber?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  initiatedByUsername: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  accountNumber: string;
  entryType: EntryType;
  amount: number;
  runningBalance: number;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  entryReference: string;
  description?: string;
  postedAt: string;
  ledgerEntries: LedgerEntry[];
}

export interface Statement {
  accountId: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  periodStart?: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  entries: LedgerEntry[];
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  totalTransfers: number;
  pendingTransfers?: number;
  failedTransfers?: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlyVolume?: Record<string, number>;
}

export interface ReconciliationReport {
  verifiedAt: string;
  totalAccountsChecked: number;
  balancedAccountsCount: number;
  discrepancyCount: number;
  totalJournalEntriesChecked: number;
  balancedJournalEntriesCount: number;
  fullyReconciled: boolean;
  statusMessage: string;
  accountDiscrepancies: Array<{
    accountId: string;
    accountNumber: string;
    accountName: string;
    materializedBalance: number;
    ledgerDerivedBalance: number;
    variance: number;
  }>;
  unbalancedJournalEntries: Array<{
    journalEntryId: string;
    entryReference: string;
    totalDebit: number;
    totalCredit: number;
    imbalance: number;
  }>;
}

export interface FailedAttempt {
  id: string;
  correlationId: string;
  username: string;
  accountId?: string;
  requestedOperation: string;
  amount?: number;
  idempotencyKey?: string;
  failureReason: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  user?: { id: string; username: string };
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface RiskFlag {
  id: string;
  transactionId?: string;
  accountId?: string;
  severity: RiskSeverity;
  ruleName: string;
  description: string;
  resolved: boolean;
  resolvedByUsername?: string;
  createdAt: string;
}

export interface AdjustmentRequest {
  id: string;
  accountId: string;
  accountNumber: string;
  adjustmentType: string;
  amount: number;
  reason: string;
  status: AdjustmentStatus;
  requestedByUsername: string;
  approvedByUsername?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
