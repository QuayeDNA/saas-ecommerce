// src/components/notifications/NotificationManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Button, 
  Card, 
  CardBody,
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
  const loadNotifications = async (page = 1, filterType = filter) => {
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
  };

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
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">All Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearRead}
              disabled={isLoading}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Clear Read</span>
              <span className="sm:hidden">Read</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">All</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <FaTimes size={18} />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center flex-shrink-0 gap-2">
              <FaFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('all')}
                className="text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('unread')}
                className="text-xs sm:text-sm"
              >
                Unread
              </Button>
              <Button
                size="sm"
                variant={filter === 'read' ? 'primary' : 'secondary'}
                onClick={() => handleFilterChange('read')}
                className="text-xs sm:text-sm"
              >
                Read
              </Button>
            </div>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center flex-shrink-0 gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDeleteSelected}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                <FaTrash className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="sm:hidden">Delete</span>
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <Alert status="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        <div className="space-y-2 max-h-96 sm:max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm sm:text-base">No notifications found</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === allNotifications.length && allNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm text-gray-600">Select All</span>
              </div>

              {/* Notifications */}
              {allNotifications.map((notification) => (
                <Card variant="outlined" key={notification._id} className="hover:bg-gray-50">
                  <CardBody className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleNotificationSelect(notification._id)}
                        className="mt-1 rounded border-gray-300 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {notification.metadata?.navigationLink && (
                              <FaExternalLinkAlt className="w-2 h-2 sm:w-3 sm:h-3 text-blue-500 flex-shrink-0" />
                            )}
                            {!notification.read && (
                              <Badge colorScheme="info" size="sm">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleNotificationClick(notification)}
                          title="View"
                          className="p-2 sm:p-2 min-w-0"
                        >
                          <FaExternalLinkAlt className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => notification.read ? markAsUnread(notification._id) : markAsRead(notification._id)}
                          title={notification.read ? 'Mark as unread' : 'Mark as read'}
                          className="p-2 sm:p-2 min-w-0"
                        >
                          {notification.read ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification._id)}
                          className="text-red-600 hover:text-red-700 p-2 sm:p-2 min-w-0"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} notifications
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-xs sm:text-sm"
              >
                <FaChevronLeft className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600">
                {currentPage} / {pagination.pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="p-4 sm:p-6">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}; 