import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bundleService } from "../../services/bundle.service";
import { packageService } from "../../services/package.service";
import type { Bundle, Package } from "../../types/package";
import { SearchAndFilter } from "../../components/common";
import {
  FaCube,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBuilding,
  FaDownload,
  FaRedo,
  FaCalendar,
  FaCheckCircle,
  FaDatabase,
  FaArrowLeft,
  FaTimesCircle,
  FaDollarSign,
} from "react-icons/fa";
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
} from "../../design-system";
import { BundleCreationModal } from "../../components/products/BundleCreationModal";
import { PricingManagementModal } from "../../components/products/PricingManagementModal";
import { useToast } from "../../design-system/components/toast";
import { getProviderColors } from "../../utils/provider-colors";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active", color: "text-green-600 bg-green-100" },
  { value: "inactive", label: "Inactive", color: "text-red-600 bg-red-100" },
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "daily", label: "Daily", color: "text-blue-600 bg-blue-100" },
  { value: "weekly", label: "Weekly", color: "text-purple-600 bg-purple-100" },
  { value: "monthly", label: "Monthly", color: "text-green-600 bg-green-100" },
  {
    value: "unlimited",
    label: "Unlimited",
    color: "text-orange-600 bg-orange-100",
  },
  { value: "custom", label: "Custom", color: "text-gray-600 bg-gray-100" },
];

const dataUnitOptions = [
  { value: "", label: "All Units" },
  { value: "MB", label: "MB", color: "text-blue-600 bg-blue-100" },
  { value: "GB", label: "GB", color: "text-green-600 bg-green-100" },
  { value: "TB", label: "TB", color: "text-purple-600 bg-purple-100" },
];

