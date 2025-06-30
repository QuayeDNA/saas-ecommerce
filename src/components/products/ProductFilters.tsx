// src/components/products/ProductFilters.tsx
import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import type { ProductFilters as IProductFilters } from '../../types/products';

interface ProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof IProductFilters, value: IProductFilters[keyof IProductFilters]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FaTimes size={12} />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="data-bundle">Data Bundle</option>
            <option value="voice-bundle">Voice Bundle</option>
            <option value="sms-bundle">SMS Bundle</option>
            <option value="combo-bundle">Combo Bundle</option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <select
            value={filters.provider || ''}
            onChange={(e) => handleFilterChange('provider', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Providers</option>
            <option value="MTN">MTN</option>
            <option value="Vodafone">Vodafone</option>
            <option value="AirtelTigo">AirtelTigo</option>
            <option value="Glo">Glo</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Network Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network
          </label>
          <select
            value={filters.network || ''}
            onChange={(e) => handleFilterChange('network', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="Vodafone">Vodafone</option>
            <option value="AirtelTigo">AirtelTigo</option>
            <option value="Glo">Glo</option>
          </select>
        </div>

        {/* Bundle Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bundle Type
          </label>
          <select
            value={filters.bundleType || ''}
            onChange={(e) => handleFilterChange('bundleType', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="data">Data</option>
            <option value="voice">Voice</option>
            <option value="sms">SMS</option>
            <option value="combo">Combo</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <input
            type="number"
            placeholder="999.99"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Include Deleted */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeDeleted"
            checked={filters.includeDeleted || false}
            onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeDeleted" className="ml-2 block text-sm text-gray-700">
            Include Deleted
          </label>
        </div>
      </div>
    </div>
  );
};
