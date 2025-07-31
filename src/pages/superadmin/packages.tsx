import { useEffect, useState } from "react";
import { packageService } from "../../services/package.service";
import type { Package } from "../../types/package";
import { SearchAndFilter } from "../../components/common";
import { 
  FaBox, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlus,
  FaBuilding,
  FaDownload,
  FaRedo,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../../design-system/components/button";
import { colors } from "../../design-system/tokens";
import { PackageFormModal } from "../../components/products/PackageFormModal";
import { getProviderColors } from "../../utils/provider-colors";

const providerOptions = [
  { value: '', label: 'All Providers', icon: FaBuilding },
  { value: 'MTN', label: 'MTN', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'TELECEL', label: 'Telecel', color: 'text-blue-600 bg-blue-100' },
  { value: 'AT', label: 'AirtelTigo', color: 'text-red-600 bg-red-100' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active', color: 'text-green-600 bg-green-100' },
  { value: 'inactive', label: 'Inactive', color: 'text-red-600 bg-red-100' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'daily', label: 'Daily', color: 'text-blue-600 bg-blue-100' },
  { value: 'weekly', label: 'Weekly', color: 'text-purple-600 bg-purple-100' },
  { value: 'monthly', label: 'Monthly', color: 'text-green-600 bg-green-100' },
  { value: 'unlimited', label: 'Unlimited', color: 'text-orange-600 bg-orange-100' },
  { value: 'custom', label: 'Custom', color: 'text-gray-600 bg-gray-100' },
];

export default function SuperAdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePackage, setDeletePackage] = useState<Package | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter options for the reusable component
  const filterOptions = {
    provider: {
      value: provider,
      options: providerOptions,
      label: 'Provider',
      placeholder: 'All Providers'
    },
    status: {
      value: status,
      options: statusOptions,
      label: 'Status',
      placeholder: 'All Status'
    },
    category: {
      value: category,
      options: categoryOptions,
      label: 'Category',
      placeholder: 'All Categories'
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (provider) filters.provider = provider;
      if (status) filters.isActive = (status === 'active').toString();
      if (category) filters.category = category;
      if (search.trim()) filters.search = search.trim();

      const response = await packageService.getPackages(filters);
      setPackages(response.packages);

    } catch {
      setError('Failed to fetch packages');
      // Error fetching packages
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [provider, status, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  const handleClearFilters = () => {
    setSearch('');
    setProvider('');
    setStatus('');
    setCategory('');
    fetchPackages();
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'provider') {
      setProvider(value);
    } else if (filterKey === 'status') {
      setStatus(value);
    } else if (filterKey === 'category') {
      setCategory(value);
    }
  };

  const handleCreate = () => {
    setEditPackage(null);
    setShowFormModal(true);
  };

  const handleEdit = (pkg: Package) => {
    setEditPackage(pkg);
    setShowFormModal(true);
  };

  const handleDelete = (pkg: Package) => {
    setDeletePackage(pkg);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePackage?._id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await packageService.deletePackage(deletePackage._id);
      setShowDeleteModal(false);
      setDeletePackage(null);
      await fetchPackages();
    } catch {
      setActionError('Failed to delete package');
      // Error deleting package
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: Package) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editPackage?._id) {
        await packageService.updatePackage(editPackage._id, data);
      } else {
        await packageService.createPackage(data);
      }
      setShowFormModal(false);
      setEditPackage(null);
      await fetchPackages();
    } catch {
      setActionError('Failed to save package');
      // Error saving package
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getProviderColor = (providerCode: string) => {
    switch (providerCode) {
      case 'MTN': return 'text-yellow-600 bg-yellow-100';
      case 'TELECEL': return 'text-blue-600 bg-blue-100';
      case 'AT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'text-blue-600 bg-blue-100';
      case 'weekly': return 'text-purple-600 bg-purple-100';
      case 'monthly': return 'text-green-600 bg-green-100';
      case 'unlimited': return 'text-orange-600 bg-orange-100';
      case 'custom': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Calculate statistics
  const stats = {
    total: packages.length,
    active: packages.filter(p => p.isActive).length,
    inactive: packages.filter(p => !p.isActive).length,
    mtn: packages.filter(p => p.provider === 'MTN').length,
    telecel: packages.filter(p => p.provider === 'TELECEL').length,
    at: packages.filter(p => p.provider === 'AT').length,
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.brand.primary }}>
              Package Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Create and manage data packages</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={fetchPackages} disabled={loading} size="sm">
              <FaRedo className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FaDownload className="mr-2" />
              Export
            </Button>
            <Button onClick={handleCreate} size="sm">
              <FaPlus className="mr-2" />
              Create Package
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <FaBox className="text-blue-600 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-100 rounded-full">
              <FaTimesCircle className="text-red-600 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Providers</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.mtn + stats.telecel + stats.at}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <FaBuilding className="text-purple-600 text-lg sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, description, or provider..."
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        isLoading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Action Error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm sm:text-base">{actionError}</p>
        </div>
      )}

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">Loading packages...</span>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <FaBox className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No packages found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {packages.map(pkg => (
              <div key={pkg._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-4">
                  {/* Package Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FaBox className="text-blue-600 text-lg sm:text-xl mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getProviderColor(pkg.provider)}`}>
                        {pkg.provider}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getStatusColor(pkg.isActive)}`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getCategoryColor(pkg.category)}`}>
                        {pkg.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800">
                        <FaCalendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        {formatDate(pkg.createdAt || '')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(pkg)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto"
                      >
                        <FaEdit className="mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(pkg)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto"
                      >
                        <FaTrash className="mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/superadmin/packages/${pkg._id}/bundles`)}
                      className="w-full sm:w-auto"
                    >
                      <FaEye className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Bundles</span>
                      <span className="sm:hidden">Bundles</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <PackageFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditPackage(null); }}
        onSubmit={async (data) => { await handleFormSubmit(data as Package); }}
        initialData={editPackage as Partial<Package>}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative mx-4">
            <h2 className="text-lg font-bold mb-4">Delete Package</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deletePackage?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteModal(false); setDeletePackage(null); }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 