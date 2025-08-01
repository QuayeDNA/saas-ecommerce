// src/components/orders/DraftOrdersHandler.tsx
import React, { useState, useContext, useEffect } from 'react';
import { FaExclamationTriangle, FaWallet, FaCheckCircle, FaTimes, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { WalletContext } from '../../contexts/wallet-context';
import { Button, Card, CardHeader, CardBody } from '../../design-system';
import { useToast } from '../../design-system/components/toast';

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
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  // Get draft orders
  const draftOrders = orders.filter(order => order.status === 'draft');
  const currentDraft = draftOrders[currentDraftIndex];
  


  const currentDraftAmount = currentDraft ? 
    currentDraft.items.reduce((sum, item) => sum + item.totalPrice, 0) : 0;

  const canProcessCurrentDraft = (walletContext?.walletBalance || 0) >= currentDraftAmount;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentDraftIndex(0);
      setProcessedCount(0);
      setError(null);
      setProcessing(false);
    }
  }, [isOpen]);

  const handleProcessCurrentDraft = async () => {
    if (!currentDraft || !canProcessCurrentDraft) {
      setError('Insufficient wallet balance to process this draft order');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await processDraftOrders();
      setProcessedCount(prev => prev + 1);
      
      // Move to next draft or close if all processed
      if (currentDraftIndex < draftOrders.length - 1) {
        setCurrentDraftIndex(prev => prev + 1);
        addToast(`Draft order processed successfully! ${processedCount + 1}/${draftOrders.length} completed`, 'success');
      } else {
        addToast(`All ${draftOrders.length} draft orders processed successfully!`, 'success');
        onClose();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to process draft order');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipCurrentDraft = () => {
    if (currentDraftIndex < draftOrders.length - 1) {
      setCurrentDraftIndex(prev => prev + 1);
      setError(null);
    } else {
      onClose();
    }
  };

  const handleProcessAllRemaining = async () => {
    setProcessing(true);
    setError(null);

    try {
      await processDraftOrders();
      addToast(`All remaining draft orders processed successfully!`, 'success');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Draft Orders ({draftOrders.length})
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
        <div className="flex-1 overflow-y-auto p-4">
          {draftOrders.length === 0 ? (
            <Card className="text-center">
              <CardBody className="p-8">
                <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Draft Orders
                </h3>
                <p className="text-gray-600">
                  All your orders are ready to be processed.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Progress Indicator */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {processedCount}/{draftOrders.length} processed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(processedCount / draftOrders.length) * 100}%` }}
                    ></div>
                  </div>
                </CardBody>
              </Card>

              {/* Current Draft Order */}
              {currentDraft && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        Draft Order #{currentDraftIndex + 1}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {currentDraftIndex + 1} of {draftOrders.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-3">
                      {/* Order Details */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          {currentDraft.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.packageDetails?.name || 'Unknown Bundle'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.customerPhone}
                                </p>
                                {item.packageDetails?.dataVolume && (
                                  <p className="text-xs text-gray-500">
                                    {item.packageDetails.dataVolume} GB
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-medium text-gray-900">
                                  GH₵{item.totalPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Wallet Check */}
                      <div className={`rounded-lg p-3 ${
                        canProcessCurrentDraft 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              canProcessCurrentDraft ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {canProcessCurrentDraft ? 'Sufficient Balance' : 'Insufficient Balance'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Required: GH₵{currentDraftAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Wallet Balance</p>
                            <p className={`font-medium ${
                              canProcessCurrentDraft ? 'text-green-800' : 'text-red-800'
                            }`}>
                              GH₵{walletContext?.walletBalance.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {canProcessCurrentDraft ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleProcessCurrentDraft}
                      disabled={processing}
                      className="flex-1"
                      variant="primary"
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaCheckCircle />
                          Process This Order
                        </div>
                      )}
                    </Button>
                    {currentDraftIndex < draftOrders.length - 1 && (
                      <Button
                        onClick={handleSkipCurrentDraft}
                        disabled={processing}
                        className="flex-1"
                        variant="outline"
                      >
                        <div className="flex items-center gap-2">
                          <FaArrowRight />
                          Skip
                        </div>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <FaWallet />
                        <span className="font-medium">Insufficient Balance</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        You need GH₵{(currentDraftAmount - (walletContext?.walletBalance || 0)).toFixed(2)} more to process this order.
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

                {/* Process All Remaining Button */}
                {draftOrders.length > 1 && currentDraftIndex < draftOrders.length - 1 && (
                  <div className="border-t pt-3">
                    <Button
                      onClick={handleProcessAllRemaining}
                      disabled={processing}
                      className="w-full"
                      variant="outline"
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          Processing All...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaCheckCircle />
                          Process All Remaining ({draftOrders.length - currentDraftIndex - 1})
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <Card>
                  <CardBody className="p-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 