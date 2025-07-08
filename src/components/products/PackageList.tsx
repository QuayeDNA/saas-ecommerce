// src/components/products/PackageList.tsx
import React, { useEffect, useState } from 'react';
import { usePackage } from '../../hooks/use-package';
import { PackageFormModal } from './PackageFormModal';
import type { PackageGroup } from '../../types/package';
import { getProviderColors } from '../../utils/provider-colors';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUndo, 
  FaSearch,
  FaFilter,
  FaBox,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaExclamationCircle
} from 'react-icons/fa';

export interface PackageListProps {
  provider?: string;
}

export const PackageList: React.FC<PackageListProps> = ({ provider }) => {
  const {
    packages,
    loading,
    error,
    pagination,
    filters,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    restorePackage,
    setFilters
  } = usePackage();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<PackageGroup | null>(null);
  const [selectedPackageItem, setSelectedPackageItem] = useState<PackageItem | null>(null);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    provider: provider || '',
    isActive: '',
    includeDeleted: false
  });

  useEffect(() => {
    // If provider prop is set, always filter by that provider
    if (provider) {
      const newFilters = { ...filters, provider };
      setFilters(newFilters);
      fetchPackages(newFilters);
    } else {
      fetchPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPackages, provider]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    fetchPackages(newFilters);
  };

  const handleFilterChange = () => {
    // Convert isActive from string to boolean or undefined
    let isActive: boolean | undefined;
    if (localFilters.isActive === 'true') isActive = true;
    else if (localFilters.isActive === 'false') isActive = false;
    else isActive = undefined;

    const newFilters = {
      ...filters,
      ...localFilters,
      isActive,
      search: searchTerm
    };
    setFilters(newFilters);
    fetchPackages(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      provider: provider || '',
      isActive: '',
      includeDeleted: false
    });
    setFilters({});
    fetchPackages({});
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedPackage(null);
    setShowModal(true);
  };

  const handleEdit = (pkg: PackageGroup) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleModalSubmit = async (data: Partial<PackageGroup>) => {
    try {
      if (modalMode === 'create') {
        await createPackage(data);
      } else if (selectedPackage?._id) {
        await updatePackage(selectedPackage._id, data);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting package:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      await deletePackage(id);
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm('Are you sure you want to restore this package?')) {
      await restorePackage(id);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPackages(filters, { page });
  };

  // Flatten all package items with their parent package group info
  const allPackageItems = packages.flatMap(pkg =>
    pkg.packageItems.map(item => ({
      ...item,
      provider: pkg.provider,
      groupName: pkg.name,
      groupId: pkg._id,
      groupIsActive: pkg.isActive,
      groupIsDeleted: pkg.isDeleted,
      groupDescription: pkg.description,
      groupTags: pkg.tags,
    }))
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaExclamationCircle className="text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-red-800">Error Loading Packages</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {provider ? `${provider} Packages` : 'Data Packages'}
          </h1>
          <p className="text-gray-600">
            {provider
              ? `Browse all packages for ${provider}`
              : 'Manage your mobile data bundle packages and inventory'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus size={16} />
          <span className="hidden sm:inline">Add Package</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages by name, description, or provider..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSearch className="sm:hidden" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaFilter className="sm:hidden" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {!provider && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={localFilters.provider}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Providers</option>
                    <option value="MTN">MTN</option>
                    <option value="TELECEL">TELECEL</option>
                    <option value="AT">AT (AirtelTigo)</option>
                    <option value="GLO">GLO</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={localFilters.isActive}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, isActive: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.includeDeleted}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, includeDeleted: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include deleted</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFilterChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaBox className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pagination.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Packages</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaToggleOn className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {packages.filter(p => p.isActive && !p.isDeleted).length}
              </div>
              <div className="text-sm text-gray-600">Active Packages</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaToggleOff className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {packages.filter(p => !p.isActive || p.isDeleted).length}
              </div>
              <div className="text-sm text-gray-600">Inactive/Deleted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`loading-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : allPackageItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto bg-gray-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mb-6">
            <FaBox className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || Object.values(localFilters).some(v => v) 
              ? "No packages match your search criteria. Try adjusting your filters."
              : "Get started by creating your first data package to offer to customers."
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus size={16} />
              Create Your First Package
            </button>
            {(searchTerm || Object.values(localFilters).some(v => v)) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaTimes size={16} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {allPackageItems.map((item) => {
            const colors = getProviderColors(item.provider);
            return (
              <div
                key={item._id}
                className="rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: colors.background,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4" style={{ backgroundColor: colors.primary + '22' }}>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: colors.secondary }}>{item.name}</h3>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.groupName} ({item.provider})
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {/* Details */}
                <div className="p-4 space-y-2">
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="text-gray-900 font-medium ml-1">GHS {item.price.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Data:</span>
                      <span className="text-gray-900 font-medium ml-1">
                        {item.dataVolume < 1 
                          ? `${(item.dataVolume * 1000).toFixed(0)} MB` 
                          : `${item.dataVolume.toFixed(1)} GB`}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Validity:</span>
                      <span className="text-gray-900 font-medium ml-1">{item.validity === null ? 'Unlimited' : `${item.validity} ${item.validity === 1 ? 'day' : 'days'}`}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Inventory:</span>
                      <span className={`font-medium ml-1 ${
                        item.inventory <= item.lowStockThreshold 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {item.inventory}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Code: {item.code}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const group = packages.find(p => p._id === item.groupId);
                          if (group) {
                            setModalMode('edit');
                            setSelectedPackage(group);
                            const idx = group.packageItems.findIndex(i => i._id === item._id);
                            setSelectedPackageItem(item);
                            setEditItemIndex(idx);
                            setShowModal(true);
                          }
                        }}
                        className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
                        title="Edit Package"
                      >
                        <FaEdit size={14} />
                      </button>
                      {item.groupIsDeleted ? (
                        <button
                          onClick={() => handleRestore && handleRestore(item.groupId ?? '')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Restore Package"
                        >
                          <FaUndo size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete && handleDelete(item.groupId ?? '')}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Package"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className={`px-3 py-2 border rounded-lg transition-colors ${
              pagination.page === 1
                ? 'text-gray-400 cursor-not-allowed border-gray-200'
                : 'hover:bg-gray-50 border-gray-300'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg transition-colors ${
                  pagination.page === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-50 border-gray-300'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className={`px-3 py-2 border rounded-lg transition-colors ${
              pagination.page === pagination.pages
                ? 'text-gray-400 cursor-not-allowed border-gray-200'
                : 'hover:bg-gray-50 border-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Package Form Modal */}
      <PackageFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPackage(null);
          setSelectedPackageItem(null);
          setEditItemIndex(null);
        }}
        onSubmit={handleModalSubmit}
        package={selectedPackage}
        mode={modalMode}
        loading={loading}
        editItemIndex={editItemIndex}
        selectedPackageItem={selectedPackageItem}
      />
    </div>
  );
};
