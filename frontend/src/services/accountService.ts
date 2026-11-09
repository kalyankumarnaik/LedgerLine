import { apiClient, API_BASE_URL } from './apiClient';
import { Account, Statement } from '../types';
import { mockEngine } from './mockEngine';

export const accountService = {
  async getMyAccounts(): Promise<Account[]> {
    return apiClient.get<Account[]>('/accounts');
  },

  async getAccountById(id: string): Promise<Account> {
    return apiClient.get<Account>(`/accounts/${id}`);
  },

  async createAccount(data: { name: string; accountType: string; currency?: string }): Promise<Account> {
    return apiClient.post<Account>('/accounts', data);
  },

  async getStatement(accountId: string, fromDate?: string, toDate?: string): Promise<Statement> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Statement>(`/accounts/${accountId}/statement${query}`);
  },

  async updateLimits(accountId: string, data: { dailyLimit: number; perTransactionLimit: number }): Promise<void> {
    return apiClient.put<void>(`/accounts/${accountId}/limits`, data);
  },

  async exportStatementCsv(accountId: string, fromDate?: string, toDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';

    const token = localStorage.getItem('ledgerline_token');
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/statement/export${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to export statement from backend');
      return await response.blob();
    } catch {
      return mockEngine.generateCsvBlob(accountId, fromDate, toDate);
    }
  },
};
