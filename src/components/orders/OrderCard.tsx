// src/components/orders/OrderCard.tsx
import React from 'react';
import { 
  FaEye, 
  FaPlay, 
  FaTimes, 
  FaPhone, 
  FaWifi, 
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
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

  const canProcess = ['pending', 'confirmed'].includes(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {order.orderNumber}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.orderType}
              </span>
              <span>${order.total.toFixed(2)}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(order)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="View Details"
            >
              <FaEye size={16} />
            </button>
            
            {canProcess && (
              <button
                onClick={() => onProcess(order._id!)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                title="Process Order"
              >
                <FaPlay size={16} />
              </button>
            )}
            
            {canCancel && (
              <button
                onClick={() => onCancel(order._id!)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Cancel Order"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {order.orderType === 'bulk' && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
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

      {/* Order Items Preview */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FaPhone className="text-blue-500 text-sm" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.customerPhone}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  {item.variantDetails.network && (
                    <span className="flex items-center gap-1">
                      <FaWifi />
                      {item.variantDetails.network}
                    </span>
                  )}
                  {item.bundleSize && (
                    <span>{item.bundleSize.value}{item.bundleSize.unit}</span>
                  )}
                  {item.variantDetails.validity && (
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {item.variantDetails.validity}d
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
          
          {order.items.length > 3 && (
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">
                +{order.items.length - 3} more items
              </span>
            </div>
          )}
        </div>

        {/* Bulk Order Stats */}
        {order.orderType === 'bulk' && order.bulkData && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {order.bulkData.totalItems}
              </div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {order.bulkData.successfulItems}
              </div>
              <div className="text-xs text-green-600">Success</div>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {order.bulkData.failedItems}
              </div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
