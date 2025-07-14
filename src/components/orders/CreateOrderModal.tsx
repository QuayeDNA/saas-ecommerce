// src/components/orders/CreateOrderModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import { usePackage } from '../../hooks/use-package';
import type { CreateSingleOrderData, CreateBulkOrderData } from '../../types/order';
import type { PackageGroup } from '../../types/package';

interface CreateOrderModalProps {
  type: 'single' | 'bulk';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerPreset?: string;
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

  // State for form fields
  const [formData, setFormData] = useState({
    packageGroupId: '',
    packageItemId: '',
    customerPhone: '',
    bundleValue: '',
    bundleUnit: 'GB' as 'MB' | 'GB',
    bulkInput: ''
  });
  const [selectedPackageGroup, setSelectedPackageGroup] = useState<PackageGroup | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      setFormData({
        packageGroupId: '',
        packageItemId: '',
        customerPhone: '',
        bundleValue: '',
        bundleUnit: 'GB',
        bulkInput: ''
      });
      setSelectedPackageGroup(null);
      setSummary(null);
      setError(null);
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
    }
  }, [formData.packageGroupId, packages]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle single order submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const orderData: CreateSingleOrderData = {
        packageGroupId: formData.packageGroupId,
        packageItemId: formData.packageItemId,
        customerPhone: formData.customerPhone,
        bundleSize: formData.bundleValue ? {
          value: parseFloat(formData.bundleValue),
          unit: formData.bundleUnit
        } : undefined,
        quantity: 1
      };
      const result = await createSingleOrder(orderData);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    }
  };

  // Handle bulk order submit
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const orderData: CreateBulkOrderData = {
        packageGroupId: formData.packageGroupId,
        bulkData: formData.bulkInput
      };
      const result = await createBulkOrder(orderData);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create bulk order');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">{type === 'single' ? 'Single Order' : 'Bulk Order'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
        </div>
        {/* Form */}
        {!summary && (
          <form onSubmit={type === 'single' ? handleSingleSubmit : handleBulkSubmit} className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
            {/* Provider & Group */}
            <div>
              <label className="block text-sm font-medium mb-1">Package Group</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.packageGroupId}
                onChange={e => handleInputChange('packageGroupId', e.target.value)}
                required
              >
                <option value="">Select group</option>
                {packages.map(group => (
                  <option key={group._id} value={group._id}>{group.name} ({group.provider})</option>
                ))}
              </select>
            </div>
            {type === 'single' && selectedPackageGroup && (
              <div>
                <label className="block text-sm font-medium mb-1">Package</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.packageItemId}
                  onChange={e => handleInputChange('packageItemId', e.target.value)}
                  required
                >
                  <option value="">Select package</option>
                  {selectedPackageGroup.packageItems.filter(item => item.isActive && !item.isDeleted).map(item => (
                    <option key={item._id} value={item._id}>{item.name} ({item.dataVolume}GB)</option>
                  ))}
                </select>
              </div>
            )}
            {type === 'single' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Phone</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. 0241234567"
                    value={formData.customerPhone}
                    onChange={e => handleInputChange('customerPhone', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bundle Size</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. 10 (auto GB)"
                    value={formData.bundleValue}
                    onChange={e => handleInputChange('bundleValue', e.target.value)}
                  />
                </div>
              </>
            )}
            {type === 'bulk' && (
              <div>
                <label className="block text-sm font-medium mb-1">Bulk Input</label>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[100px]"
                  placeholder={"One per line: 0241234567 10GB"}
                  value={formData.bulkInput}
                  onChange={e => handleInputChange('bulkInput', e.target.value)}
                  required
                />
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit'}
            </button>
          </form>
        )}
        {/* Summary */}
        {summary && type === 'single' && (
          <div className="p-4 flex-1 flex flex-col items-center justify-center">
            <FaCheckCircle className="text-green-500 text-3xl mb-2" />
            <div className="text-lg font-semibold mb-1">Order Created!</div>
            <div className="text-gray-700 text-sm mb-4">Order Number: {summary.orderNumber}</div>
            <div className="w-full bg-gray-50 rounded p-3 text-sm">
              <div><span className="font-medium">Phone:</span> {summary.items?.[0]?.customerPhone}</div>
              <div><span className="font-medium">Package:</span> {summary.items?.[0]?.packageDetails?.name}</div>
              <div><span className="font-medium">Price:</span> GH₵{summary.items?.[0]?.unitPrice}</div>
              <div><span className="font-medium">Status:</span> {summary.items?.[0]?.processingStatus}</div>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => { setSummary(null); onSuccess(); onClose(); }}
            >Done</button>
          </div>
        )}
        {summary && type === 'bulk' && (
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <span className="font-semibold">Bulk Order Summary</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Phone</th>
                    <th className="px-2 py-1 text-left">Volume</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-left">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1">{item.customerPhone}</td>
                      <td className="px-2 py-1">{item.bundleSize ? `${item.bundleSize.value} ${item.bundleSize.unit}` : '-'}</td>
                      <td className="px-2 py-1">
                        <span className={"inline-flex items-center gap-1 " + (item.status === 'pending' ? 'text-yellow-600' : item.status === 'completed' ? 'text-green-600' : 'text-gray-600')}>{item.status}</span>
                      </td>
                      <td className="px-2 py-1 text-red-600">{item.error || ''}</td>
                    </tr>
                  ))}
                  {summary.errors?.map((err: any, idx: number) => (
                    <tr key={summary.items?.length + idx} className="border-t bg-red-50">
                      <td className="px-2 py-1">{err.input}</td>
                      <td className="px-2 py-1">-</td>
                      <td className="px-2 py-1 text-red-600">Error</td>
                      <td className="px-2 py-1 text-red-600">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 self-end"
              onClick={() => { setSummary(null); onSuccess(); onClose(); }}
            >Done</button>
          </div>
        )}
      </div>
    </div>
  );
};
