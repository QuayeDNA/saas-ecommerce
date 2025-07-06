// src/components/orders/OrderCard.tsx
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

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onProcess: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onProcessItem: (orderId: string, itemId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onView,
  onProcess,
  onCancel,
  onProcessItem
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
      case 'cancelled': return <FaTimes className="text-gray-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'partially_completed': return <FaExclamationCircle className="text-orange-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType?.toLowerCase()) {
      case 'voice': return <FaPhone className="text-blue-600" />;
      case 'data': return <FaWifi className="text-green-600" />;
      default: return <FaPhone className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
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
              <span className="font-medium">GH₵ {order.total.toFixed(2)}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="text-xs text-gray-500 mb-2">
              {order.customerInfo?.name || 'Guest Customer'}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onView(order)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <FaEye />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaEllipsisV />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => {
                          onProcess(order._id!);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                      >
                        <FaPlay className="text-xs" />
                        Process
                      </button>
                    )}
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={() => {
                          onCancel(order._id!);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                      >
                        <FaTimes className="text-xs" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Summary */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Items: {order.items.length}</span>
            <span className="text-gray-600">Completion: {order.completionPercentage}%</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${order.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

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
                  <div key={item._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(item.packageDetails.provider || 'voice')}
                        <div className="text-xs">
                          <div className="font-medium">{item.customerPhone}</div>
                          <div className="text-gray-500">{item.packageDetails.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>
                          {item.processingStatus}
                        </span>
                        {item.processingStatus === 'pending' && (
                          <button
                            onClick={() => onProcessItem(order._id!, item._id!)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <FaPlay className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      GH₵ {item.totalPrice.toFixed(2)} • Qty: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Payment: {order.paymentStatus}</span>
          <span>Priority: {order.priority}</span>
        </div>
      </div>
    </div>
  );
};
 