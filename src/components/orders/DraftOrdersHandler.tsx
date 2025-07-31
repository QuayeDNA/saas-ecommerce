// src/components/orders/DraftOrdersHandler.tsx
import React, { useState, useContext } from 'react';
import { FaExclamationTriangle, FaWallet, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { WalletContext } from '../../contexts/wallet-context';
import { Button } from '../../design-system';

interface DraftOrdersHandlerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DraftOrdersHandler: React.FC<DraftOrdersHandlerProps> = ({
  isOpen,
  onClose
}) => {
  const { orders, processDraftOrders } = useOrder();
  const walletContext = useContext(WalletContext);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get draft orders
  const draftOrders = orders.filter(order => order.status === 'draft');
  const totalDraftAmount = draftOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
  }, 0);

  const canProcessDrafts = (walletContext?.walletBalance || 0) >= totalDraftAmount;

  const handleProcessDrafts = async () => {
    if (!canProcessDrafts) {
      setError('Insufficient wallet balance to process all draft orders');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await processDraftOrders();
      console.log('Draft orders processed:', result);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to process draft orders');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Draft Orders
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {draftOrders.length === 0 ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Draft Orders
              </h3>
              <p className="text-gray-600">
                All your orders are ready to be processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-2">
                      Draft Orders Found
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      You have {draftOrders.length} order(s) that were created as drafts due to insufficient wallet balance.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Total Required:</span>
                        <span className="font-medium text-yellow-800">
                          GH₵{totalDraftAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-700">Wallet Balance:</span>
                        <span className="font-medium text-yellow-800">
                          GH₵{walletContext?.walletBalance.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft Orders List */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Draft Orders:</h4>
                {draftOrders.slice(0, 3).map((order) => (
                  <div key={order._id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.items[0]?.packageDetails?.name || 'Unknown Bundle'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items[0]?.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          GH₵{order.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {draftOrders.length > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    ... and {draftOrders.length - 3} more
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {canProcessDrafts ? (
                  <Button
                    onClick={handleProcessDrafts}
                    disabled={processing}
                    className="w-full"
                    variant="primary"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaCheckCircle />
                        Process All Draft Orders
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <FaWallet />
                        <span className="font-medium">Insufficient Balance</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        You need GH₵{(totalDraftAmount - (walletContext?.walletBalance || 0)).toFixed(2)} more to process all draft orders.
                      </p>
                    </div>
                    <Button
                      onClick={() => window.location.href = '/agent/dashboard/wallet'}
                      className="w-full"
                      variant="secondary"
                    >
                      <div className="flex items-center gap-2">
                        <FaWallet />
                        Top Up Wallet
                      </div>
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 