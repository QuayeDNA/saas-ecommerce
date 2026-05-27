import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bundleService } from "../../services/bundle.service";
import { packageService } from "../../services/package.service";
import type { Bundle, Package, CreateBundleData } from "../../types/package";
import { SearchAndFilter } from "../../components/common";
import {
  FaCube,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBuilding,
  FaArrowLeft,
  FaCheckCircle,
  FaDatabase,
  FaDollarSign,
} from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../../design-system";
import { BundleCreationModal } from "../../components/products/BundleCreationModal";
import { PricingManagementModal } from "../../components/products/PricingManagementModal";
import { BulkPricingManagementModal } from "../../components/products/BulkPricingManagementModal";
import { useToast } from "../../design-system/components/toast";
import { getProviderColors } from "../../utils/provider-colors";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "unlimited", label: "Unlimited" },
  { value: "custom", label: "Custom" },
];

const dataUnitOptions = [
  { value: "", label: "All Units" },
  { value: "MB", label: "MB" },
  { value: "GB", label: "GB" },
  { value: "TB", label: "TB" },
];

const PROVIDER_INITIALS: Record<string, string> = {
  MTN: "M",
  TELECEL: "T",
  AT: "A",
  AFA: "A",
};

const STAT_BG: Record<string, string> = {
  total: "bg-[var(--info)]/10 text-[var(--info)]",
  active: "bg-[var(--success)]/10 text-[var(--success)]",
  inactive: "bg-[var(--error)]/10 text-[var(--error)]",
  value: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  provider: "bg-[var(--warning)]/10 text-[var(--warning)]",
};

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
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchGen = useRef(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Helper to get provider logo URL from bundle's populated providerId
  const getProviderLogo = (bundle: Bundle): string | null => {
    const pid = bundle.providerId;
    if (typeof pid === "object" && pid !== null) {
      const p = pid as { logo?: { url?: string } };
      return p.logo?.url || null;
    }
    return null;
  };

  const handleImageError = (bundleId: string) => {
    setImageErrors((prev) => ({ ...prev, [bundleId]: true }));
  };

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [dataUnit, setDataUnit] = useState("");
  const [search, setSearch] = useState("");

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
    const gen = ++fetchGen.current;
    setLoading(true);
    setError(null);
    try {
      const response = await bundleService.getBundlesByPackage(packageId, {
        page: 1,
        limit: 1000,
      });
      if (gen !== fetchGen.current) return;

      const fetchedBundles = response.bundles || [];
      setAllBundles(fetchedBundles);
      applyFiltersToBundles(fetchedBundles);
    } catch {
      if (gen !== fetchGen.current) return;
      setError("Failed to fetch bundles");
      addToast("Failed to fetch bundles", "error");
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  };

  const applyFiltersToBundles = (bundlesToFilter: Bundle[]) => {
    let filteredBundles = bundlesToFilter;

    if (status) {
      filteredBundles = filteredBundles.filter((bundle) =>
        status === "active" ? bundle.isActive : !bundle.isActive
      );
    }

    if (category) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.category === category
      );
    }

    if (dataUnit) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.dataUnit === dataUnit
      );
    }

    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredBundles = filteredBundles.filter(
        (bundle) =>
          bundle.name.toLowerCase().includes(searchTerm) ||
          bundle.description?.toLowerCase().includes(searchTerm) ||
          (bundle.dataVolume &&
            bundle.dataVolume.toString().includes(searchTerm)) ||
          (bundle.dataUnit &&
            bundle.dataUnit.toLowerCase().includes(searchTerm))
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
    const gen = ++fetchGen.current;
    try {
      const packageData = await packageService.getPackage(packageId);
      if (gen === fetchGen.current) setPkg(packageData);
    } catch {
      if (gen === fetchGen.current) setError("Failed to fetch package details");
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
    if (filterKey === "status") setStatus(value);
    else if (filterKey === "category") setCategory(value);
    else if (filterKey === "dataUnit") setDataUnit(value);
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

  const handleBulkPricing = () => {
    if (bundles.length === 0) {
      addToast("No bundles available for pricing management", "warning");
      return;
    }
    setShowBulkPricingModal(true);
  };

  const handleBulkPricingUpdated = async () => {
    await fetchBundles();
    setShowBulkPricingModal(false);
    addToast("Bulk pricing updated successfully", "success");
  };

  const handleFormSubmit = async (data: Bundle) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editBundle?._id) {
        let providerIdValue: string | undefined = data.providerId;
        if (typeof data.providerId === "object" && data.providerId !== null) {
          const providerObj = data.providerId as { _id?: string; id?: string };
          providerIdValue = providerObj._id || providerObj.id;
        }

        const finalUpdateData: Partial<Bundle> = {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
        };

        const isAfaBundle = pkg?.provider === "AFA";
        if (!isAfaBundle) {
          finalUpdateData.dataVolume = data.dataVolume;
          finalUpdateData.dataUnit = data.dataUnit;
          finalUpdateData.validity = data.validity;
          finalUpdateData.validityUnit = data.validityUnit;
        }

        if (isAfaBundle) {
          finalUpdateData.requiresGhanaCard = data.requiresGhanaCard;
          finalUpdateData.afaRequirements = data.afaRequirements;
        }

        if (providerIdValue) {
          finalUpdateData.providerId = String(providerIdValue);
        }

        await bundleService.updateBundle(editBundle._id, finalUpdateData);
        addToast("Bundle updated successfully", "success");
      } else {
        if (!pkg?.provider) {
          throw new Error("Package provider information is missing");
        }

        const createData: CreateBundleData = {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
          packageId: packageId || "",
          providerCode: pkg.provider,
        };

        const isAfaBundle = pkg?.provider === "AFA";
        if (!isAfaBundle) {
          createData.dataVolume = data.dataVolume;
          createData.dataUnit = data.dataUnit;
          createData.validity = data.validity;
          createData.validityUnit = data.validityUnit;
        }

        if (isAfaBundle) {
          createData.requiresGhanaCard = data.requiresGhanaCard;
          createData.afaRequirements = data.afaRequirements;
        }

        await bundleService.createBundle(createData);
        addToast("Bundle created successfully", "success");
      }
      setShowFormModal(false);
      setEditBundle(null);
      await fetchBundles();
    } catch {
      setActionError("Failed to save bundle");
      addToast("Failed to save bundle", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatValidity = (bundle: Bundle) => {
    if (bundle.validity === "unlimited" || bundle.validityUnit === "unlimited") {
      return "Unlimited";
    }
    return `${bundle.validity} ${bundle.validityUnit}`;
  };

  const stats = {
    total: bundles.length,
    active: bundles.filter((b) => b.isActive).length,
    inactive: bundles.filter((b) => !b.isActive).length,
    totalValue: bundles.reduce((sum, b) => sum + (b.price || 0), 0),
  };

  const statCards = [
    { key: "total", label: "Total Bundles", value: stats.total, icon: FaCube },
    { key: "active", label: "Active", value: stats.active, icon: FaCheckCircle },
    { key: "inactive", label: "Inactive", value: stats.inactive, icon: FaTrash },
    { key: "value", label: "Total Value", value: formatCurrency(stats.totalValue), icon: FaDatabase },
    { key: "provider", label: "Provider", value: pkg?.provider || "N/A", icon: FaBuilding },
  ];

  const brand = getProviderColors(pkg?.provider);

  // Get brand colors from the bundle's populated providerId (fallback to package provider)
  const getBundleBrand = (bundle: Bundle) => {
    const pid = bundle.providerId;
    if (typeof pid === "object" && pid !== null) {
      const p = pid as { code?: string };
      if (p.code) return getProviderColors(p.code);
    }
    return brand;
  };

  if (loading && !pkg) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <Spinner size="lg" />
          <span className="text-sm text-[var(--text-muted)]">Loading package details...</span>
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-4">
          <p className="text-sm font-medium text-[var(--error)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="mr-1.5" />
                Back
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Bundle Management
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Managing bundles for:{" "}
                  <span className="font-semibold text-[var(--text-primary)]">{pkg?.name}</span>
                </p>
                {pkg?.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {pkg.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleBulkPricing}
                disabled={loading || bundles.length === 0}
                size="sm"
              >
                <FaDollarSign className="mr-1.5" />
                Bulk Pricing
              </Button>
              <Button onClick={handleCreate} size="sm">
                <FaPlus className="mr-1.5" />
                Create Bundle
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <Card key={s.key}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">
                    {s.label}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] mt-0.5 truncate">
                    {s.value}
                  </p>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-full shrink-0 ${STAT_BG[s.key]}`}>
                  <s.icon className="text-lg sm:text-xl" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Bulk Pricing Info Banner */}
      {bundles.length > 0 && (
        <Card className="border-[var(--color-primary)]/20">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                <FaDollarSign className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Bulk Pricing Management Available
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Manage pricing for all {bundles.length} bundles across
                  multiple user types (Customer, Agent, Super Agent, Dealer,
                  Super Dealer) in one place.
                </p>
                <Button
                  size="sm"
                  onClick={handleBulkPricing}
                >
                  <FaDollarSign className="mr-1.5" />
                  Open Bulk Pricing Manager
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, description, or data volume..."
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

      {/* Bundles Grid */}
      <Card noPadding>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <Spinner size="lg" />
              <span className="ml-3 text-sm text-[var(--text-muted)]">Loading bundles...</span>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-8 sm:p-10 text-center">
              <FaCube className="mx-auto text-3xl sm:text-4xl text-[var(--text-muted)] mb-4" />
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {status || category || dataUnit || search.trim()
                  ? "No bundles found matching your criteria."
                  : "No bundles yet."}
              </p>
              <Button onClick={handleCreate}>
                <FaPlus className="mr-2" />
                Create Your First Bundle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 sm:p-5">
              {bundles.map((bundle) => (
                <div
                  key={bundle._id}
                  className={`relative overflow-hidden rounded-xl flex flex-col gap-3 transition-all duration-200 ${
                    !bundle.isActive ? "opacity-55" : ""
                  }`}
                  style={{
                    backgroundColor: getBundleBrand(bundle).primary,
                    color: getBundleBrand(bundle).text,
                  }}
                >
                  {/* Top row: provider avatar + data/validity pills */}
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                      {(() => {
                        const logoUrl = getProviderLogo(bundle);
                        if (logoUrl && !imageErrors[bundle._id!]) {
                          return (
                            <img
                              src={logoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(bundle._id!)}
                            />
                          );
                        }
                        return (
                          <span className="text-sm font-bold text-white">
                            {PROVIDER_INITIALS[pkg?.provider || ""] || "?"}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white">
                        {bundle.dataVolume}{bundle.dataUnit}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white">
                        {formatValidity(bundle)}
                      </span>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="px-4 flex-1 flex flex-col gap-2">
                    <span className="font-bold text-base leading-snug">
                      {bundle.name}
                    </span>

                    {!bundle.isActive && (
                      <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                        Inactive
                      </span>
                    )}

                    {/* Category & Pricing info */}
                    <div className="flex items-center gap-2 mt-1">
                      {bundle.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white">
                          {bundle.category}
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(bundle.price, bundle.currency)}
                    </div>

                    {bundle.description && (
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {bundle.description}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(bundle)}
                      disabled={actionLoading}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition
                        bg-white/10 border border-white/20 text-white
                        hover:bg-white/20 active:bg-white/25
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button
                      onClick={() => handlePricingManagement(bundle)}
                      disabled={actionLoading}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition
                        bg-white/10 border border-white/20 text-white
                        hover:bg-white/20 active:bg-white/25
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <FaDollarSign />
                      Pricing
                    </button>
                    <button
                      onClick={() => handleDelete(bundle)}
                      disabled={actionLoading}
                      className="flex-shrink-0 py-2 px-3 rounded-lg text-xs font-semibold transition
                        bg-[var(--error)]/20 border border-[var(--error)]/30 text-white
                        hover:bg-[var(--error)]/40 active:bg-[var(--error)]/50
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
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
        providerCode={pkg?.provider}
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
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Delete Bundle</h2>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--text-primary)]">{deleteBundle?.name}</span>?
            This action cannot be undone.
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

      {/* Bulk Pricing Management Modal */}
      {showBulkPricingModal && (
        <BulkPricingManagementModal
          packageId={packageId!}
          packageName={pkg?.name || "Package"}
          bundles={bundles}
          isOpen={showBulkPricingModal}
          onClose={() => setShowBulkPricingModal(false)}
          onPricingUpdated={handleBulkPricingUpdated}
        />
      )}
    </div>
  );
};

export default BundleManagementPage;
