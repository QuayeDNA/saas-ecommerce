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
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaChartBar,
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
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Pagination,
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  StatsGrid,
} from "../../design-system";
import type { StatCardProps } from "../../design-system/components/stats-card";
import { PackageFormModal } from "../../components/products/PackageFormModal";
import { getProviderColors } from "../../utils/provider-colors";
import { useToast } from "../../design-system/components/toast";
import { useProvider } from "../../hooks/use-provider";
import { ProviderFormModal } from "../../components/products/ProviderFormModal";
import type { Provider } from "../../types/package";
import type { ProviderFormData } from "../../components/products/ProviderFormModal";

const providerOptions = [
  { value: '', label: 'All Providers', icon: FaBuilding },
  { value: 'MTN', label: 'MTN', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'TELECEL', label: 'Telecel', color: 'text-blue-600 bg-blue-100' },
  { value: 'AT', label: 'AirtelTigo', color: 'text-red-600 bg-red-100' },
  { value: 'AFA', label: 'AFA', color: 'text-green-600 bg-green-100' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'custom', label: 'Custom' },
];

const PROVIDER_INITIALS: Record<string, string> = {
  MTN: 'M',
  TELECEL: 'T',
  AT: 'A',
  AFA: 'A',
};

const CATEGORY_BADGES: Record<string, { scheme: 'info' | 'warning' | 'success' | 'default' | 'gray'; label: string }> = {
  daily: { scheme: 'info', label: 'Daily' },
  weekly: { scheme: 'warning', label: 'Weekly' },
  monthly: { scheme: 'success', label: 'Monthly' },
  unlimited: { scheme: 'default', label: 'Unlimited' },
  custom: { scheme: 'gray', label: 'Custom' },
};

const PROVIDER_COLOR_SCHEMES: Record<string, 'warning' | 'error' | 'info' | 'gray'> = {
  MTN: 'warning',
  TELECEL: 'error',
  AT: 'info',
};

