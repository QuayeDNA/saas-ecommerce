// src/components/notifications/NotificationDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { FaBell, FaCheck, FaTimes, FaSpinner, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button } from '../../design-system';
import { useNavigate } from 'react-router-dom';
import { NotificationManagementModal } from './NotificationManagementModal';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Handle keyboard navigation within notifications
  interface Notification {
    _id: string;
    metadata?: {
      navigationLink?: string;
      [key: string]: string | undefined;
    };
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification._id);

    // Navigate to the appropriate page if navigation link exists
    if (notification.metadata?.navigationLink) {
      navigate(notification.metadata.navigationLink);
      setIsOpen(false);
    }
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

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    setShowManagementModal(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const colors: Record<string, string> = {
      system: "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]",
      order: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
      wallet: "bg-success/10 text-success",
      announcement: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
      commission: "bg-warning/10 text-warning",
    };
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors[category] || "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"}`}>
        {category}
      </span>
    );
  };

  const getNotificationIcon = (type: string) => {
    const iconClasses = "w-5 h-5 flex-shrink-0";
    switch (type) {
      case 'success':
        return <FaCheck className={`${iconClasses} text-success`} />;
      case 'error':
        return <FaTimes className={`${iconClasses} text-error`} />;
      case 'warning':
        return <FaTimes className={`${iconClasses} text-warning`} />;
      case 'info':
        return <FaBell className={`${iconClasses} text-[var(--color-primary)]`} />;
      default:
        return <FaBell className={`${iconClasses} text-[var(--text-muted)]`} />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)]';

    switch (type) {
      case 'success':
        return 'bg-success/5 hover:bg-success/10';
      case 'error':
        return 'bg-error/5 hover:bg-error/10';
      case 'warning':
        return 'bg-warning/5 hover:bg-warning/10';
      case 'info':
        return 'bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10';
      default:
        return 'bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10';
    }
  };

  return (
    <>
      <div className="relative">
        {/* Notification Bell Button */}
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-white/15 active:bg-white/20 transition-all duration-200 rounded-full"
          aria-label="Notifications"
          aria-expanded={isOpen}
          aria-haspopup="true"
          style={{ color: unreadCount > 0 ? 'var(--text-inverse)' : 'color-mix(in srgb, var(--text-inverse) 65%, transparent)' }}
        >
          <FaBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-[var(--bg-header)]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Modern Notification Dropdown */}
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Panel */}
            <div
              ref={dropdownRef}
              className={`
                notification-dropdown
                z-[60] bg-[var(--bg-surface)] rounded-xl shadow-xl border border-[var(--border-color)]
                fixed inset-x-3 top-16 w-auto max-h-[calc(100vh-5rem)]
                sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[26rem] sm:max-h-[70vh] sm:inset-x-auto
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                      ({unreadCount} new)
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary)]/10 font-medium px-3 py-1 rounded-md transition-colors"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-3">
                      <FaSpinner className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">Loading notifications...</p>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="w-16 h-16 bg-[var(--bg-surface-alt)] rounded-full flex items-center justify-center">
                        <FaBell className="w-8 h-8 text-[var(--text-muted)]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--text-primary)]">No notifications</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1">You're all caught up!</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-color)]">
                    {notifications.slice(0, 10).map((notification) => {
                      const isExpanded = expandedNotifications.has(notification._id);
                      const shouldTruncate = notification.message.length > 100;
                      const creatorLabel = getCreatorLabel(notification);

                      return (
                        <div
                          key={notification._id}
                          className={`
                            p-4 transition-all duration-200
                            ${getNotificationBgColor(notification.type, notification.read)}
                            ${!notification.read ? 'border-l-4 border-[var(--color-primary)]' : ''}
                            hover:shadow-sm
                          `}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className={`text-sm font-medium text-left ${!notification.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                                        } hover:text-[var(--color-primary)] transition-colors`}
                                      onClick={() => handleNotificationClick(notification)}
                                    >
                                      {notification.title}
                                    </button>
                                    {(notification as any).category && getCategoryBadge((notification as any).category)}
                                    {notification.metadata?.navigationLink && (
                                      <FaExternalLinkAlt className="w-3 h-3 text-[var(--color-primary)] flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    {creatorLabel && (
                                      <p className="text-xs text-[var(--text-muted)]">
                                        Created by {creatorLabel}
                                      </p>
                                    )}
                                    <p className={`text-sm ${!notification.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                                      }`}>
                                      {isExpanded || !shouldTruncate
                                        ? notification.message
                                        : `${notification.message.substring(0, 100)}...`
                                      }
                                    </p>
                                    {shouldTruncate && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNotificationExpansion(notification._id);
                                        }}
                                        className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mt-1 flex items-center space-x-1"
                                      >
                                        <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                                        {isExpanded ? (
                                          <FaChevronUp className="w-3 h-3" />
                                        ) : (
                                          <FaChevronDown className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end ml-3">
                                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-1"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-[var(--border-color)] p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllNotifications}
                    className="w-full text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary)]/10 font-medium py-2 rounded-lg transition-colors"
                  >
                    View all notifications
                    {notifications.length > 10 && (
                      <span className="ml-1 text-xs text-[var(--text-muted)]">
                        (+{notifications.length - 10} more)
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Notification Management Modal */}
      <NotificationManagementModal
        isOpen={showManagementModal}
        onClose={() => setShowManagementModal(false)}
      />
    </>
  );
};