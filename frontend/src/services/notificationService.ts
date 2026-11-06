import { apiClient } from './apiClient';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.unreadCount;
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.patch<void>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post<void>('/notifications/read-all');
  },
};
