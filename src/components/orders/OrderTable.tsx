// src/components/orders/OrderTable.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaEye, 
  FaTimes, 
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaChevronDown,
  FaWifi
} from 'react-icons/fa';
import type { Order } from '../../types/order';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onCancel: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: string, notes?: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onCancel,
  onUpdateStatus,
  onRefresh,
  loading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (statusDropdownOpen && !target.closest('.status-dropdown')) {
        setStatusDropdownOpen(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && statusDropdownOpen) {
        setStatusDropdownOpen(null);
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
    { value: 'partially_completed', label: 'Partially Completed', color: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];

  // Improved auto-refresh logic
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Find processing orders
    const currentProcessingOrders = orders
      .filter(order => ['processing', 'pending'].includes(order.status))
      .map(order => order._id!);
    
    // Only set up auto-refresh if there are processing orders and onRefresh is available
    if (currentProcessingOrders.length > 0 && onRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        onRefresh();
      }, 15000); // 15 seconds - less aggressive
    }

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [orders, onRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partially_completed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await onUpdateStatus(orderId, newStatus);
      setStatusDropdownOpen(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const toggleStatusDropdown = (orderId: string) => {
    setStatusDropdownOpen(statusDropdownOpen === orderId ? null : orderId);
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

  const canCancel = (status: string) => ['pending', 'confirmed', 'processing'].includes(status);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="p-6 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 text-6xl mb-6">📋</div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">No orders found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Orders will appear here once they are created. Start by creating your first order to see it here.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>

            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {orders.map(order => (
            <React.Fragment key={order._id}>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber || order._id?.slice(-6)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaWifi className="text-gray-400" />
                    {getOrderProvider(order)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="relative">
                    <button
                      onClick={() => toggleStatusDropdown(order._id!)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} hover:bg-opacity-80 transition-colors status-dropdown`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                      <FaChevronDown className="text-xs" />
                    </button>
                    
                    {statusDropdownOpen === order._id && (
                      <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 status-dropdown" style={{ top: '100%', left: '0', minWidth: '12rem' }}>
                        <div className="py-1 flex flex-col">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleStatusChange(order._id!, option.value)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${option.value === order.status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {getOrderRecipient(order)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {getOrderVolume(order)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button
                    onClick={() => toggleRowExpansion(order._id!)}
                    className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                  >
                    {expandedRows.has(order._id!) ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedRows.has(order._id!) && (
                <tr>
                  <td colSpan={7} className="bg-gray-50 px-4 py-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-700">Order Items:</span>
                          <ul className="mt-1 space-y-1 text-sm text-gray-600">
                            {order.items.map(item => (
                              <li key={item._id} className="flex flex-wrap gap-2 items-center border-b border-gray-100 pb-1 last:border-b-0">
                                <span className="font-medium text-gray-900">{item.packageDetails?.name || 'Bundle'}</span>
                                <span className="text-xs text-gray-500">{item.customerPhone}</span>
                                <span className="text-xs text-gray-500">{item.bundleSize?.value}{item.bundleSize?.unit}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(item.processingStatus)}`}>{item.processingStatus}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-xs text-gray-500">
                            Created by: {
                              typeof order.createdBy === 'object' && order.createdBy !== null && 'fullName' in order.createdBy
                                ? (order.createdBy as { fullName?: string }).fullName || 'Unknown'
                                : order.createdBy || 'Unknown'
                            }
                          </span>
                          <span className="text-xs text-gray-500">Payment: {order.paymentStatus}</span>
                          <span className="text-xs text-gray-500">Priority: {order.priority}</span>
                          <span className="text-xs text-gray-500">Completion: {order.completionPercentage}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {canCancel(order.status) && (
                          <button
                            onClick={() => onCancel(order._id!)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            <FaTimes size={12} /> Cancel
                          </button>
                        )}
                        <button
                          onClick={() => onView(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                        >
                          <FaEye size={12} /> View
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
