// src/services/notification.service.ts
import { apiClient } from '../utils/api-client';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination?: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    pages: number;
  };
}

export interface NotificationCountResponse {
  success: boolean;
  count: number;
}

class NotificationService {
  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    const response = await apiClient.get('/api/notifications/unread', {
      params: { page, limit }
    });
    return response.data;
  }

  /**
   * Get all notifications (both read and unread)
   */
  async getAllNotifications(page = 1, limit = 50, read?: boolean): Promise<NotificationResponse> {
    const params: any = { page, limit };
    if (read !== undefined) {
      params.read = read;
    }
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  }

  /**
   * Mark a notification as unread
   */
  async markNotificationAsUnread(notificationId: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await apiClient.patch(`/api/notifications/${notificationId}/unread`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch('/api/notifications/read-all');
    return response.data;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/notifications/${notificationId}`);
    return response.data;
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds: string[]): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/api/notifications/delete-multiple', {
      notificationIds
    });
    return response.data;
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/api/notifications/clear-read');
    return response.data;
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/api/notifications/clear-all');
    return response.data;
  }

  /**
   * Get notification count for badge
   */
  async getNotificationCount(): Promise<NotificationCountResponse> {
    const response = await apiClient.get('/api/notifications/count');
    return response.data;
  }
}

export const notificationService = new NotificationService(); 