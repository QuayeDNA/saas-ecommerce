// src/components/products/ProductModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import type { 
  Network, 
  Product, 
  ProductCategory,
  ProductBundleType, 
  ProductVariant 
} from '../../types/products';
import { useProduct } from '../../contexts/ProductContext';

interface ProductModalProps {
  product: Product | null;
  mode: 'create' | 'edit' | 'view';
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Helper function to create empty variant
const createEmptyVariant = (): Partial<ProductVariant> => ({
  name: '',
  sku: '',
  price: 0,
  inventory: 0,
  reservedInventory: 0,
  lowStockThreshold: 10,
  isActive: true,
  attributes: [],
  images: [],
  isDeleted: false,
  availableInventory: 0
});

// Helper function to create empty product
const createEmptyProduct = (): Partial<Product> => ({
  name: '',
  description: '',
  category: 'data-bundle',
  provider: 'MTN',
  variants: [],
  attributes: [],
  tags: [],
  isActive: true,
  isDeleted: false,
  salesCount: 0,
  viewCount: 0,
  rating: 0,
  reviewCount: 0
});

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  mode,
  isOpen,
  onClose,
  onSave
}) => {
  const { createProduct, updateProduct } = useProduct();
  
  const [formData, setFormData] = useState<Partial<Product>>(createEmptyProduct());
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when product or mode changes
  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData(product);
      setVariants(product.variants || []);
    } else {
      const emptyProduct = createEmptyProduct();
      setFormData(emptyProduct);
      setVariants([createEmptyVariant()]);
    }
    setErrors({});
  }, [product, mode, isOpen]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate basic product info
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate variants
    if (variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    }

    variants.forEach((variant, index) => {
      if (!variant.name?.trim()) {
        newErrors[`variant_${index}_name`] = 'Variant name is required';
      }
      if (!variant.sku?.trim()) {
        newErrors[`variant_${index}_sku`] = 'SKU is required';
      }
      if (!variant.price || variant.price <= 0) {
        newErrors[`variant_${index}_price`] = 'Valid price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleInputChange = <K extends keyof Product>(
    field: K, 
    value: Product[K]
  ) => {
    setFormData((prev: Partial<Product>) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  // Handle variant field changes
  const handleVariantChange = <K extends keyof ProductVariant>(
    index: number, 
    field: K, 
    value: ProductVariant[K]
  ) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
    
    // Clear variant error when user starts typing
    const errorKey = `variant_${index}_${field as string}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Add new variant
  const addVariant = () => {
    setVariants(prev => [...prev, createEmptyVariant()]);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
      // Clear errors for removed variant
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`variant_${index}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  // Check if category is bundle type
  const isBundleCategory = (category: ProductCategory): boolean => {
    return ['data-bundle', 'voice-bundle', 'sms-bundle', 'combo-bundle'].includes(category);
  };

  // Build complete variant data
  const buildCompleteVariant = (variant: Partial<ProductVariant>): ProductVariant => {
    const baseVariant: ProductVariant = {
      name: variant.name ?? '',
      sku: variant.sku ?? '',
      price: variant.price ?? 0,
      inventory: variant.inventory ?? 0,
      reservedInventory: variant.reservedInventory ?? 0,
      lowStockThreshold: variant.lowStockThreshold ?? 10,
      isActive: variant.isActive ?? true,
      attributes: variant.attributes ?? [],
      images: variant.images ?? [],
      isDeleted: variant.isDeleted ?? false,
      availableInventory: variant.availableInventory ?? (variant.inventory ?? 0),
      network: variant.network,
    };

    // Add bundle-specific fields if category is bundle
    if (formData.category && isBundleCategory(formData.category)) {
      return {
        ...baseVariant,
        dataVolume: variant.dataVolume ?? 0,
        validity: variant.validity ?? 0,
        bundleType: variant.bundleType,
      };
    }

    return baseVariant;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const completeVariants = variants.map(buildCompleteVariant);
      const productData: Partial<Product> = {
        ...formData,
        variants: completeVariants
      };

      if (mode === 'create') {
        await createProduct(productData);
      } else if (mode === 'edit' && product?._id) {
        await updateProduct(product._id, productData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  let modalTitle = '';
  switch (mode) {
    case 'create':
      modalTitle = 'Create Product';
      break;
    case 'edit':
      modalTitle = 'Edit Product';
      break;
    case 'view':
      modalTitle = 'View Product';
      break;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Basic Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label htmlFor='product-name' className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id='product-name'
                  value={formData.name ?? ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor='product-category' className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                    id='product-category'
                  value={formData.category ?? ''}
                  onChange={(e) => handleInputChange('category', e.target.value as ProductCategory)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="data-bundle">Data Bundle</option>
                  <option value="voice-bundle">Voice Bundle</option>
                  <option value="sms-bundle">SMS Bundle</option>
                  <option value="combo-bundle">Combo Bundle</option>
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                  <option value="service">Service</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label htmlFor='product-provider' className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  id='product-provider'
                  value={formData.provider ?? ''}
                  onChange={(e) => handleInputChange('provider', e.target.value as Network)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Provider</option>
                  <option value="MTN">MTN</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                  <option value="Glo">Glo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={isReadOnly}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor='product-description' className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id='product-description'
                value={formData.description ?? ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter product description..."
              />
            </div>
          </div>

          {/* Product Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Variants</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus size={12} />
                  Add Variant
                </button>
              )}
            </div>

            {errors.variants && (
              <p className="text-sm text-red-600">{errors.variants}</p>
            )}

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Variant {index + 1}
                    </h4>
                    {!isReadOnly && variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        aria-label={`Remove variant ${index + 1}`}
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Variant Name */}
                    <div>
                      <label htmlFor={`variant_${index}_name`} className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id={`variant_${index}_name`}
                        value={variant.name ?? ''}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                          errors[`variant_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`variant_${index}_name`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_name`]}
                        </p>
                      )}
                    </div>

                    {/* SKU */}
                    <div>
                      <label htmlFor={`variant_${index}_sku`} className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        id={`variant_${index}_sku`}
                        value={variant.sku ?? ''}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                          errors[`variant_${index}_sku`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`variant_${index}_sku`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_sku`]}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label htmlFor={`variant_${index}_price`} className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price ?? ''}
                        onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                          errors[`variant_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`variant_${index}_price`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[`variant_${index}_price`]}
                        </p>
                      )}
                    </div>

                    {/* Inventory */}
                    <div>
                      <label htmlFor={`variant_${index}_inventory`} className="block text-sm font-medium text-gray-700 mb-1">
                        Inventory
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.inventory ?? ''}
                        onChange={(e) => handleVariantChange(index, 'inventory', parseInt(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    {/* Low Stock Threshold */}
                    <div>
                      <label htmlFor={`variant_${index}_lowStockThreshold`} className="block text-sm font-medium text-gray-700 mb-1">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.lowStockThreshold ?? ''}
                        onChange={(e) => handleVariantChange(index, 'lowStockThreshold', parseInt(e.target.value) || 10)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    {/* Network */}
                    <div>
                      <label htmlFor={`variant_${index}_network`} className="block text-sm font-medium text-gray-700 mb-1">
                        Network
                      </label>
                      <select
                        value={variant.network ?? ''}
                        onChange={(e) => handleVariantChange(index, 'network', e.target.value as Network)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select Network</option>
                        <option value="MTN">MTN</option>
                        <option value="Vodafone">Vodafone</option>
                        <option value="AirtelTigo">AirtelTigo</option>
                        <option value="Glo">Glo</option>
                      </select>
                    </div>

                    {/* Bundle-specific fields */}
                    {formData.category && isBundleCategory(formData.category) && (
                      <>
                        <div>
                          <label htmlFor={`variant_${index}_dataVolume`} className="block text-sm font-medium text-gray-700 mb-1">
                            Data Volume (GB)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={variant.dataVolume ?? ''}
                            onChange={(e) => handleVariantChange(index, 'dataVolume', parseFloat(e.target.value) || 0)}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label htmlFor={`variant_${index}_validity`} className="block text-sm font-medium text-gray-700 mb-1">
                            Validity (Days)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.validity ?? ''}
                            onChange={(e) => handleVariantChange(index, 'validity', parseInt(e.target.value) || 0)}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label htmlFor={`variant_${index}_bundleType`} className="block text-sm font-medium text-gray-700 mb-1">
                            Bundle Type
                          </label>
                          <select
                            value={variant.bundleType ?? ''}
                            onChange={(e) => handleVariantChange(index, 'bundleType', e.target.value as ProductBundleType)}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          >
                            <option value="">Select Type</option>
                            <option value="data">Data</option>
                            <option value="voice">Voice</option>
                            <option value="sms">SMS</option>
                            <option value="combo">Combo</option>
                            <option value="physical">Physical</option>
                            <option value="digital">Digital</option>
                            <option value="service">Service</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};