import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Package } from '../../types/package';

interface PackageFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Package>) => void;
  initialData?: Partial<Package> | null;
}

const PROVIDER_OPTIONS = [
  { value: 'MTN', label: 'MTN' },
  { value: 'TELECEL', label: 'TELECEL' },
  { value: 'AT', label: 'AT' },
  { value: 'GLO', label: 'GLO' },
];

const CATEGORY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'custom', label: 'Custom' },
];

export const PackageFormModal: React.FC<PackageFormModalProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState<Partial<Package>>({
    name: '',
    description: '',
    provider: '',
    category: 'daily',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        provider: initialData.provider || '',
        category: initialData.category || 'daily',
        isActive: initialData.isActive ?? true,
      });
    } else {
      setForm({ name: '', description: '', provider: '', category: 'daily', isActive: true });
    }
    setError(null);
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.provider || !form.category) {
      setError('Name, Provider, and Category are required.');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Package' : 'Create Package'}</h2>
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select provider</option>
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={!!form.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{initialData ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 