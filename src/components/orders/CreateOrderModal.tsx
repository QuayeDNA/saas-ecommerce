// src/components/orders/CreateOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPhone, FaWifi } from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { useProduct } from '../../contexts/ProductContext';
import type { CreateSingleOrderData, CreateBulkOrderData } from '../../types/order';

interface CreateOrderModalProps {
  type: 'single' | 'bulk';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createSingleOrder, createBulkOrder, loading } = useOrder();
  const { products, fetchProducts } = useProduct();
  
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    customerPhone: '',
    bundleValue: '',
    bundleUnit: 'GB' as 'MB' | 'GB',
    quantity: 1,
    rawInput: ''
  });

  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    typeof products[0] extends { variants: infer V } ? V extends Array<infer U> ? U | null : null : null
  >(null);

  useEffect(() => {
    if (isOpen) {
      fetchProducts({ category: 'data-bundle' });
    }
  }, [isOpen, fetchProducts]);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p._id === formData.productId);
      setSelectedProduct(product ?? null);
      setFormData(prev => ({ ...prev, variantId: '' }));
      setSelectedVariant(null);
    }
  }, [formData.productId, products]);

  useEffect(() => {
    if (formData.variantId && selectedProduct) {
      const variant = selectedProduct.variants.find(
        (v: typeof selectedProduct.variants[0]) => v._id === formData.variantId
      );
      setSelectedVariant(variant ?? null);
    }
  }, [formData.variantId, selectedProduct]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === 'single') {
        const orderData: CreateSingleOrderData = {
          productId: formData.productId,
          variantId: formData.variantId,
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
          productId: formData.productId,
          variantId: formData.variantId,
          rawInput: formData.rawInput
        };
        
        await createBulkOrder(orderData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create {type === 'single' ? 'Single' : 'Bulk'} Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Product Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleInputChange('productId', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Product</option>
                {products.filter(p => p.category.includes('bundle')).map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {product.provider}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant *
              </label>
              <select
                value={formData.variantId}
                onChange={(e) => handleInputChange('variantId', e.target.value)}
                required
                disabled={!selectedProduct}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Variant</option>
                {selectedProduct?.variants.map((variant: typeof selectedProduct.variants[0]) => (
                  <option key={variant._id} value={variant._id}>
                    {variant.name} - ${variant.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variant Details */}
          {selectedVariant && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Selected Variant Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Price:</span>
                  <div className="font-medium">${selectedVariant.price}</div>
                </div>
                {selectedVariant.dataVolume && (
                  <div>
                    <span className="text-blue-700">Data:</span>
                    <div className="font-medium">{selectedVariant.dataVolume}GB</div>
                  </div>
                )}
                {selectedVariant.validity && (
                  <div>
                    <span className="text-blue-700">Validity:</span>
                    <div className="font-medium">{selectedVariant.validity} days</div>
                  </div>
                )}
                {selectedVariant.network && (
                  <div>
                    <span className="text-blue-700">Network:</span>
                    <div className="font-medium flex items-center gap-1">
                      <FaWifi />
                      {selectedVariant.network}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Single Order Fields */}
          {type === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+233123456789"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bundle Size
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bundleValue}
                    onChange={(e) => handleInputChange('bundleValue', e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.bundleUnit}
                    onChange={(e) => handleInputChange('bundleUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Bulk Order Fields */}
          {type === 'bulk' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulk Input Data *
              </label>
              <textarea
                value={formData.rawInput}
                onChange={(e) => handleInputChange('rawInput', e.target.value)}
                placeholder={`Enter phone numbers and bundle sizes in this format:
+233123456789:1GB
+233987654321:500MB
+233555666777:2GB`}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-600">
                Format: phone:bundleSize (one per line). Example: +233123456789:1GB
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Create ${type === 'single' ? 'Single' : 'Bulk'} Order`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
