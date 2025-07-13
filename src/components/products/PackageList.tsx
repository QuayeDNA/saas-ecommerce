// src/components/products/PackageList.tsx
import React, { useEffect, useState } from 'react';
import { usePackage } from '../../hooks/use-package';
import { getProviderColors } from '../../utils/provider-colors';
import { 
  FaSearch,
  FaFilter,
  FaBox,
  FaExclamationCircle
} from 'react-icons/fa';

export interface PackageListProps {
  provider?: string;
}

// Utility to always include provider in filters if present
function getEffectiveFilters(baseFilters: Record<string, unknown>, provider?: string) {
  return provider ? { ...baseFilters, provider } : baseFilters;
}

export const PackageList: React.FC<PackageListProps> = ({ provider }) => {
  const {
    packages,
    bundles,
    loading,
    error,
    pagination,
    packageFilters,
    fetchPackages,
    fetchBundles,
    setPackageFilters
  } = usePackage();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    provider: provider || '',
    isActive: '',
    includeDeleted: false
  });
  const [viewMode, setViewMode] = useState<'packages' | 'bundles'>('packages');

  useEffect(() => {
    if (viewMode === 'packages') {
      fetchPackages();
    } else {
      fetchBundles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPackages, fetchBundles, viewMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = getEffectiveFilters({ ...packageFilters, search: searchTerm }, provider);
    setPackageFilters(newFilters);
    if (viewMode === 'packages') {
      fetchPackages(newFilters);
    } else {
      fetchBundles(newFilters);
    }
  };

  const handleFilterChange = () => {
    // Convert isActive from string to boolean or undefined
    let isActive: boolean | undefined;
    if (localFilters.isActive === 'true') isActive = true;
    else if (localFilters.isActive === 'false') isActive = false;
    else isActive = undefined;

    const newFilters = getEffectiveFilters({
      ...packageFilters,
      ...localFilters,
      isActive,
      search: searchTerm
    }, provider);
    setPackageFilters(newFilters);
    if (viewMode === 'packages') {
      fetchPackages(newFilters);
    } else {
      fetchBundles(newFilters);
    }
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      provider: provider || '',
      isActive: '',
      includeDeleted: false
    });
    const newFilters = provider ? { provider } : {};
    setPackageFilters(newFilters);
    if (viewMode === 'packages') {
      fetchPackages(provider ? { provider } : undefined);
    } else {
      fetchBundles();
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = provider ? { provider } : packageFilters;
    if (viewMode === 'packages') {
      fetchPackages(newFilters, { page });
    } else {
      fetchBundles(newFilters, { page });
    }
  };

  const currentItems = viewMode === 'packages' ? (packages || []) : (bundles || []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationCircle className="text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">Error Loading {viewMode === 'packages' ? 'Packages' : 'Bundles'}</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {viewMode === 'packages' ? 'Package Groups' : 'Data Bundles'}
          </h2>
          <p className="text-gray-600">
            Manage your {viewMode === 'packages' ? 'package groups' : 'data bundles'} and configurations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('packages')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'packages'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setViewMode('bundles')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'bundles'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bundles
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${viewMode === 'packages' ? 'packages' : 'bundles'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="text-sm" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={localFilters.isActive}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Include Deleted
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.includeDeleted}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, includeDeleted: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show deleted items</span>
                </label>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleFilterChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {viewMode === 'packages' ? 'packages' : 'bundles'} found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new {viewMode === 'packages' ? 'package' : 'bundle'}.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Contact your administrator to add new {viewMode === 'packages' ? 'packages' : 'bundles'}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {viewMode === 'packages' ? 'Package' : 'Bundle'} Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  {viewMode === 'bundles' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validity
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(currentItems || []).map((item: any) => {
                  const providerColors = getProviderColors((item.provider || item.providerId) as string);
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: providerColors.background,
                            color: providerColors.text
                          }}
                        >
                          {item.provider || item.providerId}
                        </span>
                      </td>
                      {viewMode === 'bundles' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.dataVolume} {item.dataUnit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.validity} {item.validityUnit}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {viewMode === 'bundles' ? `GHS ${item.price}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
