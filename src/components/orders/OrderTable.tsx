// src/components/orders/OrderTable.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaPlay, 
  FaTimes, 
  FaPhone, 
  FaWifi, 
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaDownload,
  FaCopy,
} from 'react-icons/fa';
import type { Order } from '../../types/order';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onProcess: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onProcessItem: (orderId: string, itemId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onProcess,
  onCancel,
  onProcessItem,
  onRefresh,
  loading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());

  // Auto-refresh processing orders
  useEffect(() => {
    const processingOrderIds = orders
      .filter(order => ['processing', 'pending'].includes(order.status))
      .map(order => order._id!);
    
    setProcessingOrders(new Set(processingOrderIds));
    
    if (processingOrderIds.length > 0) {
      const interval = setInterval(() => {
        onRefresh?.();
      }, 5000); // Refresh every 5 seconds for processing orders
      
      return () => clearInterval(interval);
    }
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const toggleDropdown = (orderId: string) => {
    const newDropdowns = new Set(openDropdowns);
    if (newDropdowns.has(orderId)) {
      newDropdowns.delete(orderId);
    } else {
      newDropdowns.add(orderId);
    }
    setOpenDropdowns(newDropdowns);
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order._id!)));
    }
  };

  const canProcess = (status: string) => ['pending', 'confirmed'].includes(status);
  const canCancel = (status: string) => ['pending', 'confirmed', 'processing'].includes(status);

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    // You could add a toast notification here
  };

  const exportSelectedOrders = () => {
    const selectedOrderData = orders.filter(order => selectedOrders.has(order._id!));
    const csvData = [
      ['Order Number', 'Type', 'Status', 'Total', 'Items', 'Created Date'],
      ...selectedOrderData.map(order => [
        order.orderNumber,
        order.orderType,
        order.status,
        order.total.toFixed(2),
        order.items.length,
        new Date(order.createdAt).toLocaleDateString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header with Actions */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOrders.size === orders.length && orders.length > 0}
                onChange={selectAllOrders}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.size > 0 ? `${selectedOrders.size} selected` : 'Select all'}
              </span>
            </label>
            
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportSelectedOrders}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaDownload size={14} />
                  Export
                </button>
                <button
                  onClick={() => setSelectedOrders(new Set())}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {processingOrders.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <FaSpinner className="animate-spin" />
                <span>{processingOrders.size} processing</span>
              </div>
            )}
            
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table Header */}
      <div className="hidden lg:block">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Order Details</div>
            <div className="col-span-2">Customer & Items</div>
            <div className="col-span-2">Payment & Status</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-2">Actions</div>
            <div className="col-span-1"></div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order._id} className={`hover:bg-gray-50 transition-colors ${
            selectedOrders.has(order._id!) ? 'bg-blue-50' : ''
          }`}>
            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order._id!)}
                      onChange={() => toggleOrderSelection(order._id!)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {order.orderNumber}
                    </h3>
                    <button
                      onClick={() => copyOrderNumber(order.orderNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy order number"
                    >
                      <FaCopy size={12} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.orderType}
                    </span>
                    <span className="font-medium">GH₵{order.total.toFixed(2)}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-1 mb-2">
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Bulk Orders */}
                  {order.orderType === 'bulk' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{order.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => toggleRowExpansion(order._id!)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={expandedRows.has(order._id!) ? "Collapse" : "Expand"}
                  >
                    {expandedRows.has(order._id!) ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(order._id!)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaEllipsisV size={14} />
                    </button>
                    
                    {openDropdowns.has(order._id!) && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onView(order);
                              toggleDropdown(order._id!);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FaEye size={14} />
                            View Details
                          </button>
                          
                          {canProcess(order.status) && (
                            <button
                              onClick={() => {
                                onProcess(order._id!);
                                toggleDropdown(order._id!);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FaPlay size={14} />
                              Process Order
                            </button>
                          )}
                          
                          {canCancel(order.status) && (
                            <button
                              onClick={() => {
                                onCancel(order._id!);
                                toggleDropdown(order._id!);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FaTimes size={14} />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Mobile Content */}
              {expandedRows.has(order._id!) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FaPhone className="text-blue-500 text-xs" />
                            <span className="text-xs font-medium text-gray-900 truncate">
                              {item.customerPhone}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            {item.packageDetails?.provider && (
                              <span className="flex items-center gap-1">
                                <FaWifi size={10} />
                                {item.packageDetails.provider}
                              </span>
                            )}
                            {item.bundleSize && (
                              <span>{item.bundleSize.value}{item.bundleSize.unit}</span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>
                              {item.processingStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">
                            GH₵{item.totalPrice.toFixed(2)}
                          </span>
                          
                          {item.processingStatus === 'pending' && (
                            <button
                              onClick={() => onProcessItem(order._id!, item._id!)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Process Item"
                            >
                              <FaPlay size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-center text-xs text-gray-500 py-2">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Bulk Order Stats */}
                  {order.orderType === 'bulk' && order.bulkData && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <div className="text-sm font-bold text-blue-600">
                          {order.bulkData.totalItems}
                        </div>
                        <div className="text-xs text-blue-600">Total</div>
                      </div>
                      
                      <div className="p-2 bg-green-50 rounded text-center">
                        <div className="text-sm font-bold text-green-600">
                          {order.bulkData.successfulItems}
                        </div>
                        <div className="text-xs text-green-600">Success</div>
                      </div>
                      
                      <div className="p-2 bg-red-50 rounded text-center">
                        <div className="text-sm font-bold text-red-600">
                          {order.bulkData.failedItems}
                        </div>
                        <div className="text-xs text-red-600">Failed</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Order Details */}
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order._id!)}
                      onChange={() => toggleOrderSelection(order._id!)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => toggleRowExpansion(order._id!)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedRows.has(order._id!) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => copyOrderNumber(order.orderNumber)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy order number"
                        >
                          <FaCopy size={10} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Items */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-900">
                    {order.customerInfo?.name || order.items[0]?.customerPhone || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Payment & Status */}
                <div className="col-span-2">
                  <div className="space-y-1 mb-2">
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    GH₵{order.total.toFixed(2)}
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.orderType}</span>
                  </div>
                  {order.orderType === 'bulk' && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{order.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(order)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                    
                    {canProcess(order.status) && (
                      <button
                        onClick={() => onProcess(order._id!)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Process Order"
                      >
                        <FaPlay size={14} />
                      </button>
                    )}
                    
                    {canCancel(order.status) && (
                      <button
                        onClick={() => onCancel(order._id!)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Cancel Order"
                      >
                        <FaTimes size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown */}
                <div className="col-span-1">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(order._id!)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaEllipsisV size={14} />
                    </button>
                    
                    {openDropdowns.has(order._id!) && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onView(order);
                              toggleDropdown(order._id!);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FaEye size={14} />
                            View Details
                          </button>
                          
                          <button
                            onClick={() => {
                              copyOrderNumber(order.orderNumber);
                              toggleDropdown(order._id!);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FaCopy size={14} />
                            Copy Order Number
                          </button>
                          
                          {canProcess(order.status) && (
                            <button
                              onClick={() => {
                                onProcess(order._id!);
                                toggleDropdown(order._id!);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FaPlay size={14} />
                              Process Order
                            </button>
                          )}
                          
                          {canCancel(order.status) && (
                            <button
                              onClick={() => {
                                onCancel(order._id!);
                                toggleDropdown(order._id!);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FaTimes size={14} />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Desktop Content */}
              {expandedRows.has(order._id!) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FaPhone className="text-blue-500 text-sm" />
                                <span className="text-sm font-medium text-gray-900">
                                  {item.customerPhone}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                {item.packageDetails?.provider && (
                                  <span className="flex items-center gap-1">
                                    <FaWifi />
                                    {item.packageDetails.provider}
                                  </span>
                                )}
                                {item.bundleSize && (
                                  <span>{item.bundleSize.value}{item.bundleSize.unit}</span>
                                )}
                                {item.packageDetails?.validity && (
                                  <span className="flex items-center gap-1">
                                    <FaClock />
                                    {item.packageDetails.validity}d
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                GH₵{item.totalPrice.toFixed(2)}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>
                                {item.processingStatus}
                              </span>
                              
                              {item.processingStatus === 'pending' && (
                                <button
                                  onClick={() => onProcessItem(order._id!, item._id!)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                  title="Process Item"
                                >
                                  <FaPlay size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bulk Order Stats */}
                    {order.orderType === 'bulk' && order.bulkData && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Processing Stats</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {order.bulkData.totalItems}
                            </div>
                            <div className="text-xs text-blue-600">Total</div>
                          </div>
                          
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-600">
                              {order.bulkData.successfulItems}
                            </div>
                            <div className="text-xs text-green-600">Success</div>
                          </div>
                          
                          <div className="p-3 bg-red-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-red-600">
                              {order.bulkData.failedItems}
                            </div>
                            <div className="text-xs text-red-600">Failed</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
