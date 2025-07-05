// src/components/orders/OrderTable.tsx
import React, { useState } from 'react';
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
  FaEllipsisV
} from 'react-icons/fa';
import type { Order } from '../../types/order';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onProcess: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onProcessItem: (orderId: string, itemId: string) => void;
  loading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onView,
  onProcess,
  onCancel,
  onProcessItem,
  loading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partially_completed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'processing': return <FaSpinner className="text-blue-600 animate-spin" />;
      case 'failed': return <FaExclamationCircle className="text-red-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
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

  const toggleDropdown = (orderId: string) => {
    const newDropdowns = new Set(openDropdowns);
    if (newDropdowns.has(orderId)) {
      newDropdowns.delete(orderId);
    } else {
      newDropdowns.add(orderId);
    }
    setOpenDropdowns(newDropdowns);
  };

  const canProcess = (status: string) => ['pending', 'confirmed'].includes(status);
  const canCancel = (status: string) => ['pending', 'confirmed'].includes(status);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-gray-600">Orders will appear here once they are created.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table Header */}
      <div className="hidden lg:block">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Order</div>
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Type & Items</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order._id} className="hover:bg-gray-50 transition-colors">
            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {order.orderNumber}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.orderType}
                    </span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Progress Bar for Bulk Orders */}
                  {order.orderType === 'bulk' && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{order.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
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
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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

              {/* Expanded Content */}
              {expandedRows.has(order._id!) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {/* Order Items */}
                  <div className="space-y-2 mb-3">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
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
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>
                            {item.processingStatus}
                          </span>
                          
                          {item.processingStatus === 'pending' && (
                            <button
                              onClick={() => onProcessItem(order._id!, item._id!)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Process Item"
                            >
                              <FaPlay size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-gray-500">
                          +{order.items.length - 3} more items
                        </span>
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
                {/* Order Info */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRowExpansion(order._id!)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedRows.has(order._id!) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-900">
                    {order.customerInfo?.name || order.items[0]?.customerPhone || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Type & Items */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-sm">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.orderType}</span>
                  </div>
                  {order.orderType === 'bulk' && order.bulkData && (
                    <div className="text-xs text-gray-500">
                      {order.bulkData.successfulItems}/{order.bulkData.totalItems} processed
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="col-span-2">
                  <div className="font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </div>
                  {order.orderType === 'bulk' && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${order.completionPercentage}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(order)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                    
                    {canProcess(order.status) && (
                      <button
                        onClick={() => onProcess(order._id!)}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        title="Process Order"
                      >
                        <FaPlay size={14} />
                      </button>
                    )}
                    
                    {canCancel(order.status) && (
                      <button
                        onClick={() => onCancel(order._id!)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Cancel Order"
                      >
                        <FaTimes size={14} />
                      </button>
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
                              
                              <div className="flex items-center gap-4 text-xs text-gray-600">
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
