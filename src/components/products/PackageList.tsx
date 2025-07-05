// src/components/products/PackageList.tsx
import React, { useEffect, useState } from 'react';
import { usePackage } from '../../hooks/use-package';
import { PackageFormModal } from './PackageFormModal';
import type { PackageGroup } from '../../types/package';
import { FaPlus, FaEdit, FaTrash, FaUndo, FaEllipsisV } from 'react-icons/fa';

export const PackageList: React.FC = () => {
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

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    fetchPackages(newFilters);
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

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Packages</h1>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaPlus className="text-sm" />
          Add Package
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search packages..."
          className="flex-1 px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {/* Package Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`loading-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2 mb-2">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first data package</p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus className="text-sm" />
            Add Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                pkg.isDeleted ? 'opacity-60' : ''
              }`}
            >
              {pkg.banner ? (
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={pkg.banner.url}
                    alt={pkg.banner.alt ?? pkg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                  No banner image
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                  
                  <div className="relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      aria-label="More options"
                    >
                      <FaEllipsisV className="text-gray-500" />
                    </button>
                    {/* Dropdown menu can be added here */}
                  </div>
                </div>
                
                {pkg.description && (
                  <p className="text-gray-500 text-sm mb-3">{pkg.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {pkg.tags.map((tag) => (
                    <span
                      key={`${pkg._id}-tag-${tag}`}
                      className="bg-blue-50 text-blue-700 px-2 py-1 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="font-medium">Provider:</span>
                  <span className="ml-1">{pkg.provider}</span>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    
                    {pkg.isDeleted ? (
                      <button
                        onClick={() => handleRestore(pkg._id ?? '')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Restore"
                      >
                        <FaUndo />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(pkg._id ?? '')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-2">Package Items: {pkg.packageItems.length}</h4>
                  <ul className="text-sm text-gray-500">
                    {pkg.packageItems.slice(0, 3).map((item) => (
                      <li key={item._id} className="mb-1 flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </li>
                    ))}
                    {pkg.packageItems.length > 3 && (
                      <li className="text-blue-600 cursor-pointer">
                        + {pkg.packageItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className={`px-3 py-1 border rounded ${
              pagination.page === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.pages }, (_, index) => (
            <button
              key={`page-${index + 1}`}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded ${
                pagination.page === index + 1
                  ? 'bg-blue-100 text-blue-600 border-blue-300'
                  : 'hover:bg-gray-100'
              }`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className={`px-3 py-1 border rounded ${
              pagination.page === pagination.pages
                ? 'text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Package Form Modal */}
      <PackageFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        package={selectedPackage}
        mode={modalMode}
        loading={loading}
      />
    </div>
  );
};
