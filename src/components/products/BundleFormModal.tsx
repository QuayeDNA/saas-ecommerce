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
        let providerIdValue: string | undefined = initialData.providerId;
        if (typeof initialData.providerId === 'object' && initialData.providerId !== null) {
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
      if (!formData.name?.trim()) {
        throw new Error('Bundle name is required');
      }

      if (!isAfaBundle) {
        if (!formData.dataVolume || formData.dataVolume <= 0) {
          throw new Error('Data volume must be greater than 0');
        }

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

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5";
  const sectionTitleClass = "text-base font-semibold text-[var(--text-primary)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FaCube className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {initialData ? 'Edit Bundle' : 'Create Bundle'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {isAfaBundle ? 'AFA Registration Service' : 'Data Bundle Configuration'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
              disabled={loading}
            >
              <FaTimes />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 p-4">
                <p className="text-sm font-medium text-[var(--error)]">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={sectionTitleClass}>Basic Information</h3>

              <div>
                <label className={labelClass}>Bundle Name *</label>
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
                <label className={labelClass}>Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter bundle description"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={formData.category || 'custom'}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={inputClass}
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

            {/* Data Configuration */}
            {!isAfaBundle && (
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Data Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Data Volume *</label>
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
                    <label className={labelClass}>Data Unit</label>
                    <select
                      value={formData.dataUnit || 'MB'}
                      onChange={(e) => handleInputChange('dataUnit', e.target.value)}
                      className={inputClass}
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

            {/* Validity Configuration */}
            {!isAfaBundle && (
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Validity Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Validity Duration *</label>
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
                    <label className={labelClass}>Validity Unit</label>
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
                      className={inputClass}
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
              <h3 className={sectionTitleClass}>Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price *</label>
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
                  <label className={labelClass}>Currency</label>
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
            <div className="space-y-3">
              <h3 className={sectionTitleClass}>Status</h3>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  disabled={loading}
                />
                <span className="text-sm text-[var(--text-primary)]">Active Bundle</span>
              </label>
            </div>

            {/* AFA-Specific Fields */}
            {isAfaBundle && (
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>AFA Registration Requirements</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Configure the requirements for this AFA registration service.
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresGhanaCard || false}
                    onChange={(e) => handleInputChange('requiresGhanaCard', e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    disabled={loading}
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Require Ghana Card Number for registration
                  </span>
                </label>

                <div>
                  <label className={labelClass}>Additional Registration Requirements</label>
                  <textarea
                    value={(formData.afaRequirements || []).join('\n')}
                    onChange={(e) => handleInputChange('afaRequirements', e.target.value.split('\n').filter(req => req.trim()))}
                    placeholder="Enter additional requirements (one per line)"
                    rows={4}
                    className={`${inputClass} resize-none`}
                    disabled={loading}
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    List any additional documents or information required (one per line)
                  </p>
                </div>
              </div>
            )}

            {/* Package and Provider Info */}
            {(packageId || providerId) && (
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Package Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packageId && (
                    <div>
                      <label className={labelClass}>Package ID</label>
                      <Input type="text" value={packageId} disabled className="bg-[var(--bg-surface-alt)]" />
                    </div>
                  )}
                  {providerId && (
                    <div>
                      <label className={labelClass}>Provider</label>
                      <Input type="text" value={providerId} disabled className="bg-[var(--bg-surface-alt)]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-5 border-t border-[var(--border-color)]">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (
                  <><FaSave className="mr-1.5" />{initialData ? 'Update Bundle' : 'Create Bundle'}</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
