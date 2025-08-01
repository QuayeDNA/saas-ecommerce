// src/components/orders/UnifiedOrderCard.tsx
import React, { useState } from 'react';
import { 
  FaChevronDown,
  FaChevronUp,
  FaWifi,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaExclamationCircle,
  FaTimes,
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
  const [expanded, setExpanded] = useState(false);
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
    if (order.status === 'draft' && currentUserId && order.createdBy?._id === currentUserId) {
      return true;
    }
    
    return false;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
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
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {order.orderNumber}
              </h3>
            </div>
            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaWifi className="text-gray-400" />
            <span className="font-medium">Network:</span>
            <span>{getOrderProvider(order)}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Recipient:</span> {getOrderRecipient(order)}
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Volume:</span> {getOrderVolume(order)}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Total:</span> {formatCurrency(order.total)}
          </div>
        </div>

        {/* Status Section */}
        <div className="mb-3">
          <div className="relative">
            {isAdmin ? (
              // Admin can change status
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} hover:bg-opacity-80 transition-colors w-full justify-between status-dropdown`}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.replace('_', ' ')}
                </div>
                <FaChevronRight className="text-xs" />
              </button>
            ) : (
              // Agent can only view status
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status.replace('_', ' ')}
              </div>
            )}
            
            {isAdmin && statusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 status-dropdown" style={{ top: '100%', left: '0' }}>
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

        {/* Cancel Order Action */}
        {canUserCancelOrder(order) && (
          <div className="flex gap-2 mb-3">
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

        {/* Expandable Items Section */}
        {order.items && order.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
              Show {order.items.length} item(s)
            </button>
            {expanded && (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="bg-gray-50 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{item.packageDetails?.name || 'Bundle'}</span>
                      <span className="text-xs text-gray-500">{item.customerPhone}</span>
                      <span className="text-xs text-gray-500">{item.bundleSize?.value}{item.bundleSize?.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>{item.processingStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 