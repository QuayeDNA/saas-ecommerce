import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaChartBar,
} from "react-icons/fa";
import { useProvider } from "../../hooks/use-provider";
import { ProviderFormModal } from "../../components/products/ProviderFormModal";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import type { Provider } from "../../types/package";
import type { ProviderFormData } from "../../components/products/ProviderFormModal";
import {
  Button,
  Badge,
  Card,
  CardBody,
  Pagination,
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "../../design-system";

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
    setFilters,
  } = useProvider();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Calculate statistics
  const stats = {
    total: providers.length,
    active: providers.filter((p) => p.isActive && !p.isDeleted).length,
    inactive: providers.filter((p) => !p.isActive && !p.isDeleted).length,
    deleted: providers.filter((p) => p.isDeleted).length,
    mtn: providers.filter((p) => p.code === "MTN" && !p.isDeleted).length,
    telecel: providers.filter((p) => p.code === "TELECEL" && !p.isDeleted)
      .length,
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
    // Auto-search when search term changes
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 300); // Debounce for better UX
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "status") {
      setStatusFilter(value);
    } else if (filterKey === "showDeleted") {
      setShowDeleted(value === "true");
    }
    // Auto-search when filters change
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

  const handleBulkAction = async (
    action: "delete" | "activate" | "deactivate"
  ) => {
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

  const getStatusColorScheme = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "error" as const;
    return isActive ? "success" as const : "warning" as const;
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "Deleted";
    return isActive ? "Active" : "Inactive";
  };

  const getProviderColorScheme = (code: string) => {
    switch (code) {
      case "MTN":
        return "warning" as const;
      case "TELECEL":
        return "error" as const;
      case "AT":
        return "info" as const;
      // case 'GLO': return 'text-green-600 bg-green-100'; // Removed GLO support
      default:
        return "gray" as const;
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
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div
        className="rounded-xl p-4 sm:p-6 text-white"
        style={{ background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FaChartBar className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Provider Management</h1>
              <p className="text-xs sm:text-sm text-white/70 mt-0.5">
                Manage telecom service providers and configurations
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateNew}
            leftIcon={<FaPlus />}
            className="self-start sm:self-auto"
            variant="secondary"
          >
            Add Provider
          </Button>
        </div>

        {/* Inline stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, icon: <FaChartBar /> },
            { label: "Active", value: stats.active, icon: <FaToggleOn /> },
            { label: "Inactive", value: stats.inactive, icon: <FaToggleOff /> },
            { label: "Deleted", value: stats.deleted, icon: <FaTrash /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg px-3 py-2.5 flex items-center gap-2 bg-white/15">
              <span className="text-white/70 text-sm flex-shrink-0">{stat.icon}</span>
              <div className="min-w-0">
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide truncate">{stat.label}</p>
                <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardBody className="text-center">
            <div className="text-xs text-gray-500">MTN</div>
            <div className="text-lg font-bold text-yellow-600">{stats.mtn}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-xs text-gray-500">TELECEL</div>
            <div className="text-lg font-bold text-red-600">{stats.telecel}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-xs text-gray-500">AT</div>
            <div className="text-lg font-bold text-blue-600">{stats.at}</div>
          </CardBody>
        </Card>
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
            <span className="text-sm text-blue-800">
              {selectedProviders.length} provider(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("activate")}>
                <FaToggleOn className="mr-1" /> Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                <FaToggleOff className="mr-1" /> Deactivate
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction("delete")}>
                <FaTrash className="mr-1" /> Delete
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
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
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
            <div className="py-10 text-center text-sm text-gray-500">
              No providers found.
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {providers.map((provider) => (
                  <div key={provider._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {provider.logo?.url ? (
                          <img
                            src={provider.logo.url}
                            alt={provider.logo.alt || provider.name}
                            className="h-9 w-9 rounded-full"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <FaChartBar />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{provider.name}</div>
                          {provider.description && (
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {provider.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider._id)}
                        onChange={() => handleSelectProvider(provider._id)}
                        className="rounded mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge colorScheme={getProviderColorScheme(provider.code)} size="xs">
                        {provider.code}
                      </Badge>
                      <Badge
                        colorScheme={getStatusColorScheme(provider.isActive, provider.isDeleted)}
                        size="xs"
                      >
                        {getStatusText(provider.isActive, provider.isDeleted)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Sales {provider.salesCount || 0}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="xs" variant="outline" onClick={() => handleEdit(provider)}>
                        <FaEdit className="w-3 h-3" />
                      </Button>
                      {!provider.isDeleted ? (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleToggleStatus(provider._id, provider.isActive)}
                          >
                            {provider.isActive ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
                          </Button>
                          <Button size="xs" variant="danger" onClick={() => handleDelete(provider._id)}>
                            <FaTrash className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button size="xs" variant="outline" onClick={() => handleRestore(provider._id)}>
                          <FaUndo className="w-3 h-3" />
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
                          className="rounded"
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
                      <TableRow key={provider._id} className="hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProviders.includes(provider._id)}
                            onChange={() => handleSelectProvider(provider._id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {provider.logo?.url ? (
                              <img
                                src={provider.logo.url}
                                alt={provider.logo.alt || provider.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <FaChartBar />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {provider.name}
                              </div>
                              {provider.description && (
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {provider.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge colorScheme={getProviderColorScheme(provider.code)} size="xs">
                            {provider.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            colorScheme={getStatusColorScheme(provider.isActive, provider.isDeleted)}
                            size="xs"
                          >
                            {getStatusText(provider.isActive, provider.isDeleted)}
                          </Badge>
                        </TableCell>
                        <TableCell>{provider.salesCount || 0}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(provider.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="xs" variant="outline" onClick={() => handleEdit(provider)}>
                              <FaEdit className="w-3 h-3" />
                            </Button>
                            {!provider.isDeleted ? (
                              <>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleToggleStatus(provider._id, provider.isActive)}
                                >
                                  {provider.isActive ? <FaToggleOff className="w-3 h-3" /> : <FaToggleOn className="w-3 h-3" />}
                                </Button>
                                <Button size="xs" variant="danger" onClick={() => handleDelete(provider._id)}>
                                  <FaTrash className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <Button size="xs" variant="outline" onClick={() => handleRestore(provider._id)}>
                                <FaUndo className="w-3 h-3" />
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
        <div className="border-t px-4 py-3">
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