export const BundleManagementPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBundle, setDeleteBundle] = useState<Bundle | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingBundle, setPricingBundle] = useState<Bundle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter states
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [dataUnit, setDataUnit] = useState("");
  const [search, setSearch] = useState("");

  // Filter options for the reusable component
  const filterOptions = {
    status: {
      value: status,
      options: statusOptions,
      label: "Status",
      placeholder: "All Status",
    },
    category: {
      value: category,
      options: categoryOptions,
      label: "Category",
      placeholder: "All Categories",
    },
    dataUnit: {
      value: dataUnit,
      options: dataUnitOptions,
      label: "Data Unit",
      placeholder: "All Units",
    },
  };

  const fetchBundles = async () => {
    if (!packageId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch all bundles for this package without filters
      const response = await bundleService.getBundlesByPackage(packageId, {
        page: 1,
        limit: 1000, // Get all bundles for this package
      });

      const fetchedBundles = response.bundles || [];
      setAllBundles(fetchedBundles); // Store all bundles for filtering

      // Apply current filters to the fetched bundles
      applyFiltersToBundles(fetchedBundles);
    } catch {
      setError("Failed to fetch bundles");
      addToast("Failed to fetch bundles", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToBundles = (bundlesToFilter: Bundle[]) => {
    let filteredBundles = bundlesToFilter;

    // Filter by status
    if (status) {
      filteredBundles = filteredBundles.filter((bundle) =>
        status === "active" ? bundle.isActive : !bundle.isActive
      );
    }

    // Filter by category
    if (category) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.category === category
      );
    }

    // Filter by data unit
    if (dataUnit) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.dataUnit === dataUnit
      );
    }

    // Filter by search term
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredBundles = filteredBundles.filter(
        (bundle) =>
          bundle.name.toLowerCase().includes(searchTerm) ||
          bundle.description?.toLowerCase().includes(searchTerm) ||
          bundle.dataVolume.toString().includes(searchTerm) ||
          bundle.dataUnit.toLowerCase().includes(searchTerm)
      );
    }

    setBundles(filteredBundles);

    if (
      filteredBundles.length === 0 &&
      (status || category || dataUnit || search.trim())
    ) {
      addToast("No bundles found matching your criteria", "info");
    }
  };

  const fetchPackage = async () => {
    if (!packageId) return;
    try {
      const packageData = await packageService.getPackage(packageId);
      setPkg(packageData);
    } catch {
      setError("Failed to fetch package details");
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  useEffect(() => {
    fetchBundles();
  }, [packageId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    if (search.trim()) {
      addToast(`Searching for bundles matching "${search}"`, "info");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setDataUnit("");
    applyFilters();
    addToast("Filters cleared", "info");
  };

  const applyFilters = () => {
    if (!allBundles) return;
    applyFiltersToBundles(allBundles);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "status") {
      setStatus(value);
    } else if (filterKey === "category") {
      setCategory(value);
    } else if (filterKey === "dataUnit") {
      setDataUnit(value);
    }
    // Apply filters immediately when filter changes
    setTimeout(() => applyFilters(), 0);
  };

  const handleCreate = () => {
    setEditBundle(null);
    setShowFormModal(true);
  };

  const handleEdit = (bundle: Bundle) => {
    setEditBundle(bundle);
    setShowFormModal(true);
  };

  const handleDelete = (bundle: Bundle) => {
    setDeleteBundle(bundle);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBundle?._id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await bundleService.deleteBundle(deleteBundle._id);
      setShowDeleteModal(false);
      setDeleteBundle(null);
      await fetchBundles();
      addToast("Bundle deleted successfully", "success");
    } catch {
      setActionError("Failed to delete bundle");
      addToast("Failed to delete bundle", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePricingManagement = (bundle: Bundle) => {
    setPricingBundle(bundle);
    setShowPricingModal(true);
  };

  const handlePricingUpdated = async () => {
    await fetchBundles();
    setShowPricingModal(false);
    setPricingBundle(null);
    addToast("Pricing updated successfully", "success");
  };

  const handleFormSubmit = async (data: Bundle) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editBundle?._id) {
        // For updates, handle providerId properly
        let providerIdValue: string | undefined = data.providerId;
        if (typeof data.providerId === "object" && data.providerId !== null) {
          const providerObj = data.providerId as { _id?: string; id?: string };
          providerIdValue = providerObj._id || providerObj.id;
        }

        const finalUpdateData: {
          name: string;
          description?: string;
          dataVolume: number;
          dataUnit: "MB" | "GB" | "TB";
          validity: number | "unlimited";
          validityUnit: "hours" | "days" | "weeks" | "months" | "unlimited";
          price: number;
          currency: string;
          features: string[];
          isActive: boolean;
          bundleCode?: string;
          category?: string;
          tags: string[];
          providerId?: string;
        } = {
          name: data.name,
          description: data.description,
          dataVolume: data.dataVolume,
          dataUnit: data.dataUnit,
          validity: data.validity,
          validityUnit: data.validityUnit,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
        };

        // Only add providerId if we have a valid value
        if (providerIdValue) {
          finalUpdateData.providerId = String(providerIdValue);
        }

        await bundleService.updateBundle(editBundle._id, finalUpdateData);
        addToast("Bundle updated successfully", "success");
      } else {
        // For creation, only send providerCode, not providerId
        if (!pkg?.provider) {
          throw new Error("Package provider information is missing");
        }

        await bundleService.createBundle({
          name: data.name,
          description: data.description,
          dataVolume: data.dataVolume,
          dataUnit: data.dataUnit,
          validity: data.validity,
          validityUnit: data.validityUnit,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
          packageId: packageId || "",
          providerCode: pkg.provider, // Only send providerCode for creation
        });
        addToast("Bundle created successfully", "success");
      }
      setShowFormModal(false);
      setEditBundle(null);
      await fetchBundles();
    } catch (error) {
      console.error("Bundle save error:", error);
      setActionError("Failed to save bundle");
      addToast("Failed to save bundle", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "daily":
        return "text-blue-600 bg-blue-100";
      case "weekly":
        return "text-purple-600 bg-purple-100";
      case "monthly":
        return "text-green-600 bg-green-100";
      case "unlimited":
        return "text-orange-600 bg-orange-100";
      case "custom":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Calculate statistics
  const stats = {
    total: bundles.length,
    active: bundles.filter((b) => b.isActive).length,
    inactive: bundles.filter((b) => !b.isActive).length,
    totalValue: bundles.reduce((sum, b) => sum + (b.price || 0), 0),
  };

  if (loading && !pkg) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading package details...</span>
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                Back
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Bundle Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Managing bundles for:{" "}
                  <span className="font-semibold">{pkg?.name}</span>
                </p>
                {pkg?.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={fetchBundles}
                disabled={loading}
                size="sm"
              >
                <FaRedo className="mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <FaDownload className="mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate} size="sm">
                <FaPlus className="mr-2" />
                Create Bundle
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Bundles
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <FaCube className="text-blue-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Active
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Inactive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {stats.inactive}
                </p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Value
                </p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                <FaDatabase className="text-purple-600 text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Provider
                </p>
                <p
                  className="text-lg sm:text-2xl font-bold"
                  style={{
                    color: getProviderColors(pkg?.provider)?.primary,
                  }}
                >
                  {pkg?.provider || "N/A"}
                </p>
              </div>
              <div
                className="p-2 sm:p-3 rounded-full"
                style={{
                  backgroundColor: getProviderColors(pkg?.provider)?.background,
                }}
              >
                <FaBuilding
                  className={`text-lg sm:text-xl ${
                    getProviderColors(pkg?.provider)?.primary
                  }`}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, description, or data volume..."
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

      {/* Bundles Grid */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <Spinner size="lg" />
              <span className="ml-3 text-sm sm:text-base text-gray-600">
                Loading bundles...
              </span>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <FaCube className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-4" />
              <p className="text-sm sm:text-base text-gray-500">
                No bundles found matching your criteria.
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <FaPlus className="mr-2" />
                Create Your First Bundle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {bundles.map((bundle) => {
                const providerColors = getProviderColors(pkg?.provider);
                return (
                  <Card
                    key={bundle._id}
                    className="hover:shadow-lg transition-all duration-200 group"
                    style={{
                      borderTop: `4px solid ${providerColors.primary}`,
                      backgroundColor: providerColors.background,
                    }}
                  >
                    {/* Card Header with Provider Branding */}
                    <div className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-2 rounded-full"
                            style={{ backgroundColor: providerColors.primary }}
                          >
                            <FaCube className="text-white text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {bundle.name}
                            </h3>
                            <p
                              className="text-xs font-medium mt-1"
                              style={{ color: providerColors.primary }}
                            >
                              {pkg?.provider || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            colorScheme={bundle.isActive ? "success" : "error"}
                            size="sm"
                          >
                            {bundle.isActive ? (
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <FaTimesCircle className="w-3 h-3 mr-1" />
                            )}
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      {bundle.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {bundle.description}
                        </p>
                      )}

                      {/* Bundle Details */}
                      <div className="space-y-2 mb-3">
                        {/* Data Volume */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Data:</span>
                          <span className="text-xs font-medium text-gray-900">
                            {bundle.dataVolume} {bundle.dataUnit}
                          </span>
                        </div>

                        {/* Validity */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Validity:
                          </span>
                          <span className="text-xs font-medium text-gray-900">
                            {bundle.validity === "unlimited" ||
                            bundle.validityUnit === "unlimited"
                              ? "Unlimited"
                              : `${bundle.validity} ${bundle.validityUnit}`}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Price:</span>
                          <span className="text-xs font-medium text-gray-900">
                            {formatCurrency(bundle.price, bundle.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1">
                        {bundle.category && (
                          <Badge
                            variant="outline"
                            size="sm"
                            className={getCategoryColor(bundle.category)}
                          >
                            {bundle.category}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          size="sm"
                          className="bg-gray-100 text-gray-700"
                        >
                          <FaCalendar className="w-3 h-3 mr-1" />
                          {formatDate(bundle.createdAt || "")}
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
                            onClick={() => handleEdit(bundle)}
                            disabled={actionLoading}
                            className="flex-1 text-xs"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePricingManagement(bundle)}
                            disabled={actionLoading}
                            className="flex-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <FaDollarSign className="mr-1" />
                            Pricing
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(bundle)}
                            disabled={actionLoading}
                            className="flex-1 text-xs border-none"
                            style={{
                              backgroundColor: providerColors.primary,
                              color: providerColors.background,
                            }}
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
      <BundleCreationModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditBundle(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editBundle}
        packageId={packageId}
        providerId={pkg?.provider}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteBundle(null);
        }}
      >
        <DialogHeader>
          <h2 className="text-lg font-bold">Delete Bundle</h2>
        </DialogHeader>
        <DialogBody>
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteBundle?.name}</span>? This
            action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteBundle(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Pricing Management Modal */}
      {showPricingModal && pricingBundle && (
        <PricingManagementModal
          bundleId={pricingBundle._id!}
          bundleName={pricingBundle.name}
          isOpen={showPricingModal}
          onClose={() => {
            setShowPricingModal(false);
            setPricingBundle(null);
          }}
          onPricingUpdated={handlePricingUpdated}
        />
      )}
    </div>
  );
};

export default BundleManagementPage;
