// src/components/orders/UnifiedOrderCard.tsx
import React, { useState } from 'react';
import { 
  FaWifi,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaExclamationCircle,
  FaTimes,
  FaUser,
  FaPhone,
  FaDatabase,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { Button } from '../../design-system';
import type { Order } from '../../types/order';

interface UnifiedOrderCardProps {
  order: Order;
  isAdmin: boolean;
  currentUserId?: string;
  onUpdateStatus: (orderId: string, status: string, notes?: string) => void;
  onCancel: (orderId: string) => void;
  onSelect?: (orderId: string) => void;
  isSelected?: boolean;
}

export const UnifiedOrderCard: React.FC<UnifiedOrderCardProps> = ({
  order,
  isAdmin,
  currentUserId,
  onUpdateStatus,
  onCancel,
  onSelect,
  isSelected = false
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Click outside handler to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (statusDropdownOpen && !target.closest('.status-dropdown')) {
        setStatusDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && statusDropdownOpen) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [statusDropdownOpen]);

  // Available status options (excluding 'failed' as it's system-controlled)
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-purple-100 text-purple-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'processing': return <FaSpinner className="text-blue-600 animate-spin" />;
      case 'failed': return <FaExclamationCircle className="text-red-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'confirmed': return <FaCheckCircle className="text-purple-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      onUpdateStatus(order._id!, newStatus);
      setStatusDropdownOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Get provider from order items
  const getOrderProvider = (order: Order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].packageDetails?.provider || 'Unknown';
    }
    return 'Unknown';
  };

  // Get recipient info (phone number for single orders, count for bulk)
  const getOrderRecipient = (order: Order) => {
    if (order.orderType === 'bulk') {
      return `${order.items.length} recipients`;
    }
    if (order.items && order.items.length > 0) {
      return order.items[0].customerPhone || 'N/A';
    }
    return 'N/A';
  };

  // Get total volume
  const getOrderVolume = (order: Order) => {
    if (!order.items || order.items.length === 0) return 'N/A';
    
    const totalVolume = order.items.reduce((sum, item) => {
      const volume = item.bundleSize?.value || item.packageDetails?.dataVolume || 0;
      return sum + volume;
    }, 0);
    
    if (totalVolume >= 1) {
      return `${totalVolume.toFixed(1)} GB`;
    } else {
      return `${(totalVolume * 1000).toFixed(0)} MB`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const canCancel = (status: string) => ['pending', 'confirmed', 'processing', 'draft'].includes(status);

  const canUserCancelOrder = (order: Order) => {
    if (!canCancel(order.status)) return false;
    
    // Admins can cancel any order
    if (isAdmin) return true;
    
    // Agents can only cancel their own draft orders
    if (order.status === 'draft' && currentUserId) {
      const createdById = typeof order.createdBy === 'string' ? order.createdBy : (order.createdBy as { _id: string })?._id;
      if (createdById === currentUserId) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="p-4 sm:p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isAdmin && onSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(order._id!)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {order.orderNumber}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          
          {/* Status Badge */}
          <div className="flex-shrink-0 ml-3">
            <div className="relative">
              {isAdmin ? (
                // Admin can change status
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} hover:bg-opacity-80 transition-colors status-dropdown`}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    <span className="inline">{order.status.replace('_', ' ')}</span>
                  </div>
                  <FaChevronRight className="text-xs" />
                </button>
              ) : (
                // Agent can only view status
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="inline">{order.status.replace('_', ' ')}</span>
                </div>
              )}
              
              {isAdmin && statusDropdownOpen && (
                <div className="absolute z-10 mt-1 right-0 bg-white rounded-md shadow-lg border border-gray-200 status-dropdown min-w-32">
                  <div className="py-1 flex flex-col">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${option.value === order.status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Network */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaWifi className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-gray-900">Network</div>
              <div className="truncate">{getOrderProvider(order)}</div>
            </div>
          </div>
          
          {/* Recipient */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaPhone className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-gray-900">Recipient</div>
              <div className="truncate">{getOrderRecipient(order)}</div>
            </div>
          </div>
          
          {/* Volume */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaDatabase className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-gray-900">Volume</div>
              <div className="truncate">{getOrderVolume(order)}</div>
            </div>
          </div>
          
          {/* Total */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMoneyBillWave className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-gray-900">Total</div>
              <div className="truncate">{formatCurrency(order.total)}</div>
            </div>
          </div>
        </div>

        {/* Order Type and Items Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUser className="text-gray-400" />
            <span className="font-medium">Type:</span>
            <span className="capitalize">{order.orderType}</span>
            <span className="text-gray-400">•</span>
            <span>{order.items?.length || 0} item(s)</span>
          </div>
        </div>

        {/* Cancel Order Action */}
        {canUserCancelOrder(order) && (
          <div className="flex justify-end">
            <Button
              size="xs"
              variant="outline"
              onClick={() => onCancel(order._id!)}
              className="text-red-600 hover:text-red-700"
            >
              <FaTimes className="mr-1" />
              {order.status === 'draft' ? 'Delete Draft' : 'Cancel'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 