import { apiClient } from './apiClient';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { username: string; email: string; password: string; fullName: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async login(data: { username: string; password: string }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout');
    } finally {
      apiClient.clearAuth();
    }
  },
};
