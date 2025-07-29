// src/components/common/SearchAndFilter.tsx
import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Button, Input } from '../../design-system';

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface SearchAndFilterProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
      placeholder?: string;
    };
  };
  onFilterChange: (filterKey: string, value: string) => void;
  
  // Actions
  onSearch: (e: React.FormEvent) => void;
  onClearFilters: () => void;
  
  // UI Options
  showSearchButton?: boolean;
  showClearButton?: boolean;
  showFilterToggle?: boolean;
  className?: string;
  
  // Loading state
  isLoading?: boolean;
  
  // Custom actions
  customActions?: React.ReactNode;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  showSearchButton = true,
  showClearButton = true,
  showFilterToggle = true,
  className = "",
  isLoading = false,
  customActions
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters = Object.values(filters).some(filter => filter.value !== '');
  const hasSearchTerm = searchTerm.trim() !== '';

  const handleClearAll = () => {
    onSearchChange('');
    Object.keys(filters).forEach(filterKey => {
      onFilterChange(filterKey, '');
    });
    onClearFilters();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Search and Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <form onSubmit={onSearch} className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4"
              disabled={isLoading}
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showSearchButton && (
            <Button 
              onClick={onSearch}
              disabled={isLoading}
              className="px-4 py-2"
            >
              <FaSearch className="mr-2" />
              Search
            </Button>
          )}

          {showFilterToggle && (
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden"
            >
              <FaFilter className="mr-2" />
              Filters
            </Button>
          )}

          {showClearButton && (hasActiveFilters || hasSearchTerm) && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isLoading}
              className="px-4 py-2"
            >
              <FaTimes className="mr-2" />
              Clear
            </Button>
          )}

          {customActions}
        </div>
      </div>

      {/* Filters Section */}
      {Object.keys(filters).length > 0 && (
        <div className={`mt-4 pt-4 border-t border-gray-200 ${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(filters).map(([filterKey, filter]) => (
              <div key={filterKey}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filterKey, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(hasActiveFilters || hasSearchTerm) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {hasSearchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            
            {Object.entries(filters).map(([filterKey, filter]) => {
              if (filter.value) {
                const selectedOption = filter.options.find(opt => opt.value === filter.value);
                return (
                  <span key={filterKey} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    {filter.label}: {selectedOption?.label}
                    <button
                      onClick={() => onFilterChange(filterKey, '')}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 