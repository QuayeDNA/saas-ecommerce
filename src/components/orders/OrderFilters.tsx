// src/components/orders/OrderFilters.tsx
import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import type { OrderFilters as IOrderFilters } from '../../types/order';

interface OrderFiltersProps {
  filters: IOrderFilters;
  onFiltersChange: (filters: IOrderFilters) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof IOrderFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor='status' className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="partially_completed">Partially Completed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Order Type Filter */}
        <div>
          <label htmlFor='orderType' className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <select
            value={filters.orderType ?? ''}
            onChange={(e) => handleFilterChange('orderType', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="bulk">Bulk</option>
            <option value="regular">Regular</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label htmlFor='paymentStatus' className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus ?? ''}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label htmlFor='startDate' className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="sm:col-start-2 lg:col-start-auto">
          <label htmlFor='endDate' className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};
