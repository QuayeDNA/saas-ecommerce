// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '../services/notification.service';
import { websocketService } from '../services/websocket.service';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../design-system/components/toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchAllNotifications: (page?: number, limit?: number, read?: boolean) => Promise<{ notifications: Notification[]; pagination?: any }>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteMultipleNotifications: (notificationIds: string[]) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const { addToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationService.getUnreadNotifications();
      setNotifications(response.notifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const fetchAllNotifications = useCallback(async (page = 1, limit = 50, read?: boolean) => {
    if (!authState.isAuthenticated) return { notifications: [], pagination: undefined };

    try {
      const response = await notificationService.getAllNotifications(page, limit, read);
      return {
        notifications: response.notifications,
        pagination: response.pagination
      };
    } catch (err) {
      setError('Failed to fetch all notifications');
      console.error('Error fetching all notifications:', err);
      return { notifications: [], pagination: undefined };
    }
  }, [authState.isAuthenticated]);

  const refreshCount = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const response = await notificationService.getNotificationCount();
      setUnreadCount(response.count);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, [authState.isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Refresh count
      await refreshCount();
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  }, [refreshCount]);

  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsUnread(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: false }
            : notification
        )
      );
      
      // Refresh count
      await refreshCount();
    } catch (err) {
      setError('Failed to mark notification as unread');
      console.error('Error marking notification as unread:', err);
    }
  }, [refreshCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Refresh count
      await refreshCount();
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, [refreshCount]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Refresh count
      await refreshCount();
      
      addToast('Notification deleted successfully', 'success');
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
      addToast('Failed to delete notification', 'error');
    }
  }, [refreshCount, addToast]);

  const deleteMultipleNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      await notificationService.deleteMultipleNotifications(notificationIds);
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification._id))
      );
      
      // Refresh count
      await refreshCount();
      
      addToast(`${notificationIds.length} notifications deleted successfully`, 'success');
    } catch (err) {
      setError('Failed to delete notifications');
      console.error('Error deleting notifications:', err);
      addToast('Failed to delete notifications', 'error');
    }
  }, [refreshCount, addToast]);

  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationService.clearReadNotifications();
      
      // Remove read notifications from local state
      setNotifications(prev => prev.filter(notification => !notification.read));
      
      addToast('Read notifications cleared successfully', 'success');
    } catch (err) {
      setError('Failed to clear read notifications');
      console.error('Error clearing read notifications:', err);
      addToast('Failed to clear read notifications', 'error');
    }
  }, [addToast]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();
      
      // Clear all notifications from local state
      setNotifications([]);
      setUnreadCount(0);
      
      addToast('All notifications cleared successfully', 'success');
    } catch (err) {
      setError('Failed to clear all notifications');
      console.error('Error clearing all notifications:', err);
      addToast('Failed to clear all notifications', 'error');
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchNotifications();
      refreshCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [authState.isAuthenticated, fetchNotifications, refreshCount]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user?._id) return;

    // Connect to WebSocket
    websocketService.connect(authState.user._id);

    // Listen for real-time notifications
    const handleNotification = (data: unknown) => {
      // Type guard to ensure data has the expected structure
      if (typeof data === 'object' && data !== null && 'type' in data && 'notification' in data) {
        const notificationData = data as { type: string; notification: Notification };
        
        if (notificationData.type === 'new_notification') {
          // Add new notification to the list
          setNotifications(prev => [notificationData.notification, ...prev]);
          // Update count
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification for new notifications
          addToast(
            `New notification: ${notificationData.notification.title}`,
            notificationData.notification.type === 'success' ? 'success' : 
            notificationData.notification.type === 'error' ? 'error' : 'info',
            3000
          );
        }
      }
    };

    websocketService.on('notification', handleNotification);

    // Cleanup on unmount
    return () => {
      websocketService.off('notification', handleNotification);
      websocketService.disconnect();
    };
  }, [authState.isAuthenticated, authState.user?._id]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchAllNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteMultipleNotifications,
    clearReadNotifications,
    clearAllNotifications,
    refreshCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 