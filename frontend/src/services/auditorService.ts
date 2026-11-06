import { apiClient } from './apiClient';
import { AuditEvent, FailedAttempt, JournalEntry, LedgerEntry, ReconciliationReport } from '../types';

export const auditorService = {
  async getReconciliationReport(): Promise<ReconciliationReport> {
    return apiClient.get<ReconciliationReport>('/auditor/reconciliation');
  },

  async getJournalEntries(): Promise<JournalEntry[]> {
    return apiClient.get<JournalEntry[]>('/auditor/journal');
  },

  async getLedgerEntries(accountId?: string): Promise<LedgerEntry[]> {
    const query = accountId ? `?accountId=${accountId}` : '';
    return apiClient.get<LedgerEntry[]>(`/auditor/ledger${query}`);
  },

  async getFailedAttempts(): Promise<FailedAttempt[]> {
    return apiClient.get<FailedAttempt[]>('/auditor/failed-attempts');
  },

  async getAuditEvents(): Promise<AuditEvent[]> {
    return apiClient.get<AuditEvent[]>('/auditor/audit-events');
  },
};
