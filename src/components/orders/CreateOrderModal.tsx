// src/components/orders/CreateOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPhone, 
  FaWifi, 
  FaShoppingCart,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaFileImport,
  FaDownload,
} from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { usePackage } from '../../hooks/use-package';
import type { CreateSingleOrderData, CreateBulkOrderData } from '../../types/order';
import type { PackageGroup, PackageItem } from '../../types/package';

interface CreateOrderModalProps {
  type: 'single' | 'bulk';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerPreset?: string; // New prop for provider preset
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  providerPreset
}) => {
  const { createSingleOrder, createBulkOrder, loading } = useOrder();
  const { packages, fetchPackages } = usePackage();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showBulkHelp, setShowBulkHelp] = useState(false);
  const [formData, setFormData] = useState({
    packageGroupId: '',
    packageItemId: '',
    customerPhone: '',
    bundleValue: '',
    bundleUnit: 'GB' as 'MB' | 'GB',
    quantity: 1,
    rawInput: ''
  });

  const [selectedPackageGroup, setSelectedPackageGroup] = useState<PackageGroup | null>(null);
  const [selectedPackageItem, setSelectedPackageItem] = useState<PackageItem | null>(null);

  const steps = type === 'single' 
    ? [
        { id: 1, title: 'Select Package', description: 'Choose data bundle' },
        { id: 2, title: 'Customer Info', description: 'Enter details' },
        { id: 3, title: 'Review', description: 'Confirm order' }
      ]
    : [
        { id: 1, title: 'Select Package', description: 'Choose data bundle' },
        { id: 2, title: 'Bulk Input', description: 'Enter phone numbers' },
        { id: 3, title: 'Review', description: 'Confirm orders' }
      ];

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      setCurrentStep(1);
      
      // Reset form data when modal opens
      setFormData({
        packageGroupId: '',
        packageItemId: '',
        customerPhone: '',
        bundleValue: '',
        bundleUnit: 'GB' as 'MB' | 'GB',
        quantity: 1,
        rawInput: ''
      });
      setSelectedPackageGroup(null);
      setSelectedPackageItem(null);
    }
  }, [isOpen, fetchPackages]);

  // Auto-select provider when preset is provided
  useEffect(() => {
    if (providerPreset && packages.length > 0 && isOpen) {
      const providerPackage = packages.find(p => p.provider === providerPreset);
      if (providerPackage) {
        setFormData(prev => ({ ...prev, packageGroupId: providerPackage._id ?? '' }));
      }
    }
  }, [providerPreset, packages, isOpen]);

  useEffect(() => {
    if (formData.packageGroupId) {
      const packageGroup = packages.find(p => p._id === formData.packageGroupId);
      setSelectedPackageGroup(packageGroup ?? null);
      setFormData(prev => ({ ...prev, packageItemId: '' }));
      setSelectedPackageItem(null);
    }
  }, [formData.packageGroupId, packages]);

  useEffect(() => {
    if (formData.packageItemId && selectedPackageGroup) {
      const packageItem = selectedPackageGroup.packageItems.find(
        (item) => item._id === formData.packageItemId
      );
      setSelectedPackageItem(packageItem ?? null);
      
      if (packageItem) {
        setFormData(prev => ({
          ...prev,
          bundleValue: packageItem.dataVolume.toString(),
          bundleUnit: 'GB'
        }));
      }
    }
  }, [formData.packageItemId, selectedPackageGroup]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateBulkTemplate = () => {
    const template = `phone,bundleSize
+233123456789,1GB
+233987654321,500MB
+233555666777,2GB`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-orders-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === 'single') {
        const orderData: CreateSingleOrderData = {
          packageGroupId: formData.packageGroupId,
          packageItemId: formData.packageItemId,
          customerPhone: formData.customerPhone,
          bundleSize: formData.bundleValue ? {
            value: parseFloat(formData.bundleValue),
            unit: formData.bundleUnit
          } : undefined,
          quantity: formData.quantity
        };
        
        await createSingleOrder(orderData);
      } else {
        const orderData: CreateBulkOrderData = {
          packageGroupId: formData.packageGroupId,
          packageItemId: formData.packageItemId,
          rawInput: formData.rawInput
        };
        
        await createBulkOrder(orderData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const canProceedToStep2 = formData.packageGroupId && formData.packageItemId;
  const canProceedToStep3 = type === 'single' 
    ? canProceedToStep2 && formData.customerPhone
    : canProceedToStep2 && formData.rawInput.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaShoppingCart className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create {type === 'single' ? 'Single' : 'Bulk'} Order
                </h2>
                <p className="text-sm text-gray-600">
                  {steps.find(s => s.id === currentStep)?.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full sm:h-auto">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Step 1: Package Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Select Data Bundle</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Choose the package group and specific data bundle for your {type} order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Group *
                    </label>
                    <select
                      value={formData.packageGroupId}
                      onChange={(e) => handleInputChange('packageGroupId', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a package group...</option>
                      {packages
                        .filter(packageGroup => !providerPreset || packageGroup.provider === providerPreset)
                        .map((packageGroup: PackageGroup) => (
                          <option key={packageGroup._id} value={packageGroup._id}>
                            {packageGroup.name} ({packageGroup.provider})
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select the package group that contains your desired data bundles
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Bundle *
                    </label>
                    <select
                      value={formData.packageItemId}
                      onChange={(e) => handleInputChange('packageItemId', e.target.value)}
                      required
                      disabled={!selectedPackageGroup}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {selectedPackageGroup ? 'Choose a data bundle...' : 'Select package group first'}
                      </option>
                      {selectedPackageGroup?.packageItems.map((item: PackageItem) => (
                        <option key={item._id} value={item._id}>
                          {item.name} - GH₵ {item.price} ({item.dataVolume}GB, {item.validity} days)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose the specific data bundle with price and validity period
                    </p>
                  </div>

                  {/* Package Item Preview */}
                  {selectedPackageItem && selectedPackageGroup && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3">Selected Bundle Preview</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-green-600">GH₵ {selectedPackageItem.price}</div>
                          <div className="text-xs text-green-700">Price</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">{selectedPackageItem.dataVolume}GB</div>
                          <div className="text-xs text-blue-700">Data</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-orange-600">{selectedPackageItem.validity}</div>
                          <div className="text-xs text-orange-700">Days</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-purple-600 flex items-center justify-center gap-1">
                            <FaWifi size={16} />
                            {selectedPackageGroup.provider}
                          </div>
                          <div className="text-xs text-purple-700">Network</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Customer Info (Single) or Bulk Input */}
            {currentStep === 2 && type === 'single' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Customer Information</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Enter the customer's phone number and order quantity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-1" />
                      Customer Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="+233123456789"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the phone number where the data bundle will be sent
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bundle Size
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.bundleValue}
                        onChange={(e) => handleInputChange('bundleValue', e.target.value)}
                        readOnly={!!selectedPackageItem}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically set from selected bundle
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How many bundles to send (max 10)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Bulk Input */}
            {currentStep === 2 && type === 'bulk' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Bulk Order Input</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Enter multiple phone numbers with their respective bundle sizes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Input Format Help</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={generateBulkTemplate}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FaDownload size={12} />
                        Download Template
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBulkHelp(!showBulkHelp)}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <FaFileImport size={12} />
                        {showBulkHelp ? 'Hide' : 'Show'} Examples
                        {showBulkHelp ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>

                  {showBulkHelp && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="font-medium text-gray-700 mb-2">Supported formats:</p>
                      <div className="space-y-1 text-gray-600 font-mono">
                        <div>• phone:bundleSize → +233123456789:1GB</div>
                        <div>• phone,bundleSize → +233123456789,500MB</div>
                        <div>• phone bundleSize → +233123456789 2GB</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Numbers and Bundle Sizes *
                  </label>
                  <textarea
                    value={formData.rawInput}
                    onChange={(e) => handleInputChange('rawInput', e.target.value)}
                    placeholder={`Enter phone numbers and bundle sizes:
+233123456789:1GB
+233987654321:500MB
+233555666777:2GB

Or use comma separation:
+233123456789,1GB
+233987654321,500MB`}
                    required
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    One entry per line. Supports colon (:), comma (,), or space separation.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Review Your Order</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Please review all details before submitting your {type} order.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Package:</span>
                        <span className="text-gray-900 font-medium ml-2">{selectedPackageGroup?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Provider:</span>
                        <span className="text-gray-900 font-medium ml-2">{selectedPackageGroup?.provider}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Bundle:</span>
                        <span className="text-gray-900 font-medium ml-2">{selectedPackageItem?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="text-gray-900 font-medium ml-2">GH₵ {selectedPackageItem?.price}</span>
                      </div>
                    </div>
                  </div>

                  {type === 'single' ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{formData.customerPhone}</div>
                            <div className="text-sm text-gray-600">
                              {formData.quantity}x {formData.bundleValue}{formData.bundleUnit} bundle
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              GH₵ {((selectedPackageItem?.price ?? 0) * formData.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bulk Orders</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {formData.rawInput.split('\n').filter(line => line.trim()).length}
                          </div>
                          <div className="text-sm text-gray-600">Orders to process</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3)
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : `Create ${type === 'single' ? 'Order' : 'Bulk Orders'}`}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
