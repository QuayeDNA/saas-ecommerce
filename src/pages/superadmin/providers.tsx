import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUndo, FaToggleOn, FaToggleOff, FaSearch, FaChartBar } from "react-icons/fa";
import { useProvider } from "../../hooks/use-provider";
import { ProviderFormModal } from "../../components/products/ProviderFormModal";
import type { Provider } from "../../types/package";
import type { ProviderFormData } from "../../components/products/ProviderFormModal";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { colors } from "../../design-system/tokens";

export default function SuperAdminProvidersPage() {
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


  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Calculate statistics
  const stats = {
    total: providers.length,
    active: providers.filter(p => p.isActive && !p.isDeleted).length,
    inactive: providers.filter(p => !p.isActive && !p.isDeleted).length,
    deleted: providers.filter(p => p.isDeleted).length,
    mtn: providers.filter(p => p.code === 'MTN' && !p.isDeleted).length,
    telecel: providers.filter(p => p.code === 'TELECEL' && !p.isDeleted).length,
    at: providers.filter(p => p.code === 'AT' && !p.isDeleted).length,
    glo: providers.filter(p => p.code === 'GLO' && !p.isDeleted).length,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { 
      ...filters, 
      search: searchTerm,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      includeDeleted: showDeleted
    };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const handleModalSubmit = async (data: ProviderFormData) => {
    const providerData: Partial<Provider> = {
      ...data,
      code: data.code === '' ? undefined : data.code
    };
  
    if (modalMode === 'create') {
      await createProvider(providerData);
    } else if (selectedProvider?._id) {
      await updateProvider(selectedProvider._id, providerData);
    }
    setShowModal(false);
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

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedProviders.length === 0) return;

    const confirmMessage = {
      delete: 'Are you sure you want to delete the selected providers?',
      activate: 'Are you sure you want to activate the selected providers?',
      deactivate: 'Are you sure you want to deactivate the selected providers?'
    };

    if (window.confirm(confirmMessage[action])) {
      for (const id of selectedProviders) {
        try {
          if (action === 'delete') {
            await deleteProvider(id);
          } else {
            await updateProvider(id, { isActive: action === 'activate' });
          }
        } catch (error) {
          console.error(`Failed to ${action} provider ${id}:`, error);
        }
      }
      setSelectedProviders([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providers.map(p => p._id));
    }
  };

  const handleSelectProvider = (id: string) => {
    setSelectedProviders(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return 'text-red-600 bg-red-100';
    return isActive ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return 'Deleted';
    return isActive ? 'Active' : 'Inactive';
  };

  const getProviderColor = (code: string) => {
    switch (code) {
      case 'MTN': return 'text-yellow-600 bg-yellow-100';
      case 'TELECEL': return 'text-red-600 bg-red-100';
      case 'AT': return 'text-blue-600 bg-blue-100';
      case 'GLO': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.brand.primary }}>
              Provider Management
            </h1>
            <p className="text-gray-600">Manage telecom service providers and their configurations</p>
          </div>
          <Button onClick={handleCreateNew} leftIcon={<FaPlus />}>
            Add Provider
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartBar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Providers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaToggleOn className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Providers</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaToggleOff className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deleted Providers</p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaTrash className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Provider Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Provider Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.mtn}</div>
            <div className="text-sm text-gray-600">MTN</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.telecel}</div>
            <div className="text-sm text-gray-600">TELECEL</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.at}</div>
            <div className="text-sm text-gray-600">AT</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.glo}</div>
            <div className="text-sm text-gray-600">GLO</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Search providers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, code, or description..."
                leftIcon={<FaSearch className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                <FaSearch className="mr-2" />
                Search
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Show deleted providers</span>
            </label>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedProviders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProviders.length} provider(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('activate')}
              >
                <FaToggleOn className="mr-1" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
              >
                <FaToggleOff className="mr-1" />
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleBulkAction('delete')}
              >
                <FaTrash className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProviders.length === providers.length && providers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading providers...</span>
                    </div>
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No providers found.
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider._id)}
                        onChange={() => handleSelectProvider(provider._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {provider.logo?.url && (
                          <img
                            src={provider.logo.url}
                            alt={provider.logo.alt || provider.name}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {provider.name}
                          </div>
                          {provider.description && (
                            <div className="text-sm text-gray-500">
                              {provider.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderColor(provider.code)}`}>
                        {provider.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(provider.isActive, provider.isDeleted)}`}>
                        {getStatusText(provider.isActive, provider.isDeleted)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {provider.salesCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(provider.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleEdit(provider)}
                        >
                          <FaEdit className="w-3 h-3" />
                        </Button>
                        {!provider.isDeleted ? (
                          <>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleToggleStatus(provider._id, provider.isActive)}
                            >
                              {provider.isActive ? (
                                <FaToggleOff className="w-3 h-3" />
                              ) : (
                                <FaToggleOn className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleDelete(provider._id)}
                            >
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleRestore(provider._id)}
                          >
                            <FaUndo className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === pagination.page ? "primary" : "outline"}
                  onClick={() => fetchProviders(filters, { page })}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provider Form Modal */}
      {showModal && (
        <ProviderFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          provider={selectedProvider}
          mode={modalMode}
          loading={loading}
        />
      )}
    </div>
  );
} 