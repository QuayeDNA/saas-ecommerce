/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/products/PackageFormModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPlus
} from 'react-icons/fa';
import type { Package, Bundle, Provider } from '../../types/package';
import { providerService } from '../../services/provider.service';

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  package?: Package | Bundle | null;
  mode: 'create' | 'edit';
  viewMode: 'packages' | 'bundles';
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  package: packageData,
  mode,
  viewMode
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    provider: '',
    isActive: true,
    // Bundle-specific fields
    dataVolume: 0,
    dataUnit: 'GB',
    validity: 1,
    validityUnit: 'days',
    price: 0,
    currency: 'GHS',
    features: [],
    bundleCode: '',
    category: '',
    tags: [],
    packageId: '',
    providerId: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [, setPackages] = useState<Package[]>([]);
  const [, setLoadingProviders] = useState(false);
  const [, setLoadingPackages] = useState(false);

  useEffect(() => {
    if (packageData && mode === 'edit') {
      setFormData(packageData);
    } else {
      setFormData({
        name: '',
        description: '',
        provider: '',
        isActive: true,
        // Bundle-specific fields
        dataVolume: 0,
        dataUnit: 'GB',
        validity: 1,
        validityUnit: 'days',
        price: 0,
        currency: 'GHS',
        features: [],
        bundleCode: '',
        category: '',
        tags: [],
        packageId: '',
        providerId: ''
      });
    }
  }, [packageData, mode, isOpen]);

  // Fetch providers and packages when modal opens
  const fetchProviders = React.useCallback(async () => {
    try {
      setLoadingProviders(true);
      const providersResponse = await providerService.getPublicProviders();
      setProviders(providersResponse.providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Fallback to static providers if API fails
      setProviders([
        { 
          _id: '1', 
          name: 'MTN Ghana', 
          code: 'MTN' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          _id: '2', 
          name: 'Telecel Ghana', 
          code: 'TELECEL' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          _id: '3', 
          name: 'AT BIG TIME',
          code: 'AT' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '4',
          name: 'AIRTEL TIGO iShare Premium',
          code: 'AT' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const fetchPackages = React.useCallback(async () => {
    try {
      setLoadingPackages(true);
      // This would need to be implemented in the package service
      // For now, we'll use an empty array
      setPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      if (viewMode === 'bundles') {
        fetchPackages();
      }
    }
  }, [fetchPackages, fetchProviders, isOpen, viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare data based on view mode
      const submitData = viewMode === 'packages' 
        ? {
            name: formData.name,
            description: formData.description,
            provider: formData.provider,
            category: formData.category || 'daily',
            isActive: formData.isActive
          }
        : {
            name: formData.name,
            description: formData.description,
            dataVolume: formData.dataVolume,
            dataUnit: formData.dataUnit,
            validity: formData.validity,
            validityUnit: formData.validityUnit,
            price: formData.price,
            currency: formData.currency,
            features: formData.features,
            bundleCode: formData.bundleCode,
            category: formData.category,
            tags: formData.tags,
            packageId: formData.packageId,
            providerId: formData.providerId,
            isActive: formData.isActive
          };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev: { tags: any; }) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: { tags: any[]; }) => ({
      ...prev,
      tags: prev.tags?.filter((tag: string) => tag !== tagToRemove) || []
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
      setFormData((prev: { features: any; }) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData((prev: { features: any[]; }) => ({
      ...prev,
      features: prev.features?.filter((feature: string) => feature !== featureToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create' : 'Edit'} {viewMode === 'packages' ? 'Package' : 'Bundle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${viewMode === 'packages' ? 'package' : 'bundle'} name`}
                />
              </div>

              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                  Provider *
                </label>
                <select
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Provider</option>
                  {providers.map(provider => (
                    <option key={provider._id} value={provider.code}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
              />
            </div>

            {viewMode === 'packages' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="unlimited">Unlimited</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>

          {/* Bundle-specific fields */}
          {viewMode === 'bundles' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Bundle Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="dataVolume" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Volume *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.dataVolume}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, dataVolume: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="dataUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Unit
                  </label>
                  <select
                    value={formData.dataUnit}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, dataUnit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (GHS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="validity" className="block text-sm font-medium text-gray-700 mb-1">
                    Validity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.validity}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, validity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="validityUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Validity Unit
                  </label>
                  <select
                    value={formData.validityUnit}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, validityUnit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="bundleCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Bundle Code
                </label>
                <input
                  type="text"
                  value={formData.bundleCode}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, bundleCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated if left empty"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Social Media, Gaming, etc."
                />
              </div>

              {/* Features */}
              <div>
                <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a feature"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
                {formData.features && formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Status</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'create' ? 'Create' : 'Update'} {viewMode === 'packages' ? 'Package' : 'Bundle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
