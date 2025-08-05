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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    } catch {
      setError('Failed to fetch notifications');
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
    } catch {
      setError('Failed to fetch all notifications');
      return { notifications: [], pagination: undefined };
    }
  }, [authState.isAuthenticated]);

  const refreshCount = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const response = await notificationService.getNotificationCount();
      setUnreadCount(response.count);
    } catch {
      // Error fetching notification count
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
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Show success toast
      addToast('Notification marked as read', 'success');
    } catch {
      // Error marking notification as read
    }
  }, [addToast]);

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
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show success toast
      addToast('Notification marked as unread', 'success');
    } catch {
      // Error marking notification as unread
    }
  }, [addToast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Show success toast
      addToast('All notifications marked as read', 'success');
    } catch {
      // Error marking all notifications as read
    }
  }, [addToast]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Show success toast
      addToast('Notification deleted', 'success');
    } catch {
      // Error deleting notification
    }
  }, [notifications, addToast]);

  const deleteMultipleNotifications = useCallback(async (notificationIds: string[]) => {
    try {
      await notificationService.deleteMultipleNotifications(notificationIds);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification._id))
      );
      
      // Update unread count
      const deletedUnreadCount = notifications
        .filter(notification => 
          notificationIds.includes(notification._id) && !notification.read
        ).length;
      
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      
      // Show success toast
      addToast(`${notificationIds.length} notifications deleted`, 'success');
    } catch {
      // Error deleting notifications
    }
  }, [notifications, addToast]);

  const clearReadNotifications = useCallback(async () => {
    try {
      await notificationService.clearReadNotifications();
      
      // Update local state - remove read notifications
      setNotifications(prev => prev.filter(notification => !notification.read));
      
      // Show success toast
      addToast('Read notifications cleared', 'success');
    } catch {
      // Error clearing read notifications
    }
  }, [addToast]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
      
      // Show success toast
      addToast('All notifications cleared', 'success');
    } catch {
      // Error clearing all notifications
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