function ProvidersTab() {
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
    setFilters,
  } = useProvider();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const stats = {
    total: providers.length,
    active: providers.filter((p) => p.isActive && !p.isDeleted).length,
    inactive: providers.filter((p) => !p.isActive && !p.isDeleted).length,
    deleted: providers.filter((p) => p.isDeleted).length,
    mtn: providers.filter((p) => p.code === "MTN" && !p.isDeleted).length,
    telecel: providers.filter((p) => p.code === "TELECEL" && !p.isDeleted).length,
    at: providers.filter((p) => p.code === "AT" && !p.isDeleted).length,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      search: searchTerm,
      isActive: statusFilter === "" ? undefined : statusFilter === "active",
      includeDeleted: showDeleted,
    };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 300);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "status") {
      setStatusFilter(value);
    } else if (filterKey === "showDeleted") {
      setShowDeleted(value === "true");
    }
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 100);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setShowDeleted(false);
    setFilters({
      search: "",
      isActive: undefined,
      includeDeleted: false,
    });
    fetchProviders();
  };

  const handleModalSubmit = async (data: ProviderFormData) => {
    const providerData: Partial<Provider> = {
      ...data,
      code: data.code === "" ? undefined : data.code,
    };

    if (modalMode === "create") {
      await createProvider(providerData);
    } else if (selectedProvider?._id) {
      await updateProvider(selectedProvider._id, providerData);
    }
    setShowModal(false);
  };

  const handleCreateNew = () => {
    setModalMode("create");
    setSelectedProvider(null);
    setShowModal(true);
  };

  const handleEdit = (provider: Provider) => {
    setModalMode("edit");
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      await deleteProvider(id);
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Are you sure you want to restore this provider?")) {
      await restoreProvider(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateProvider(id, { isActive: !currentStatus });
  };

  const handleBulkAction = async (action: "delete" | "activate" | "deactivate") => {
    if (selectedProviders.length === 0) return;

    const confirmMessage = {
      delete: "Are you sure you want to delete the selected providers?",
      activate: "Are you sure you want to activate the selected providers?",
      deactivate: "Are you sure you want to deactivate the selected providers?",
    };

    if (window.confirm(confirmMessage[action])) {
      for (const id of selectedProviders) {
        try {
          if (action === "delete") {
            await deleteProvider(id);
          } else {
            await updateProvider(id, { isActive: action === "activate" });
          }
        } catch {
          // Failed to perform action on provider
        }
      }
      setSelectedProviders([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providers.map((p) => p._id));
    }
  };

  const handleSelectProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getStatusScheme = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "error" as const;
    return isActive ? "success" as const : "warning" as const;
  };

  const getStatusLabel = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "Deleted";
    return isActive ? "Active" : "Inactive";
  };

  const getProviderScheme = (code: string) => PROVIDER_COLOR_SCHEMES[code] || "gray" as const;

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
        <p className="text-sm font-medium text-[var(--error)]">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{ background: "var(--gradient-brand-dark)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)" }}
            >
              <FaChartBar className="text-lg" style={{ color: "var(--text-inverse)" }} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: "var(--text-inverse)" }}>
                Provider Management
              </h2>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-inverse)", opacity: 0.6 }}>
                Manage telecom service providers and configurations
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateNew}
            variant="secondary"
          >
            <FaPlus className="mr-2" />
            Add Provider
          </Button>
        </div>

        <div className="mt-5">
          <StatsGrid
            stats={[
              { title: "Total", value: stats.total, icon: <FaChartBar />, size: "sm" },
              { title: "Active", value: stats.active, icon: <FaToggleOn />, size: "sm" },
              { title: "Inactive", value: stats.inactive, icon: <FaToggleOff />, size: "sm" },
              { title: "Deleted", value: stats.deleted, icon: <FaTrash />, size: "sm" },
            ]}
            columns={4}
            gap="sm"
          />
        </div>
      </div>

      {/* Provider distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { code: 'MTN', count: stats.mtn, label: 'MTN', accent: 'text-[var(--warning)]' },
          { code: 'TELECEL', count: stats.telecel, label: 'Telecel', accent: 'text-[var(--error)]' },
          { code: 'AT', count: stats.at, label: 'AirtelTigo', accent: 'text-[var(--info)]' },
        ].map((p) => (
          <Card key={p.code}>
            <CardBody className="text-center">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">{p.label}</p>
              <p className={`text-lg font-bold ${p.accent}`}>{p.count}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by name, code, or description..."
            enableAutoSearch={true}
            debounceDelay={500}
            filters={{
              status: {
                value: statusFilter,
                options: [
                  { value: "", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
                label: "Status",
                placeholder: "All Status",
              },
              showDeleted: {
                value: showDeleted ? "true" : "false",
                options: [
                  { value: "false", label: "Hide Deleted" },
                  { value: "true", label: "Show Deleted" },
                ],
                label: "Deleted Providers",
                placeholder: "Hide Deleted",
              },
            }}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            showSearchButton={true}
            showClearButton={true}
            isLoading={loading}
          />
        </CardBody>
      </Card>

      {/* Bulk Actions */}
      {selectedProviders.length > 0 && (
        <Card variant="outlined">
          <CardBody className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-[var(--info)]">
              {selectedProviders.length} provider(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                <FaToggleOn className="mr-1.5" /> Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                <FaToggleOff className="mr-1.5" /> Deactivate
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction("delete")}>
                <FaTrash className="mr-1.5" /> Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Providers List */}
      <Card noPadding>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-[var(--border-color)] rounded-lg">
                  <Skeleton variant="circular" width={36} height={36} />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton height="0.875rem" width="40%" />
                    <Skeleton height="0.75rem" width="60%" />
                  </div>
                  <Skeleton height="1rem" width="60px" />
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="py-12 text-center">
              <FaBuilding className="mx-auto text-3xl text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No providers found.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[var(--border-color)]">
                {providers.map((provider) => (
                  <div key={provider._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {provider.logo?.url ? (
                          <img
                            src={provider.logo.url}
                            alt={provider.logo.alt || provider.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: getProviderColors(provider.code).primary }}
                          >
                            {PROVIDER_INITIALS[provider.code] || provider.name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {provider.name}
                          </div>
                          {provider.description && (
                            <div className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">
                              {provider.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider._id)}
                        onChange={() => handleSelectProvider(provider._id)}
                        className="mt-1 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge colorScheme={getProviderScheme(provider.code)} size="xs">
                        {provider.code}
                      </Badge>
                      <Badge
                        colorScheme={getStatusScheme(provider.isActive, provider.isDeleted)}
                        size="xs"
                      >
                        {getStatusLabel(provider.isActive, provider.isDeleted)}
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        Sales {provider.salesCount || 0}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="xs" variant="outline" onClick={() => handleEdit(provider)}>
                        <FaEdit />
                      </Button>
                      {!provider.isDeleted ? (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleToggleStatus(provider._id, provider.isActive)}
                          >
                            {provider.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </Button>
                          <Button size="xs" variant="danger" onClick={() => handleDelete(provider._id)}>
                            <FaTrash />
                          </Button>
                        </>
                      ) : (
                        <Button size="xs" variant="outline" onClick={() => handleRestore(provider._id)}>
                          <FaUndo />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>
                        <input
                          type="checkbox"
                          checked={selectedProviders.length === providers.length && providers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                      </TableHeaderCell>
                      <TableHeaderCell>Provider</TableHeaderCell>
                      <TableHeaderCell>Code</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Sales</TableHeaderCell>
                      <TableHeaderCell>Created</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider._id} className="hover:bg-[var(--bg-surface-alt)] transition-colors">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProviders.includes(provider._id)}
                            onChange={() => handleSelectProvider(provider._id)}
                            className="rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {provider.logo?.url ? (
                              <img
                                src={provider.logo.url}
                                alt={provider.logo.alt || provider.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: getProviderColors(provider.code).primary }}
                              >
                                {PROVIDER_INITIALS[provider.code] || provider.name[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {provider.name}
                              </div>
                              {provider.description && (
                                <div className="text-xs text-[var(--text-muted)] line-clamp-1">
                                  {provider.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge colorScheme={getProviderScheme(provider.code)} size="xs">
                            {provider.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            colorScheme={getStatusScheme(provider.isActive, provider.isDeleted)}
                            size="xs"
                          >
                            {getStatusLabel(provider.isActive, provider.isDeleted)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)]">
                          {provider.salesCount || 0}
                        </TableCell>
                        <TableCell className="text-xs text-[var(--text-muted)]">
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Button size="xs" variant="outline" onClick={() => handleEdit(provider)}>
                              <FaEdit />
                            </Button>
                            {!provider.isDeleted ? (
                              <>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleToggleStatus(provider._id, provider.isActive)}
                                >
                                  {provider.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                </Button>
                                <Button size="xs" variant="danger" onClick={() => handleDelete(provider._id)}>
                                  <FaTrash />
                                </Button>
                              </>
                            ) : (
                              <Button size="xs" variant="outline" onClick={() => handleRestore(provider._id)}>
                                <FaUndo />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center border-t border-[var(--border-color)] pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => fetchProviders(filters, { page })}
            onItemsPerPageChange={() => { }}
          />
        </div>
      )}

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

function PackagesTab() {
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

  const filterOptions = {
    provider: {
      value: provider,
      options: providerOptions,
      label: 'Provider',
      placeholder: 'All Providers',
    },
    status: {
      value: status,
      options: statusOptions,
      label: 'Status',
      placeholder: 'All Status',
    },
    category: {
      value: category,
      options: categoryOptions,
      label: 'Category',
      placeholder: 'All Categories',
    },
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
    if (filterKey === 'provider') setProvider(value);
    else if (filterKey === 'status') setStatus(value);
    else if (filterKey === 'category') setCategory(value);
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
        const updateData = {
          name: data.name,
          description: data.description,
          provider: data.provider,
          category: data.category as 'daily' | 'weekly' | 'monthly' | 'unlimited' | 'custom',
          isActive: data.isActive,
        };
        await packageService.updatePackage(editPackage._id, updateData);
      } else {
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

  const formatDate = (date: string | Date) =>
    new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));

  const stats = {
    total: packages.length,
    active: packages.filter((p) => p.isActive).length,
    inactive: packages.filter((p) => !p.isActive).length,
    mtn: packages.filter((p) => p.provider === 'MTN').length,
    telecel: packages.filter((p) => p.provider === 'TELECEL').length,
    at: packages.filter((p) => p.provider === 'AT').length,
  };

  const statCards: StatCardProps[] = [
    { title: 'Total Packages', value: stats.total, icon: <FaBox /> },
    { title: 'Active', value: stats.active, icon: <FaCheckCircle /> },
    { title: 'Inactive', value: stats.inactive, icon: <FaTimesCircle /> },
    { title: 'Providers', value: stats.mtn + stats.telecel + stats.at, icon: <FaBuilding /> },
  ];

  return (
    <div className="space-y-5">
      <StatsGrid stats={statCards} columns={4} gap="sm" />

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, description, or provider..."
        enableAutoSearch={true}
        debounceDelay={500}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        isLoading={loading}
      />

      {/* Error / Action Error */}
      {(error || actionError) && (
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-[var(--error)]">{error || actionError}</p>
          </CardBody>
        </Card>
      )}

      {/* Packages Grid */}
      <Card noPadding>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <Spinner size="lg" />
              <span className="ml-3 text-sm text-[var(--text-muted)]">Loading packages...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-8 sm:p-10 text-center">
              <FaBox className="mx-auto text-3xl sm:text-4xl text-[var(--text-muted)] mb-4" />
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {provider || status || category || search.trim()
                  ? 'No packages found matching your criteria.'
                  : 'No packages yet.'}
              </p>
              <Button onClick={handleCreate}>
                <FaPlus className="mr-2" />
                Create Your First Package
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 p-4 sm:p-5">
              {packages.map((pkg) => {
                const brand = getProviderColors(pkg.provider);
                const cat = CATEGORY_BADGES[pkg.category] || { scheme: 'gray' as const, label: pkg.category };

                return (
                  <div
                    key={pkg._id}
                    className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    {/* Brand color bar */}
                    <div
                      className="h-1.5 w-full shrink-0"
                      style={{ backgroundColor: brand.primary }}
                    />

                    <div className="p-4 sm:p-5 flex flex-col gap-3">
                      {/* Top row: provider avatar + name + status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                            style={{ backgroundColor: brand.primary }}
                          >
                            {PROVIDER_INITIALS[pkg.provider] || pkg.provider[0]}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate leading-snug">
                              {pkg.name}
                            </h3>
                            <span
                              className="text-xs font-medium"
                              style={{ color: brand.primary }}
                            >
                              {pkg.provider}
                            </span>
                          </div>
                        </div>
                        <Badge
                          colorScheme={pkg.isActive ? 'success' : 'error'}
                          size="sm"
                          rounded
                        >
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Description */}
                      {pkg.description && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {pkg.description}
                        </p>
                      )}

                      {/* Tags row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" size="xs" colorScheme={cat.scheme}>
                          {cat.label}
                        </Badge>
                        <Badge variant="subtle" size="xs" colorScheme="gray">
                          <FaCalendar className="mr-1 w-2.5 h-2.5" />
                          {formatDate(pkg.createdAt || '')}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border-color)]">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(pkg)}
                          disabled={actionLoading}
                          className="flex-1 min-w-0 text-xs"
                        >
                          <FaEdit className="mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/superadmin/packages/${pkg._id}/bundles`)}
                          className="flex-1 min-w-0 text-xs border-none text-white"
                          style={{ backgroundColor: brand.primary }}
                        >
                          <FaEye className="mr-1.5" />
                          Bundles
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(pkg)}
                          disabled={actionLoading}
                          className="flex-shrink-0 text-xs"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </div>
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
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Delete Package</h2>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-[var(--text-primary)]">{deletePackage?.name}</span>?
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

export default function SuperAdminPackagesPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Packages & Providers
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Manage data packages and telecom service providers
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">
            <FaBox className="mr-1.5" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="providers">
            <FaBuilding className="mr-1.5" />
            Providers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <PackagesTab />
        </TabsContent>

        <TabsContent value="providers">
          <ProvidersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
