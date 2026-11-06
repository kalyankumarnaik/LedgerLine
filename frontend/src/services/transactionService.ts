import { apiClient } from './apiClient';
import { DashboardSummary, Transaction } from '../types';

export const transactionService = {
  async transfer(data: {
    sourceAccountId: string;
    destinationAccountNumber: string;
    amount: number;
    description?: string;
    idempotencyKey?: string;
  }): Promise<Transaction> {
    const key = data.idempotencyKey || `IDEMP-XFER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return apiClient.post<Transaction>('/transactions/transfer', data, key);
  },

  async deposit(data: {
    accountId: string;
    amount: number;
    description?: string;
    idempotencyKey?: string;
  }): Promise<Transaction> {
    const key = data.idempotencyKey || `IDEMP-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return apiClient.post<Transaction>('/transactions/deposit', data, key);
  },

  async withdraw(data: {
    accountId: string;
    amount: number;
    description?: string;
    idempotencyKey?: string;
  }): Promise<Transaction> {
    const key = data.idempotencyKey || `IDEMP-WDL-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return apiClient.post<Transaction>('/transactions/withdraw', data, key);
  },

  async getTransactions(accountId?: string): Promise<Transaction[]> {
    const query = accountId ? `?accountId=${accountId}` : '';
    return apiClient.get<Transaction[]>(`/transactions${query}`);
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/transactions/dashboard');
  },
};
