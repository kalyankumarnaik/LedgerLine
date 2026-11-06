import { apiClient } from './apiClient';
import { Account, AdjustmentRequest, DashboardSummary, User } from '../types';

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/users');
  },

  async updateUserStatus(userId: string, enabled: boolean): Promise<User> {
    return apiClient.patch<User>(`/admin/users/${userId}/status?enabled=${enabled}`);
  },

  async getAllAccounts(): Promise<Account[]> {
    return apiClient.get<Account[]>('/admin/accounts');
  },

  async freezeAccount(accountId: string): Promise<Account> {
    return apiClient.post<Account>(`/admin/accounts/${accountId}/freeze`);
  },

  async unfreezeAccount(accountId: string): Promise<Account> {
    return apiClient.post<Account>(`/admin/accounts/${accountId}/unfreeze`);
  },

  async getAdminDashboard(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/admin/dashboard');
  },

  async getAdjustments(): Promise<AdjustmentRequest[]> {
    return apiClient.get<AdjustmentRequest[]>('/admin/adjustments');
  },

  async requestAdjustment(data: { accountId: string; adjustmentType: string; amount: number; reason: string }): Promise<AdjustmentRequest> {
    return apiClient.post<AdjustmentRequest>('/admin/adjustments/request', data);
  },

  async reviewAdjustment(id: string, data: { decision: 'APPROVED' | 'REJECTED'; comments?: string }): Promise<AdjustmentRequest> {
    return apiClient.post<AdjustmentRequest>(`/admin/adjustments/${id}/review`, data);
  },
};
