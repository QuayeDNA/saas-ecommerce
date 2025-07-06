// src/components/orders/OrderModal.tsx
import React from 'react';
import { 
  FaTimes, 
  FaPhone, 
  FaWifi, 
  FaClock, 
  FaPlay,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';
import type { Order } from '../../types/order';

interface OrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onProcessItem: (orderId: string, itemId: string) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  order,
  isOpen,
  onClose,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order Details - {order.orderNumber}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-600">
                {order.orderType} order
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-xl font-bold text-gray-900">GH₵ {order.total.toFixed(2)}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Items</div>
              <div className="text-xl font-bold text-gray-900">{order.items.length}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Payment</div>
              <div className="text-xl font-bold text-gray-900 capitalize">{order.paymentStatus}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-xl font-bold text-gray-900">{order.completionPercentage}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Processing Progress</span>
              <span>{order.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${order.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Bulk Order Stats */}
          {order.orderType === 'bulk' && order.bulkData && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {order.bulkData.totalItems}
                </div>
                <div className="text-sm text-blue-600">Total Items</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {order.bulkData.successfulItems}
                </div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {order.bulkData.failedItems}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FaPhone className="text-blue-500" />
                        <span className="font-medium text-gray-900">
                          {item.customerPhone}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.processingStatus)}`}>
                          {item.processingStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="block text-gray-500">Package:</span>
                          <span className="font-medium">{item.packageDetails.name}</span>
                        </div>
                        
                        <div>
                          <span className="block text-gray-500">Provider:</span>
                          <span className="font-medium flex items-center gap-1">
                            <FaWifi />
                            {item.packageDetails.provider}
                          </span>
                        </div>
                        
                        {item.packageDetails.validity && (
                          <div>
                            <span className="block text-gray-500">Validity:</span>
                            <span className="font-medium flex items-center gap-1">
                              <FaClock />
                              {item.packageDetails.validity}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <span className="block text-gray-500">Price:</span>
                          <span className="font-medium">GH₵ {item.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {item.processingError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Error:</strong> {item.processingError}
                        </div>
                      )}

                      {item.processedAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Processed: {new Date(item.processedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.processingStatus)}
                      
                      {item.processingStatus === 'pending' && (
                        <button
                          onClick={() => onProcessItem(order._id!, item._id!)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <FaPlay size={12} />
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Order Created</div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {order.processingStartedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Processing Started</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.processingStartedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              {order.processingCompletedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">Processing Completed</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.processingCompletedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {order.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

