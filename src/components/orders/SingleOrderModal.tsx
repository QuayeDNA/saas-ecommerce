/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/orders/SingleOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPhone, FaWifi, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { useSiteStatus } from '../../contexts/site-status-context';
import type { Bundle } from '../../types/package';
import type { CreateSingleOrderData } from '../../types/order';

/**
 * SingleOrderModal expects a Bundle object that is fetched using the new ProviderPackageDisplay logic.
 * The bundle should be for the selected package and contain all required fields.
 */
interface SingleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bundle: Bundle; // Must be fetched using ProviderPackageDisplay or direct bundleService
}

// Provider-specific phone number validation rules
const providerPhoneRules = {
  MTN: {
    prefixes: ['024', '025', '054', '055', '059'],
    length: 10,
    example: '0241234567'
  },
  TELECEL: {
    prefixes: ['020', '050'],
    length: 10,
    example: '0201234567'
  },
  AT: {
    prefixes: ['027', '057', '026', '056'],
    length: 10,
    example: '0271234567'
  },
  GLO: {
    prefixes: ['023'],
    length: 10,
    example: '0231234567'
  }
};

export const SingleOrderModal: React.FC<SingleOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bundle
}) => {
  const { createSingleOrder, loading } = useOrder();
  const { siteStatus } = useSiteStatus();
  const navigate = useNavigate();
  const [customerPhone, setCustomerPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    bundle: {
      name: string;
      dataVolume: number;
      dataUnit: string;
      validity: number;
      validityUnit: string;
      price: number;
      currency: string;
    };
    customerPhone: string;
    totalPrice: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCustomerPhone('');
      setPhoneError('');
      setShowSummary(false);
      setOrderSummary(null);
      setError(null);
    }
  }, [isOpen]);

  // Validate phone number based on provider
  const validatePhone = (phone: string): boolean => {
    const provider = (bundle.providerId as any)?.code || bundle.providerId;
    const rules = providerPhoneRules[provider as keyof typeof providerPhoneRules];
    
    if (!rules) {
      setPhoneError('Invalid provider');
      return false;
    }

    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Convert to local format if it starts with +233
    let localPhone = cleanPhone;
    if (cleanPhone.startsWith('+233')) {
      localPhone = '0' + cleanPhone.substring(4);
    } else if (cleanPhone.startsWith('233')) {
      localPhone = '0' + cleanPhone.substring(3);
    }

    // Check length
    if (localPhone.length !== rules.length) {
      setPhoneError(`Phone number must be ${rules.length} digits`);
      return false;
    }

    // Check if it starts with 0
    if (!localPhone.startsWith('0')) {
      setPhoneError('Phone number must start with 0');
      return false;
    }

    // Check prefix
    const prefix = localPhone.substring(0, 3);
    if (!rules.prefixes.includes(prefix)) {
      setPhoneError(`Invalid prefix for ${provider}. Must start with: ${rules.prefixes.join(', ')}`);
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    // Clear any existing phone error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleContinue = () => {
    if (!validatePhone(customerPhone)) {
      return;
    }

    // Create order summary
    const summary = {
      bundle: {
        name: bundle.name,
        dataVolume: bundle.dataVolume,
        dataUnit: bundle.dataUnit,
        validity: bundle.validity,
        validityUnit: bundle.validityUnit,
        price: bundle.price,
        currency: bundle.currency
      },
      customerPhone: customerPhone.replace(/^\+?233/, '0'),
      totalPrice: bundle.price
    };

    // Fix type error: ensure validity and validityUnit are strings/numbers as expected
    setOrderSummary({
      ...summary,
      bundle: {
        ...summary.bundle,
        validity: typeof summary.bundle.validity === 'number' ? summary.bundle.validity : 0,
        validityUnit: typeof summary.bundle.validityUnit === 'string' ? summary.bundle.validityUnit : '',
      }
    });
    setShowSummary(true);
  };

  const handleConfirmOrder = async () => {
    try {
      setError(null);
      
      // Check if site is closed
      if (siteStatus && !siteStatus.isSiteOpen) {
        setError(`Site is currently under maintenance: ${siteStatus.customMessage}`);
        return;
      }
      
      const orderData: CreateSingleOrderData = {
        packageGroupId: typeof bundle.packageId === 'object' && bundle.packageId !== null && '_id' in bundle.packageId
          ? (bundle.packageId as { _id: string })._id
          : bundle.packageId,
        packageItemId: bundle._id || '',
        customerPhone: customerPhone.replace(/^\+?233/, '0'),
        bundleSize: {
          value: bundle.dataVolume,
          unit: bundle.dataUnit as 'MB' | 'GB'
        },
        quantity: 1
      };

      await createSingleOrder(orderData);
      
      // Check if the order was created as a draft (insufficient wallet balance)
      // The backend will return an error message if it's a draft order
      // We'll handle this in the OrderContext and show appropriate message
      
      // Show success briefly before navigating to orders page
      setTimeout(() => {
        onSuccess();
        onClose();
        navigate('/agent/dashboard/orders');
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        
        // Check if this is a draft order (insufficient wallet balance)
        if (errorMessage.includes('draft') || errorMessage.includes('insufficient')) {
          setError(errorMessage);
          // Don't close modal, let user see the error and potentially top up wallet
          return;
        }
        
        // Check if site is closed
        if (errorMessage.includes('maintenance') || errorMessage.includes('Site is currently under maintenance')) {
          setError(errorMessage);
          return;
        }
        
        setError(errorMessage || 'Failed to create order');
      } else {
        setError('Failed to create order');
      }
    }
  };

  const handleBack = () => {
    setShowSummary(false);
    setOrderSummary(null);
  };

  if (!isOpen) return null;

  const provider = (bundle.providerId as any)?.code || bundle.providerId;
  const rules = providerPhoneRules[provider as keyof typeof providerPhoneRules];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {showSummary ? 'Order Summary' : 'Order Bundle'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!showSummary ? (
            // Order Form
            <div className="space-y-6">
              {/* Bundle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {bundle.currency} {bundle.price}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaWifi className="text-blue-500" />
                    <span>{bundle.dataVolume} {bundle.dataUnit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-green-500" />
                    <span>{bundle.validity} {bundle.validityUnit}</span>
                  </div>
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={rules?.example || "Enter phone number"}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      phoneError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                {rules && (
                  <p className="mt-1 text-xs text-gray-500">
                    Valid prefixes: {rules.prefixes.join(', ')}
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!customerPhone || loading || (siteStatus?.isSiteOpen === false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processing...' : (siteStatus && !siteStatus.isSiteOpen) ? 'Site Under Maintenance' : 'Continue'}
              </button>
            </div>
          ) : (
            // Order Summary
            <div className="space-y-6">
              {/* Bundle Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Bundle Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle:</span>
                    <span className="font-medium">{orderSummary?.bundle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
                      {orderSummary?.bundle.dataVolume} {orderSummary?.bundle.dataUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validity:</span>
                    <span className="font-medium">
                      {orderSummary?.bundle.validity} {orderSummary?.bundle.validityUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-green-600">
                      {orderSummary?.bundle.currency} {orderSummary?.bundle.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone className="text-blue-500" />
                  <span>{orderSummary?.customerPhone}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    {orderSummary?.bundle.currency} {orderSummary?.totalPrice}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || (siteStatus?.isSiteOpen === false)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (siteStatus && !siteStatus.isSiteOpen) ? (
                    <>
                      <FaTimes />
                      Site Under Maintenance
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 