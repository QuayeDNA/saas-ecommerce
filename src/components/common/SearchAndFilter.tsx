import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Button, Input, Select, Card, CardBody } from '../../design-system';
import { useDebounce } from '../../hooks';

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  disabled?: boolean;
}

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  debounceDelay?: number;
  minSearchLength?: number;
  enableAutoSearch?: boolean;

  filters: {
    [key: string]: {
      value: string;
      options: FilterOption[];
      label: string;
      placeholder?: string;
    };
  };
  onFilterChange: (filterKey: string, value: string) => void;

  dateRange?: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  showDateRange?: boolean;

  onSearch: (e: React.FormEvent) => void;
  onClearFilters: () => void;

  showSearchButton?: boolean;
  showClearButton?: boolean;
  showFilterToggle?: boolean;
  className?: string;

  isLoading?: boolean;

  customActions?: React.ReactNode;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  debounceDelay = 500,
  minSearchLength = 0,
  enableAutoSearch = true,
  filters,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  showDateRange = false,
  onSearch,
  onClearFilters,
  showSearchButton = true,
  showClearButton = true,
  showFilterToggle = true,
  className = "",
  isLoading = false,
  customActions
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [immediateSearchTerm, setImmediateSearchTerm] = useState(searchTerm);

  const debouncedSearch = useDebounce((...args: unknown[]) => {
    const value = args[0] as string;
    if (value.length >= minSearchLength || value === '') {
      onSearchChange(value);
    }
  }, debounceDelay);

  useEffect(() => {
    setImmediateSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => () => debouncedSearch.cleanup(), [debouncedSearch]);

  const handleSearchInputChange = useCallback((value: string) => {
    setImmediateSearchTerm(value);
    if (enableAutoSearch) {
      debouncedSearch(value);
    }
  }, [enableAutoSearch, debouncedSearch]);

  const handleImmediateSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cleanup();
    onSearchChange(immediateSearchTerm);
    onSearch(e);
  }, [immediateSearchTerm, onSearchChange, onSearch, debouncedSearch]);

  const hasActiveFilters = Object.values(filters).some(filter => filter.value !== '') ||
    (showDateRange && dateRange && (dateRange.startDate || dateRange.endDate));
  const hasSearchTerm = searchTerm.trim() !== '';
  const hasImmediateSearchTerm = immediateSearchTerm.trim() !== '';

  const handleClearAll = () => {
    setImmediateSearchTerm('');
    onSearchChange('');
    Object.keys(filters).forEach(filterKey => {
      onFilterChange(filterKey, '');
    });
    if (showDateRange && onDateRangeChange) {
      onDateRangeChange('', '');
    }
    onClearFilters();
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (onDateRangeChange && dateRange) {
      const newStartDate = field === 'startDate' ? value : dateRange.startDate;
      const newEndDate = field === 'endDate' ? value : dateRange.endDate;
      onDateRangeChange(newStartDate, newEndDate);

      if ((newStartDate && newEndDate) || (!newStartDate && !newEndDate)) {
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
          onSearch(fakeEvent);
        }, 100);
      }
    }
  };

  return (
    <Card className={className} variant="outlined">
      <CardBody>
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleImmediateSearch} className="flex-1">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={immediateSearchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              leftIcon={<FaSearch className="text-[var(--text-muted)]" />}
              disabled={isLoading}
            />
          </form>

          <div className="flex items-center gap-2 max-sm:flex-wrap">
            {showSearchButton && (
              <Button
                onClick={handleImmediateSearch}
                disabled={isLoading}
                size="sm"
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
                size="sm"
              >
                <FaFilter className="mr-2" />
                Filters
              </Button>
            )}

            {showClearButton && (hasActiveFilters || hasSearchTerm || hasImmediateSearchTerm) && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isLoading}
                size="sm"
              >
                <FaTimes className="mr-2" />
                Clear
              </Button>
            )}

            {customActions}
          </div>
        </div>

        {(Object.keys(filters).length > 0 || showDateRange) && (
          <div className={`mt-4 pt-4 border-t border-[var(--border-color)] ${showMobileFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(filters).map(([filterKey, filter]) => (
                <div key={filterKey}>
                  <Select
                    label={filter.label}
                    value={filter.value}
                    onChange={(value) => onFilterChange(filterKey, value)}
                    options={[
                      { value: '', label: filter.placeholder || `All ${filter.label}` },
                      ...filter.options.map(option => ({
                        value: option.value,
                        label: option.label,
                        disabled: option.disabled || false
                      }))
                    ]}
                    disabled={isLoading}
                  />
                </div>
              ))}

              {showDateRange && (
                <>
                  <div>
                    <Input
                      type="date"
                      label="Start Date"
                      value={dateRange?.startDate || ''}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      label="End Date"
                      value={dateRange?.endDate || ''}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {(hasActiveFilters || hasSearchTerm || hasImmediateSearchTerm) && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex flex-wrap gap-2">
              {(hasSearchTerm || hasImmediateSearchTerm) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <span>Search: "{hasSearchTerm ? searchTerm : immediateSearchTerm}"</span>
                  <button
                    onClick={() => {
                      setImmediateSearchTerm('');
                      onSearchChange('');
                    }}
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                    aria-label="Clear search"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}

              {Object.entries(filters).map(([filterKey, filter]) => {
                if (filter.value) {
                  const selectedOption = filter.options.find(opt => opt.value === filter.value);
                  return (
                    <span key={filterKey} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[var(--bg-surface-alt)] text-[var(--text-primary)]">
                      <span>{filter.label}: {selectedOption?.label}</span>
                      <button
                        onClick={() => onFilterChange(filterKey, '')}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        aria-label={`Clear ${filter.label} filter`}
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  );
                }
                return null;
              })}

              {showDateRange && dateRange && (dateRange.startDate || dateRange.endDate) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-[var(--success)]/10 text-[var(--success)]">
                  <span>Date: {dateRange.startDate || 'Start'} - {dateRange.endDate || 'End'}</span>
                  <button
                    onClick={() => onDateRangeChange?.('', '')}
                    className="text-[var(--success)] hover:text-[var(--success)]"
                    aria-label="Clear date range"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}; 