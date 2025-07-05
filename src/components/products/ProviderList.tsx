// src/components/products/ProviderList.tsx
import React, { useEffect, useState } from 'react';
import { useProvider } from '../../hooks/use-provider';
import { useAuth } from '../../hooks/use-auth';
import { ProviderFormModal } from './ProviderFormModal';
import type { Provider } from '../../types/package';
import { FaPlus, FaEdit, FaTrash, FaUndo, FaEllipsisV, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export const ProviderList: React.FC = () => {
  const {
    providers,
    loading,
    error,
    pagination,
    filters,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    restoreProvider,
    setFilters
  } = useProvider();

  const { authState } = useAuth();
  const isSuperAdmin = authState.user?.userType === 'super_admin';

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const handleModalSubmit = async (data: Partial<Provider>) => {
    if (modalMode === 'create') {
      await createProvider(data);
    } else if (selectedProvider?._id) {
      await updateProvider(selectedProvider._id, data);
    }
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedProvider(null);
    setShowModal(true);
  };

  const handleEdit = (provider: Provider) => {
    setModalMode('edit');
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      await deleteProvider(id);
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm('Are you sure you want to restore this provider?')) {
      await restoreProvider(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateProvider(id, { isActive: !currentStatus });
  };

  const handlePageChange = (page: number) => {
    fetchProviders(filters, { page });
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
        <h1 className="text-2xl font-bold text-gray-900">Network Providers</h1>

        {isSuperAdmin && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus className="text-sm" />
            Add Provider
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search providers..."
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

      {/* Provider Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`loading-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : !providers || providers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No providers found</h3>
          <p className="text-gray-500 mb-6">
            {isSuperAdmin 
              ? "Get started by adding your first network provider" 
              : "No network providers are currently available"
            }
          </p>
          {isSuperAdmin && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="text-sm" />
              Add Provider
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                provider.isDeleted ? 'opacity-60' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {provider.logo ? (
                    <img
                      src={provider.logo.url}
                      alt={provider.logo.alt ?? provider.name}
                      className="w-16 h-16 object-contain rounded-full bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-2xl font-bold">
                      {provider.name.charAt(0)}
                    </div>
                  )}
                  
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

                <h3 className="text-lg font-medium text-gray-900 mb-1">{provider.name}</h3>
                {provider.description && (
                  <p className="text-gray-500 text-sm mb-3">{provider.description}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      provider.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <div className="flex gap-2">
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(provider._id ?? '', provider.isActive)}
                          className={`p-2 rounded ${
                            provider.isActive
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={provider.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {provider.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(provider)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        
                        {provider.isDeleted ? (
                          <button
                            onClick={() => handleRestore(provider._id ?? '')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Restore"
                          >
                            <FaUndo />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(provider._id ?? '')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                  </div>
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

      {/* Provider Modal */}
      <ProviderFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        provider={selectedProvider}
        mode={modalMode}
        loading={loading}
      />
    </div>
  );
};
