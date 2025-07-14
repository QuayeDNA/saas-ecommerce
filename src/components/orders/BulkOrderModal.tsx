// src/components/orders/BulkOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTimes, 
  FaWifi, 
  FaClock, 
  FaCheckCircle, 
  FaFileUpload, 
  FaDownload,
  FaPlus
} from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { usePackage } from '../../hooks/use-package';
import type { Bundle } from '../../types/package';
import type { CreateBulkOrderData } from '../../types/order';

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageId: string;
  provider: string;
}

interface BulkOrderItem {
  customerPhone: string;
  dataVolume: number;
  dataUnit: 'MB' | 'GB';
  bundle?: Bundle;
  phoneError?: string;
  dataError?: string;
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

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  packageId,
  provider
}) => {
  const { createBulkOrder, loading } = useOrder();
  const { bundles } = usePackage();
  const navigate = useNavigate();
  const [bulkText, setBulkText] = useState('');
  const [orderItems, setOrderItems] = useState<BulkOrderItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<'file' | 'manual'>('manual');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBulkText('');
      setOrderItems([]);
      setShowSummary(false);
      setError(null);
      setImportMethod('manual');
    }
  }, [isOpen]);

  // Get available bundles for this package
  const availableBundles = bundles?.filter(bundle => 
    bundle.packageId === packageId && bundle.isActive
  ) || [];

  // Validate phone number based on provider
  const validatePhone = (phone: string): string | null => {
    const rules = providerPhoneRules[provider as keyof typeof providerPhoneRules];
    
    if (!rules) {
      return 'Invalid provider';
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
      return `Phone number must be ${rules.length} digits`;
    }

    // Check if it starts with 0
    if (!localPhone.startsWith('0')) {
      return 'Phone number must start with 0';
    }

    // Check prefix
    const prefix = localPhone.substring(0, 3);
    if (!rules.prefixes.includes(prefix)) {
      return `Invalid prefix for ${provider}. Must start with: ${rules.prefixes.join(', ')}`;
    }

    return null;
  };

  // Parse bulk text and validate
  const parseBulkText = (text: string): BulkOrderItem[] => {
    const lines = text.trim().split('\n');
    const items: BulkOrderItem[] = [];
    
    for (const element of lines) {
      const line = element.trim();
      if (!line) continue;
      
      // Parse format: "Number 10GB" or "Number 5MB"
      const parts = line.split(' ');
      if (parts.length < 2) {
        continue;
      }
      
      const phone = parts[0];
      const dataPart = parts.slice(1).join(' '); // Handle cases like "10 GB" with space
      
      // Extract data volume and unit
      const dataMatch = RegExp(/^(\d+(?:\.\d+)?)\s*(MB|GB)$/i).exec(dataPart);
      if (!dataMatch) {
        continue;
      }
      
      const dataVolume = parseFloat(dataMatch[1]);
      const dataUnit = dataMatch[2].toUpperCase() as 'MB' | 'GB';
      
      // Find matching bundle
      const matchingBundle = availableBundles.find(bundle => 
        bundle.dataVolume === dataVolume && 
        bundle.dataUnit.toUpperCase() === dataUnit
      );
      
      if (!matchingBundle) {
        continue;
      }
      
      items.push({
        customerPhone: phone,
        dataVolume,
        dataUnit,
        bundle: matchingBundle
      });
    }
    
    return items;
  };

  // Validate all order items
  const validateOrderItems = (): boolean => {
    if (orderItems.length === 0) {
      setError('Please add at least one valid order item');
      return false;
    }

    let hasErrors = false;
    const validatedItems = orderItems.map(item => {
      const phoneError = validatePhone(item.customerPhone);
      const dataError = !item.bundle ? 'Data volume not available in this package' : undefined;
      
      if (phoneError || dataError) {
        hasErrors = true;
      }
      
      return { ...item, phoneError, dataError };
    });

    // Fix: Convert any null phoneError to undefined to match BulkOrderItem type
    const sanitizedItems = validatedItems.map(item => ({
      ...item,
      phoneError: item.phoneError ?? undefined
    }));

    setOrderItems(sanitizedItems);

    if (hasErrors) {
      setError('Please fix validation errors before continuing');
      return false;
    }

    setError(null);
    return true;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const items = parseBulkText(csv);
        setOrderItems(items);
        setError(null);
      } catch {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Handle bulk text change
  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const items = parseBulkText(text);
    setOrderItems(items);
  };

  // Handle continue to summary
  const handleContinue = () => {
    if (!validateOrderItems()) {
      return;
    }

    setShowSummary(true);
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    try {
      setError(null);
      
      // Group items by bundle
      const bundleGroups = orderItems.reduce((groups, item) => {
        if (!item.bundle) return groups;
        const bundleId = item.bundle._id;
        if (!groups[bundleId]) {
          groups[bundleId] = {
            bundle: item.bundle,
            items: []
          };
        }
        groups[bundleId].items.push(item);
        return groups;
      }, {} as Record<string, { bundle: Bundle; items: BulkOrderItem[] }>);

      // Create orders for each bundle
      for (const [bundleId, group] of Object.entries(bundleGroups)) {
        const orderData: CreateBulkOrderData = {
          packageGroupId: (group.bundle.packageId as any)?._id || group.bundle.packageId,
          packageItemId: group.bundle._id || '',
          items: group.items.map(item => ({
            customerPhone: item.customerPhone.replace(/^\+?233/, '0'),
            bundleSize: {
              value: item.dataVolume,
              unit: item.dataUnit
            }
          }))
        };

        await createBulkOrder(orderData);
      }
      
      // Show success briefly before navigating to orders page
      setTimeout(() => {
        onSuccess();
        onClose();
        navigate('/agent/dashboard/orders');
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create bulk order');
      } else {
        setError('Failed to create bulk order');
      }
    }
  };

  // Handle back to form
  const handleBack = () => {
    setShowSummary(false);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = '0241234567 5GB\n0201234567 2GB\n0271234567 1GB';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_order_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const totalPrice = orderItems.reduce((sum, item) => {
    if (!item.bundle) return sum;
    return sum + item.bundle.price;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {showSummary ? 'Bulk Order Summary' : 'Bulk Order'}
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
              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{provider} Package</h3>
                    <p className="text-sm text-gray-600 mt-1">Available bundles in this package</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {availableBundles.map(bundle => (
                    <div key={bundle._id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FaWifi className="text-blue-500" />
                        <span>{bundle.dataVolume} {bundle.dataUnit}</span>
                        <span className="text-gray-500">•</span>
                        <FaClock className="text-green-500" />
                        <span>{bundle.validity} {bundle.validityUnit}</span>
                      </div>
                      <div className="font-bold text-green-600">
                        {bundle.currency} {bundle.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import Method Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Import Method</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                      importMethod === 'file'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaFileUpload />
                    Import CSV/Excel
                  </button>
                  <button
                    onClick={() => setImportMethod('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                      importMethod === 'manual'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <FaPlus />
                    Manual Entry
                  </button>
                </div>
              </div>

              {/* File Upload */}
              {importMethod === 'file' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Upload File</h3>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FaDownload />
                      Download Template
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: CSV, Excel. Columns: Customer Name, Phone Number, Data Volume, Data Unit
                  </p>
                </div>
              )}

              {/* Manual Entry */}
              {importMethod === 'manual' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Bulk Order Input</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter orders (one per line)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => handleBulkTextChange(e.target.value)}
                      placeholder="0241234567 5GB&#10;0201234567 2GB&#10;0271234567 1GB"
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Format: PhoneNumber DataVolume (e.g., 0241234567 5GB)
                    </p>
                  </div>
                  
                  {/* Preview */}
                  {orderItems.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Preview ({orderItems.length} items)</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {orderItems.map((item, index) => (
                          <div key={index} className={`flex items-center justify-between p-2 rounded text-sm ${
                            item.phoneError || item.dataError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                          }`}>
                            <div>
                              <span className="font-medium">{item.customerPhone}</span>
                              <span className="mx-2">•</span>
                              <span>{item.dataVolume} {item.dataUnit}</span>
                              {item.bundle && (
                                <span className="ml-2 text-green-600">• {item.bundle.currency} {item.bundle.price}</span>
                              )}
                            </div>
                            <div className="text-xs">
                              {item.phoneError && <span className="text-red-600">{item.phoneError}</span>}
                              {item.dataError && <span className="text-red-600">{item.dataError}</span>}
                              {!item.phoneError && !item.dataError && <span className="text-green-600">✓ Valid</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={orderItems.length === 0 || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processing...' : `Continue (${orderItems.length} items)`}
              </button>
            </div>
          ) : (
            // Order Summary
            <div className="space-y-6">
              {/* Package Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Package Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Items:</span>
                    <span className="font-medium text-green-600">
                      {orderItems.filter(item => !item.phoneError && !item.dataError).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Order Items ({orderItems.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.customerPhone}</div>
                        <div className="text-sm text-gray-600">{item.dataVolume} {item.dataUnit}</div>
                      </div>
                      <div className="text-right">
                        {item.bundle && (
                          <div className="text-sm font-medium text-green-600">
                            {item.bundle.currency} {item.bundle.price}
                          </div>
                        )}
                        {item.phoneError && (
                          <div className="text-xs text-red-600">{item.phoneError}</div>
                        )}
                        {item.dataError && (
                          <div className="text-xs text-red-600">{item.dataError}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    GHS {totalPrice.toFixed(2)}
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
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Confirm Bulk Order
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