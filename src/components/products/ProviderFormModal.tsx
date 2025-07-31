/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/products/ProviderFormModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import type { Provider } from '../../types/package';

// Extended provider interface with tags for the form
export interface ProviderFormData extends Omit<Partial<Provider>, 'code'> {
  code?: 'MTN' | 'TELECEL' | 'AT' | 'GLO' | '';
  tags?: string[];
}

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  provider?: Provider | null;
  mode: 'create' | 'edit';
  loading: boolean;
}

export const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  provider: providerData,
  mode,
  loading
}) => {
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    code: '',
    description: '',
    tags: [],
    isActive: true
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (providerData && mode === 'edit') {
      // Convert Provider to ProviderFormData (adding tags if needed)
      const formDataFromProvider: ProviderFormData = {
        ...providerData,
        tags: []  // Initialize tags as empty array since it's not in Provider type
      };
      setFormData(formDataFromProvider);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        tags: [],
        isActive: true
      });
    }
  }, [providerData, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error submitting provider
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create Provider' : 'Edit Provider'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name *
              </label>
              <input
                id="providerName"
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="providerCode" className="block text-sm font-medium text-gray-700 mb-1">
                Provider Code *
              </label>
              <input
                id="providerCode"
                type="text"
                value={formData.code ?? ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  const allowedCodes = ['MTN', 'TELECEL', 'AT', 'GLO', ''] as const;
                  setFormData(prev => ({
                    ...prev,
                    code: allowedCodes.includes(value as any) ? (value as ProviderFormData['code']) : ''
                  }));
                }}
                placeholder="e.g., MTN, VODAFONE"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="providerDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="providerDescription"
              value={formData.description ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="providerTags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="providerTags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="url"
              value={formData.logo?.url ?? ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                logo: { 
                  url: e.target.value, 
                  alt: prev.logo?.alt ?? '' // Ensure alt is always a string
                } 
              }))}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Provider
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Provider' : 'Update Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
