// src/components/notifications/NotificationManagementModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Button, 
  Badge,
  Spinner,
  Alert
} from '../../design-system';
import { 
  FaBell, 
  FaCheck, 
  FaTimes, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaFilter,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../services/notification.service';

interface NotificationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationManagementModal: React.FC<NotificationManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    fetchAllNotifications, 
    deleteNotification, 
    deleteMultipleNotifications,
    clearReadNotifications,
    clearAllNotifications,
    markAsRead,
    markAsUnread
  } = useNotifications();
  
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    skip: number;
    total: number;
    pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load all notifications
  const loadNotifications = useCallback(async (page = 1, filterType = filter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const readFilter = filterType === 'read' ? true : filterType === 'unread' ? false : undefined;
      const result = await fetchAllNotifications(page, 20, readFilter);
      setAllNotifications(result.notifications || []);
      setPagination(result.pagination || null);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllNotifications, filter]);

  // Load notifications when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, filter);
    }
  }, [isOpen, filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSelectedNotifications([]);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadNotifications(page, filter);
  };

  // Handle notification selection
  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === allNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(allNotifications.filter(n => n?._id).map(n => n?._id));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      await deleteMultipleNotifications(selectedNotifications);
      setSelectedNotifications([]);
      loadNotifications(currentPage, filter);
    }
  };

  // Handle clear read
  const handleClearRead = async () => {
    if (window.confirm('Are you sure you want to clear all read notifications?')) {
      await clearReadNotifications();
      loadNotifications(currentPage, filter);
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      await clearAllNotifications();
      setAllNotifications([]);
      setSelectedNotifications([]);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate if navigation link exists
    if (notification.metadata?.navigationLink) {
      navigate(notification.metadata.navigationLink);
      onClose();
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-4 h-4 text-green-500" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <FaTimes className="w-4 h-4 text-yellow-500" />;
      default:
        return <FaBell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full" className="sm:max-w-4xl">
      <DialogHeader>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            All Notifications
          </h3>
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              disabled={isLoading}
              className="text-xs px-2 py-1 text-blue-600 hover:text-blue-700"
            >
              Clear Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="flex-1 overflow-hidden p-0">
        <div className="h-full flex flex-col">
          {/* Filters Section */}
          <div className="pb-3 border-b">
            <div className="flex flex-col gap-3">
              {/* Filter Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFilter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {selectedNotifications.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDeleteSelected}
                      disabled={isLoading}
                      className="text-xs px-2 py-1"
                    >
                      <FaTrash className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('all')}
                  className="text-sm flex-1 sm:flex-none"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'unread' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('unread')}
                  className="text-sm flex-1 sm:flex-none"
                >
                  Unread
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'read' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('read')}
                  className="text-sm flex-1 sm:flex-none"
                >
                  Read
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 py-2">
              <Alert status="error" className="text-sm">
                {error}
              </Alert>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h4 className="text-base font-medium text-gray-900 mb-1">No notifications found</h4>
                  <p className="text-sm text-gray-500">You're all caught up!</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Select All */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === allNotifications.length && allNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      Select All ({allNotifications.length})
                    </span>
                  </label>
                </div>

                {/* Notification Items */}
                {allNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleNotificationSelect(notification._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {notification.metadata?.navigationLink && (
                              <FaExternalLinkAlt className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            )}
                            {!notification.read && (
                              <Badge colorScheme="info" size="sm" className="ml-2">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleNotificationClick(notification)}
                            className="text-xs px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => notification.read ? markAsUnread(notification._id) : markAsRead(notification._id)}
                            className="text-xs px-3 py-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                          >
                            {notification.read ? (
                              <>
                                <FaEyeSlash className="w-3 h-3 mr-1" />
                                Mark Unread
                              </>
                            ) : (
                              <>
                                <FaEye className="w-3 h-3 mr-1" />
                                Mark Read
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <FaTrash className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col gap-3">
                <div className="text-xs text-gray-600 text-center">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} notifications
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-sm px-3 py-1"
                  >
                    <FaChevronLeft className="w-3 h-3 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {pagination.pages}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="text-sm px-3 py-1"
                  >
                    Next
                    <FaChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="w-full text-sm py-2"
        >
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}; 