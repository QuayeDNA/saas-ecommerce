// src/components/orders/OrderCard.tsx
import React, { useState } from 'react';
import { 
  FaEye,
  FaChevronDown,
  FaChevronUp,
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
}) => {
  const [expanded, setExpanded] = useState(false);

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
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500 ml-2">{order.paymentMethod}</span>
            </div>
          </div>
          <button
            onClick={() => onView(order)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FaEye />
          </button>
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
 