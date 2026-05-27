// src/components/notifications/NotificationManagementModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  Pagination,
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
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load all notifications
  const loadNotifications = useCallback(async (page = 1, filterType = filter, category = categoryFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      const readFilter = filterType === 'read' ? true : filterType === 'unread' ? false : undefined;
      const result = await fetchAllNotifications(page, 20, readFilter, category);
      setAllNotifications(result.notifications || []);
      setPagination(result.pagination || null);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllNotifications, filter, categoryFilter]);

  // Load notifications when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, filter, categoryFilter);
    }
  }, [isOpen, filter, categoryFilter]);

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSelectedNotifications([]);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category: string | undefined) => {
    setCategoryFilter(category);
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

  const getCreatorLabel = (notification: Notification) => {
    const creatorName = notification.metadata?.creatorName;
    const creatorAgentCode = notification.metadata?.creatorAgentCode;
    if (!creatorName && !creatorAgentCode) return null;
    if (creatorName && creatorAgentCode) {
      return `${creatorName} (${creatorAgentCode})`;
    }
    return creatorName || creatorAgentCode || null;
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-4 h-4 text-success" />;
      case 'error':
        return <FaTimes className="w-4 h-4 text-error" />;
      case 'warning':
        return <FaTimes className="w-4 h-4 text-warning" />;
      default:
        return <FaBell className="w-4 h-4 text-[var(--color-primary)]" />;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full" className="sm:max-w-4xl">
      <DialogHeader className="p-0">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <FaBell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">All Notifications</h3>
                <p className="text-xs text-white/80">Manage alerts and history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRead}
                disabled={isLoading}
                className="text-xs px-2 py-1 text-white/90 hover:text-white hover:bg-white/10"
              >
                Clear Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isLoading}
                className="text-xs px-2 py-1 text-white/90 hover:text-white hover:bg-white/10"
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white p-1"
              >
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="flex-1 overflow-hidden bg-[var(--bg-surface)]">
        <div className="h-full flex flex-col gap-4">
          {/* Filters Section */}
          <Card variant="outlined" size="sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFilter className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Filter</span>
                </div>
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-secondary)]">
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

              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('all')}
                  className="text-sm"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'unread' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('unread')}
                  className="text-sm"
                >
                  Unread
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'read' ? 'primary' : 'secondary'}
                  onClick={() => handleFilterChange('read')}
                  className="text-sm"
                >
                  Read
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: undefined, label: "All Categories", color: "bg-[var(--bg-surface-alt)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]" },
                  { value: "system", label: "System", color: "bg-[var(--bg-surface-alt)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]" },
                  { value: "order", label: "Order", color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20" },
                  { value: "wallet", label: "Wallet", color: "bg-success/10 text-success hover:bg-success/20" },
                  { value: "commission", label: "Commission", color: "bg-warning/10 text-warning hover:bg-warning/20" },
                  { value: "announcement", label: "Announcement", color: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20" },
                ].map((cat) => (
                  <button
                    key={cat.value || "all"}
                    onClick={() => handleCategoryFilterChange(cat.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      categoryFilter === cat.value
                        ? "ring-2 ring-primary-500 ring-offset-1 " + cat.color
                        : cat.color
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert status="error" className="text-sm">
              {error}
            </Alert>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-[var(--text-muted)]">Loading notifications...</p>
                </div>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaBell className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
                  <h4 className="text-base font-medium text-[var(--text-primary)] mb-1">No notifications found</h4>
                  <p className="text-sm text-[var(--text-muted)]">You're all caught up!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Select All */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === allNotifications.length && allNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="font-medium">Select All ({allNotifications.length})</span>
                </div>

                {/* Notification Items */}
                {allNotifications.map((notification) => {
                  const creatorLabel = getCreatorLabel(notification);
                  return (
                    <Card
                      key={notification._id}
                      variant="outlined"
                      size="sm"
                      className={!notification.read ? 'ring-1 ring-[var(--color-primary)]/30 bg-[var(--color-primary)]/5' : ''}
                    >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleNotificationSelect(notification._id)}
                          className="rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div className="flex-shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {notification.title}
                            </h4>
                            {notification.metadata?.navigationLink && (
                              <FaExternalLinkAlt className="w-3 h-3 text-[var(--color-primary)] flex-shrink-0" />
                            )}
                            {!notification.read && (
                              <Badge colorScheme="info" size="sm" className="ml-2">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {creatorLabel && (
                          <p className="text-xs text-[var(--text-muted)] mb-1">
                            Created by {creatorLabel}
                          </p>
                        )}
                        <p className="text-sm text-[var(--text-secondary)] mb-2 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleNotificationClick(notification)}
                            className="text-xs px-3 py-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary)]/10"
                          >
                            <FaExternalLinkAlt className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => notification.read ? markAsUnread(notification._id) : markAsRead(notification._id)}
                            className="text-xs px-3 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
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
                            className="text-xs px-3 py-1 text-error hover:text-error hover:bg-error/10"
                          >
                            <FaTrash className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Card variant="outlined" size="sm">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={20}
                onPageChange={handlePageChange}
                showPerPageSelector={false}
                size="sm"
                variant="compact"
              />
            </Card>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="border-t border-[var(--border-color)] bg-[var(--bg-page)]">
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