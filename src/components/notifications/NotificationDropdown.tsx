// src/components/notifications/NotificationDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { FaBell, FaCheck, FaTimes, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import { Button, Badge, Card, CardBody } from '../../design-system';
import { useNavigate } from 'react-router-dom';
import { NotificationManagementModal } from './NotificationManagementModal';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Calculate dropdown position to ensure it stays within viewport
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Dropdown dimensions
      const dropdownWidth = Math.min(320, viewportWidth - 32); // 320px or full width minus padding
      const maxDropdownHeight = Math.min(480, viewportHeight - 100); // Max height with some padding
      
      let left = 0;
      const right = 'auto';
      let top = buttonRect.bottom + 8; // 8px gap below button
      let maxHeight = maxDropdownHeight;
      
      // Handle horizontal positioning
      const spaceOnRight = viewportWidth - buttonRect.right;
      const spaceOnLeft = buttonRect.left;
      
      if (viewportWidth < 640) { // Mobile breakpoint
        // On mobile, center the dropdown or make it full width with padding
        left = Math.max(16, (viewportWidth - dropdownWidth) / 2);
      } else {
        // Desktop: prefer right alignment, but switch to left if needed
        if (spaceOnRight >= dropdownWidth) {
          left = buttonRect.left;
        } else if (spaceOnLeft >= dropdownWidth) {
          left = buttonRect.left - dropdownWidth + buttonRect.width;
        } else {
          // Not enough space on either side, center it
          left = Math.max(16, (viewportWidth - dropdownWidth) / 2);
        }
      }
      
      // Handle vertical positioning
      const spaceBelow = viewportHeight - buttonRect.bottom - 16;
      const spaceAbove = buttonRect.top - 16;
      
      if (spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow) {
        // Not enough space below, show above if there's more space
        top = buttonRect.top - Math.min(maxDropdownHeight, spaceAbove) - 8;
        maxHeight = Math.min(maxDropdownHeight, spaceAbove);
      } else {
        // Show below (default)
        maxHeight = Math.min(maxDropdownHeight, spaceBelow);
      }
      
      setDropdownStyle({
        position: 'fixed',
        left: typeof left === 'number' ? `${left}px` : left,
        right: typeof right === 'number' ? `${right}px` : right,
        top: `${Math.max(16, top)}px`, // Ensure it's not too close to top
        width: `${dropdownWidth}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: 50,
      });
    }
  };

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

  // Recalculate position when opening dropdown
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Recalculate position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

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
    <>
      <div className="relative">
        {/* Notification Bell Button */}
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
          aria-label="Notifications"
        >
          <FaBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              colorScheme="error"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <Card>
              <CardBody className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>

                {/* Notifications List - Now Scrollable */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 140px)' }}>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </p>
                                  {notification.metadata?.navigationLink && (
                                    <FaExternalLinkAlt className="w-2 h-2 text-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <div className="mt-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllNotifications}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all notifications
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
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