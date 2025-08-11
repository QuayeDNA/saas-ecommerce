// src/components/orders/DuplicateOrderWarningModal.tsx
import React from 'react';
import { 
  FaExclamationTriangle, 
  FaClock, 
  FaPhone, 
  FaBox,
  FaTimes,
  FaForward
} from 'react-icons/fa';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Alert,
  Badge
} from '../../design-system';

interface DuplicateOrder {
  orderNumber: string;
  orderId: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
}

interface DuplicateItem {
  customerPhone: string;
  dataVolume: string;
  lastOrderNumber: string;
  lastOrderTime: string;
  minutesAgo: number;
  rawItem: string;
}

interface DuplicateOrderWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onCancel: () => void;
  duplicateInfo: {
    isDuplicate: boolean;
    canProceed: boolean;
    message: string;
    duplicateOrders?: DuplicateOrder[];
    duplicateItems?: DuplicateItem[];
    safeItems?: string[];
    details?: {
      customerPhone?: string;
      bundleName?: string;
      lastOrderTime?: string;
      lastOrderNumber?: string;
      minutesAgo?: number;
      totalSimilarOrders?: number;
      totalItems?: number;
      duplicateCount?: number;
      safeCount?: number;
      timeWindow?: number;
    };
  };
  orderType: 'single' | 'bulk';
}

export const DuplicateOrderWarningModal: React.FC<DuplicateOrderWarningModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  onCancel,
  duplicateInfo,
  orderType
}) => {
  const { details } = duplicateInfo;

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-amber-500 text-xl" />
          <h2 className="text-lg font-semibold text-gray-900">
            {orderType === 'bulk' 
              ? `Duplicate Items Found in Bulk Order`
              : 'Potential Duplicate Order Detected'
            }
          </h2>
        </div>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-6">
          {/* Main Warning Message */}
          <Alert variant="solid" status='warning' className="border-l-4 border-amber-400">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <h3 className="font-medium text-amber-800">Duplicate Order Warning</h3>
                <div className="text-amber-700 mt-1">
                  {orderType === 'bulk' ? (
                    <div>
                      <p className="font-medium">
                        {details?.duplicateCount} of {details?.totalItems} items appear to be duplicates of recent orders.
                      </p>
                      {details?.safeCount && details.safeCount > 0 && (
                        <p className="text-sm mt-1 opacity-90">
                          {details.safeCount} items are safe to process.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>{duplicateInfo.message}</p>
                  )}
                </div>
              </div>
            </div>
          </Alert>

          {/* Single Order Duplicate Details */}
          {orderType === 'single' && details && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FaPhone className="text-blue-500" />
                Order Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Phone Number:</span>
                  <div className="font-medium">{details.customerPhone}</div>
                </div>
                <div>
                  <span className="text-gray-600">Bundle:</span>
                  <div className="font-medium">{details.bundleName}</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Order:</span>
                  <div className="font-medium">{details.lastOrderNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Time Since Last Order:</span>
                  <div className="font-medium flex items-center gap-1">
                    <FaClock className="text-amber-500" />
                    {formatTimeAgo(details.minutesAgo || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Order Duplicate Details */}
          {orderType === 'bulk' && details && duplicateInfo.duplicateItems && (
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                  <FaTimes className="text-red-500" />
                  Duplicate Items ({details.duplicateCount} of {details.totalItems})
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {duplicateInfo.duplicateItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex flex-col bg-white p-3 rounded border-l-4 border-red-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-red-400" />
                          <span className="font-medium text-gray-900">{item.customerPhone}</span>
                          <Badge variant="outline" colorScheme='warning'>{item.dataVolume}</Badge>
                        </div>
                        <div className="text-gray-600 flex items-center gap-1 text-sm">
                          <FaClock className="text-amber-500" />
                          {formatTimeAgo(item.minutesAgo)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                        <span>Last Order:</span>
                        <span className="font-medium text-blue-600">#{item.lastOrderNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span>{new Date(item.lastOrderTime).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {duplicateInfo.duplicateItems.length > 10 && (
                    <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded">
                      ...and {duplicateInfo.duplicateItems.length - 10} more duplicate items
                    </div>
                  )}
                </div>
              </div>

              {details.safeCount && details.safeCount > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <FaBox className="text-green-500" />
                    Safe Items ({details.safeCount} of {details.totalItems})
                  </h4>
                  <p className="text-green-700 text-sm mb-2">
                    These items don't appear to be duplicates and will be processed normally:
                  </p>
                  {duplicateInfo.safeItems && duplicateInfo.safeItems.length > 0 && (
                    <div className="bg-white rounded p-2 text-xs font-mono text-gray-700 max-h-20 overflow-y-auto">
                      {duplicateInfo.safeItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="py-1">{item}</div>
                      ))}
                      {duplicateInfo.safeItems.length > 5 && (
                        <div className="text-gray-500 text-center py-1">
                          ...and {duplicateInfo.safeItems.length - 5} more safe items
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recent Order History */}
          {duplicateInfo.duplicateOrders && duplicateInfo.duplicateOrders.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <FaClock className="text-blue-500" />
                Recent Similar Orders
              </h4>
              <div className="space-y-2">
                {duplicateInfo.duplicateOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded text-sm">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">#{order.orderNumber}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge 
                        className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning and Recommendations */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">⚠️ Important</h4>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>• Creating duplicate orders may result in multiple charges</li>
              <li>• The customer may receive the same service multiple times</li>
              <li>• Consider checking with the customer before proceeding</li>
              {orderType === 'bulk' && details?.safeCount && (
                <li>• You can proceed with only the {details.safeCount} safe items if needed</li>
              )}
            </ul>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            <FaTimes className="mr-2" />
            Cancel Order
          </Button>
          <Button
            variant="primary"
            onClick={onProceed}
            className="flex-1"
          >
            <FaForward className="mr-2" />
            Proceed Anyway
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
