import { useState, useEffect } from "react";
import type { Bundle } from "../../types/package";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { FaTimes, FaSave, FaCube } from "react-icons/fa";

interface BundleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Bundle) => Promise<void>;
  initialData?: Bundle | null;
  packageId?: string;
  providerId?: string;
  providerCode?: string;
}

const defaultBundle: Partial<Bundle> = {
  name: '',
  description: '',
  dataVolume: 0,
  dataUnit: 'MB',
  validity: 1,
  validityUnit: 'days',
  price: 0,
  currency: 'GHS',
  features: [],
  isActive: true,
  tags: [],
  category: 'custom',
  requiresGhanaCard: false,
  afaRequirements: [],
};

export const BundleFormModal: React.FC<BundleFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  packageId,
  providerId,
  providerCode,
}) => {
  const [formData, setFormData] = useState<Partial<Bundle>>(defaultBundle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAfaBundle = providerCode === 'AFA';

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Ensure providerId is a string when editing
        let providerIdValue: string | undefined = initialData.providerId;
        if (typeof initialData.providerId === 'object' && initialData.providerId !== null) {
          // If it's a populated object, extract the _id
          const providerObj = initialData.providerId as { _id?: string; id?: string };
          if (providerObj._id) {
            providerIdValue = providerObj._id;
          } else if (providerObj.id) {
            providerIdValue = providerObj.id;
          } else {
            providerIdValue = '';
          }
        }
        
        setFormData({
          ...initialData,
          providerId: String(providerIdValue || '')
        });
      } else {
        setFormData({
          ...defaultBundle,
          packageId: packageId || '',
          providerId: String(providerId || ''),
        });
      }
      setError(null);
    }
  }, [open, initialData, packageId, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        throw new Error('Bundle name is required');
      }
      
      // Only validate data volume for non-AFA bundles
      if (!isAfaBundle) {
        if (!formData.dataVolume || formData.dataVolume <= 0) {
          throw new Error('Data volume must be greater than 0');
        }
        
        // Validate validity - allow 'unlimited' or numbers > 0
        if (formData.validityUnit === 'unlimited') {
          formData.validity = 'unlimited';
        } else if (!formData.validity || (typeof formData.validity === 'number' && formData.validity <= 0)) {
          throw new Error('Validity must be greater than 0');
        }
      }
      
      if (!formData.price || formData.price < 0) {
        throw new Error('Price must be 0 or greater');
      }

      await onSubmit(formData as Bundle);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bundle');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Bundle, value: string | number | boolean | string[] | 'unlimited') => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaCube className="text-blue-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? 'Edit Bundle' : 'Create Bundle'}
                {isAfaBundle && <span className="text-blue-600 ml-2">(AFA Registration)</span>}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bundle Name *
                </label>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter bundle name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter bundle description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || 'custom'}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="unlimited">Unlimited</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {/* Data Configuration - Only show for non-AFA bundles */}
            {!isAfaBundle && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Data Configuration</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Volume *
                    </label>
                    <Input
                      type="number"
                      value={formData.dataVolume || ''}
                      onChange={(e) => handleInputChange('dataVolume', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Unit
                    </label>
                    <select
                      value={formData.dataUnit || 'MB'}
                      onChange={(e) => handleInputChange('dataUnit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Configuration - Only show for non-AFA bundles */}
            {!isAfaBundle && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Validity Configuration</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity Duration *
                    </label>
                    <Input
                      type="number"
                      value={formData.validityUnit === 'unlimited' ? '' : (formData.validity || '')}
                      onChange={(e) => handleInputChange('validity', Number(e.target.value))}
                      placeholder={formData.validityUnit === 'unlimited' ? 'Unlimited' : '1'}
                      min="1"
                      required={formData.validityUnit !== 'unlimited'}
                      disabled={loading || formData.validityUnit === 'unlimited'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity Unit
                    </label>
                    <select
                      value={formData.validityUnit || 'days'}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        handleInputChange('validityUnit', newUnit);
                        if (newUnit === 'unlimited') {
                          handleInputChange('validity', 'unlimited');
                        } else if (formData.validity === 'unlimited') {
                          handleInputChange('validity', 1);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <Input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <Input
                    type="text"
                    value={formData.currency || 'GHS'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="GHS"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Bundle
                </label>
              </div>
            </div>

            {/* AFA-Specific Fields */}
            {isAfaBundle && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">AFA Registration Requirements</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure the requirements for this AFA registration service. This is not a data bundle but a registration service.
                </p>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresGhanaCard"
                    checked={formData.requiresGhanaCard || false}
                    onChange={(e) => handleInputChange('requiresGhanaCard', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="requiresGhanaCard" className="ml-2 block text-sm text-gray-900">
                    Require Ghana Card Number for registration
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Registration Requirements
                  </label>
                  <textarea
                    value={(formData.afaRequirements || []).join('\n')}
                    onChange={(e) => handleInputChange('afaRequirements', e.target.value.split('\n').filter(req => req.trim()))}
                    placeholder="Enter additional requirements for AFA registration (one per line)&#10;Example:&#10;- Valid ID card&#10;- Proof of address&#10;- Business registration certificate"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List any additional documents or information required for this AFA registration (one per line)
                  </p>
                </div>
              </div>
            )}

            {/* Package and Provider Info (Read-only) */}
            {(packageId || providerId) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Package Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packageId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package ID
                      </label>
                      <Input
                        type="text"
                        value={packageId}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  )}
                  
                  {providerId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <Input
                        type="text"
                        value={providerId}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <FaSave className="text-sm" />
                {loading ? 'Saving...' : (initialData ? 'Update Bundle' : 'Create Bundle')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 