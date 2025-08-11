// src/components/notifications/NotificationDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { FaBell, FaCheck, FaTimes, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import { Button, Badge } from '../../design-system';
import { useNavigate } from 'react-router-dom';
import { NotificationManagementModal } from './NotificationManagementModal';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
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
  const handleKeyDown = (event: React.KeyboardEvent, notification: Notification) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNotificationClick(notification);
    }
  };

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

  const getNotificationIcon = (type: string) => {
    const iconClasses = "w-5 h-5 flex-shrink-0";
    switch (type) {
      case 'success':
        return <FaCheck className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <FaTimes className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <FaTimes className={`${iconClasses} text-amber-500`} />;
      case 'info':
        return <FaBell className={`${iconClasses} text-blue-500`} />;
      default:
        return <FaBell className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white hover:bg-gray-50';
    
    switch (type) {
      case 'success':
        return 'bg-green-50 hover:bg-green-100';
      case 'error':
        return 'bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100';
      case 'info':
        return 'bg-blue-50 hover:bg-blue-100';
      default:
        return 'bg-blue-50 hover:bg-blue-100';
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
          className="relative p-2 hover:bg-gray-100 transition-colors duration-200"
          aria-label="Notifications"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <FaBell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              colorScheme="error"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-medium animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
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
                z-50 bg-white rounded-xl shadow-xl border border-gray-200
                fixed inset-x-4 top-16 w-auto max-h-[calc(100vh-5rem)]
                sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-96 sm:inset-x-auto
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({unreadCount} new)
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium px-3 py-1 rounded-md transition-colors"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-3">
                      <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaBell className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">No notifications</h4>
                        <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification._id}
                        className={`
                          p-4 cursor-pointer transition-all duration-200
                          ${getNotificationBgColor(notification.type, notification.read)}
                          ${!notification.read ? 'border-l-4 border-blue-500' : ''}
                          hover:shadow-sm
                        `}
                        onClick={() => handleNotificationClick(notification)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-medium truncate ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {notification.metadata?.navigationLink && (
                                    <FaExternalLinkAlt className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className={`text-sm mt-1 line-clamp-2 ${
                                  !notification.read ? 'text-gray-700' : 'text-gray-500'
                                }`}>
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex flex-col items-end ml-3">
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-100 p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllNotifications}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium py-2 rounded-lg transition-colors"
                  >
                    View all notifications
                    {notifications.length > 10 && (
                      <span className="ml-1 text-xs text-gray-500">
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