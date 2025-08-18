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
import { 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Badge, 
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from "../../design-system";
import { PackageFormModal } from "../../components/products/PackageFormModal";
import { getProviderColors } from "../../utils/provider-colors";
import { useToast } from "../../design-system/components/toast";

const providerOptions = [
  { value: '', label: 'All Providers', icon: FaBuilding },
  { value: 'MTN', label: 'MTN', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'TELECEL', label: 'Telecel', color: 'text-blue-600 bg-blue-100' },
  { value: 'AT', label: 'AirtelTigo', color: 'text-red-600 bg-red-100' },
  { value: 'AFA', label: 'AFA', color: 'text-green-600 bg-green-100' }
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
  const { addToast } = useToast();

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

      if (response.packages.length === 0 && (provider || status || category || search.trim())) {
        addToast('No packages found matching your criteria', 'info');
      }
    } catch {
      setError('Failed to fetch packages');
      addToast('Failed to fetch packages', 'error');
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
    if (search.trim()) {
      addToast(`Searching for packages matching "${search}"`, 'info');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setProvider('');
    setStatus('');
    setCategory('');
    fetchPackages();
    addToast('Filters cleared', 'info');
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
      addToast(`Package "${deletePackage.name}" deleted successfully`, 'success');
    } catch {
      setActionError('Failed to delete package');
      addToast('Failed to delete package', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: Package) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editPackage?._id) {
        // For updates, only send allowed fields
        const updateData: {
          name: string;
          description?: string;
          provider: string;
          category: 'daily' | 'weekly' | 'monthly' | 'unlimited' | 'custom';
          isActive: boolean;
        } = {
          name: data.name,
          description: data.description,
          provider: data.provider,
          category: data.category,
          isActive: data.isActive,
        };
        await packageService.updatePackage(editPackage._id, updateData);
      } else {
        // For creation, send the data as is
        await packageService.createPackage(data);
      }
      setShowFormModal(false);
      setEditPackage(null);
      await fetchPackages();
      addToast(`Package "${data.name}" saved successfully`, 'success');
    } catch {
      setActionError('Failed to save package');
      addToast('Failed to save package', 'error');
    } finally {
      setActionLoading(false);
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
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">
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
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <FaBox className="text-blue-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                <FaTimesCircle className="text-red-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Providers</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.mtn + stats.telecel + stats.at}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                <FaBuilding className="text-purple-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
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
        <Card>
          <CardBody>
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Action Error */}
      {actionError && (
        <Card>
          <CardBody>
            <p className="text-red-800 text-sm sm:text-base">{actionError}</p>
          </CardBody>
        </Card>
      )}

      {/* Packages Grid */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <Spinner size="lg" />
              <span className="ml-3 text-sm sm:text-base text-gray-600">Loading packages...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <FaBox className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No packages found matching your criteria.</p>
              <Button onClick={handleCreate} className="mt-4">
                <FaPlus className="mr-2" />
                Create Your First Package
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {packages.map(pkg => {
                const providerColors = getProviderColors(pkg.provider);
                return (
                  <Card 
                    key={pkg._id} 
                    className="hover:shadow-lg transition-all duration-200 group"
                    style={{
                      borderTop: `4px solid ${providerColors.primary}`,
                      backgroundColor: providerColors.background
                    }}
                  >
                    {/* Card Header with Provider Branding */}
                    <div 
                      className="pb-3"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: providerColors.primary }}
                          >
                            <FaBox className="text-white text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {pkg.name}
                            </h3>
                            <p 
                              className="text-xs font-medium mt-1"
                              style={{ color: providerColors.primary }}
                            >
                              {pkg.provider}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            colorScheme={pkg.isActive ? "success" : "error"}
                            size="sm"
                          >
                            {pkg.isActive ? <FaCheckCircle className="w-3 h-3 mr-1" /> : <FaTimesCircle className="w-3 h-3 mr-1" />}
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {pkg.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {pkg.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge variant="outline" size="sm" className={getCategoryColor(pkg.category)}>
                          {pkg.category}
                        </Badge>
                        <Badge variant="outline" size="sm" className="bg-gray-100 text-gray-700">
                          <FaCalendar className="w-3 h-3 mr-1" />
                          {formatDate(pkg.createdAt || '')}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-col gap-2">
                        {/* Primary Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                            disabled={actionLoading}
                            className="flex-1 text-xs"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/superadmin/packages/${pkg._id}/bundles`)}
                            className="flex-1 text-xs border-none"
                            style={{
                              backgroundColor: providerColors.primary,
                              color: providerColors.background
                            }}
                          >
                            <FaEye className="mr-1" />
                            Bundles
                          </Button>
                        </div>
                        
                        {/* Secondary Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(pkg)}
                            disabled={actionLoading}
                            className="flex-1 text-xs"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <PackageFormModal
        open={showFormModal}
        onClose={() => { setShowFormModal(false); setEditPackage(null); }}
        onSubmit={async (data) => { await handleFormSubmit(data as Package); }}
        initialData={editPackage as Partial<Package>}
      />

      {/* Delete Confirmation Modal */}
      <Dialog isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletePackage(null); }}>
        <DialogHeader>
          <h2 className="text-lg font-bold">Delete Package</h2>
        </DialogHeader>
        <DialogBody>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{deletePackage?.name}</span>?
            This action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
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
        </DialogFooter>
      </Dialog>
    </div>
  );
} 