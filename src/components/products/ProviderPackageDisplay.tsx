import React, { useEffect, useState, useMemo, useRef } from "react";
import { packageService } from "../../services/package.service";
import { bundleService } from "../../services/bundle.service";
import { getProviderColors } from "../../utils/provider-colors";
import { SingleOrderModal } from "../orders/SingleOrderModal";
import { BulkOrderModal } from "../orders/BulkOrderModal";
import { SearchAndFilter } from "../common/SearchAndFilter";
import { useAuth } from "../../hooks/use-auth";
import {
  getPriceForUserType,
  formatCurrency,
  calculateDiscountPercentage,
} from "../../utils/pricingHelpers";
import { FaBox, FaBuilding } from "react-icons/fa";
import {
  Card,
  CardBody,
  Button,
  Alert,
  Skeleton,
  Container,
  Section,
} from "../../design-system";
import type { Package, Bundle, Provider } from "../../types/package";

export interface ProviderPackageDisplayProps {
  provider?: string; // provider code (e.g., 'MTN') — optional when packageId is provided
  category?: string; // optional category/tag
  packageSlug?: string; // optional stable package slug for route-specific pages
  packageId?: string; // optional specific package id
  filters?: Record<string, unknown>; // additional filters for packages
}

export const ProviderPackageDisplay: React.FC<ProviderPackageDisplayProps> = ({
  provider,
  category,
  packageSlug,
  packageId,
  filters = {},
}) => {
  // Authentication
  const { authState } = useAuth();
  const userType = authState.user?.userType;

  // State
  const [packages, setPackages] = useState<Package[]>([]);
  const [bundles, setBundles] = useState<Record<string, Bundle[]>>({}); // key: packageId
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [providerLogoFailed, setProviderLogoFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || "all",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [selectedBulkPackage, setSelectedBulkPackage] =
    useState<Package | null>(null);

  // Tracks fetch generation to discard stale results (handles StrictMode double-mount)
  const fetchGen = useRef(0);

  useEffect(() => {
    const gen = ++fetchGen.current;
    setLoading(true);
    setError(null);

    const fetch = async () => {
      try {
        let pkgList: Package[] = [];
        const bundleMap: Record<string, Bundle[]> = {};
        let derivedProvider: Provider | null = null;

        if (packageId) {
          const [pkg, bundleResp] = await Promise.all([
            packageService.getPackage(packageId),
            bundleService.getBundlesByPackage(packageId, { limit: 1000 }),
          ]);
          if (gen !== fetchGen.current) return;
          if (pkg) pkgList = [pkg];
          bundleMap[packageId] = bundleResp.bundles || [];

          const pid = bundleResp.bundles[0]?.providerId;
          if (typeof pid === "object" && pid !== null && "code" in pid) {
            derivedProvider = pid as unknown as Provider;
          }
        } else if (packageSlug) {
          const pkg = await packageService.getPackageBySlug(packageSlug);
          if (gen !== fetchGen.current) return;
          if (pkg) {
            pkgList = [pkg];
            if (pkg._id) {
              const bundleResp = await bundleService.getBundlesByPackage(
                pkg._id,
                { limit: 1000 },
              );
              if (gen !== fetchGen.current) return;
              bundleMap[pkg._id] = bundleResp.bundles || [];

              const pid = bundleResp.bundles[0]?.providerId;
              if (typeof pid === "object" && pid !== null && "code" in pid) {
                derivedProvider = pid as unknown as Provider;
              }
            }
          }
        } else {
          const pkgFilters: Record<string, unknown> = {
            provider,
            isActive: true,
            ...filters,
          };
          if (category) pkgFilters.category = category;
          const resp = await packageService.getPackages(pkgFilters);
          if (gen !== fetchGen.current) return;
          pkgList = resp.packages || [];

          const bundlePromises = pkgList
            .filter((p) => p._id)
            .map(async (pkg) => {
              const br = await bundleService.getBundlesByPackage(pkg._id!, {
                limit: 1000,
              });
              return { id: pkg._id!, bundles: br.bundles || [] };
            });
          const results = await Promise.all(bundlePromises);
          if (gen !== fetchGen.current) return;
          for (const r of results) {
            bundleMap[r.id] = r.bundles;
          }

          const allBundles = Object.values(bundleMap).flat();
          const pid = allBundles[0]?.providerId;
          if (typeof pid === "object" && pid !== null && "code" in pid) {
            derivedProvider = pid as unknown as Provider;
          }
        }

        if (gen !== fetchGen.current) return;
        setPackages(pkgList);
        setBundles(bundleMap);
        if (derivedProvider) setProviderData(derivedProvider);
      } catch (e: unknown) {
        if (gen !== fetchGen.current) return;
        setError(
          e instanceof Error
            ? e.message
            : "Failed to fetch packages or bundles",
        );
      } finally {
        if (gen === fetchGen.current) setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, category, packageId, packageSlug, JSON.stringify(filters)]);

  // Filtered packages by category (if using dropdown)
  const filteredPackages = useMemo(() => {
    if (category) return packages;
    if (selectedCategory === "all") return packages;
    return packages.filter((pkg) => pkg.category === selectedCategory);
  }, [packages, category, selectedCategory]);

  // Get unique categories from packages (for dropdown)
  const categories = useMemo(() => {
    if (category) return [];
    const cats = Array.from(new Set(packages.map((p) => p.category)));
    return ["all", ...cats];
  }, [packages, category]);

  // Provider display (for color, etc.) — prefer providerData derived from bundles, fallback to prop
  const effectiveProvider = providerData?.code || provider || "";
  const providerColors = getProviderColors(effectiveProvider);

  // Search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search bundles...",
    enableAutoSearch: true,
    debounceDelay: 500,
    filters: {
      ...(!category && !packageId && categories.length > 1
        ? {
            category: {
              label: "Category",
              value: selectedCategory,
              options: categories.map((cat) => ({
                value: cat ?? "",
                label:
                  cat === "all"
                    ? "All Categories"
                    : typeof cat === "string"
                      ? cat.charAt(0).toUpperCase() + cat.slice(1)
                      : "",
              })),
            },
          }
        : {}),
      status: {
        label: "Status",
        value: selectedStatus,
        options: [
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    } as Record<
      string,
      {
        value: string;
        options: { value: string; label: string }[];
        label: string;
        placeholder?: string;
      }
    >,
    onFilterChange: (filterKey: string, value: string) => {
      if (filterKey === "category") {
        setSelectedCategory(value);
      } else if (filterKey === "status") {
        setSelectedStatus(value);
      }
    },
    onSearch: () => {},
    onClearFilters: () => {
      setSearchTerm("");
      setSelectedCategory(category || "all");
      setSelectedStatus("all");
    },
    isLoading: loading,
  };

  if (loading) {
    return (
      <Container padding="none">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" width="3rem" height="3rem" />
            <div className="space-y-2">
              <Skeleton variant="text" height="1.75rem" width="220px" />
              <Skeleton variant="text" height="0.875rem" width="160px" />
            </div>
          </div>

          {/* Search / filter bar skeleton */}
          <div className="flex gap-3">
            <Skeleton variant="rectangular" height="2.5rem" width="100%" />
            <Skeleton variant="rectangular" height="2.5rem" width="120px" />
            <Skeleton variant="rectangular" height="2.5rem" width="120px" />
          </div>

          {/* Package cards skeleton */}
          {[...Array(2)].map((_, pi) => (
            <Card key={pi} className="overflow-hidden">
              <CardBody>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="space-y-2 flex-1">
                    <Skeleton variant="text" height="1.25rem" width="180px" />
                    <Skeleton variant="text" height="0.875rem" width="260px" />
                  </div>
                  <Skeleton
                    variant="rectangular"
                    height="2rem"
                    width="100px"
                    className="rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, bi) => (
                    <div
                      key={bi}
                      className="rounded-xl p-4 bg-[var(--bg-surface-alt)] flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <Skeleton
                          variant="circular"
                          width="2.5rem"
                          height="2.5rem"
                        />
                        <div className="flex gap-1.5">
                          <Skeleton
                            variant="rectangular"
                            height="1.25rem"
                            width="45px"
                            className="rounded-full"
                          />
                          <Skeleton
                            variant="rectangular"
                            height="1.25rem"
                            width="35px"
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <Skeleton variant="text" height="1rem" width="70%" />
                      <Skeleton variant="text" height="1.75rem" width="100px" />
                      <Skeleton
                        variant="rectangular"
                        height="2.5rem"
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert status="error" title="Error Loading Packages">
          {error}
        </Alert>
      </Container>
    );
  }

  // No packages found
  if (!filteredPackages.length) {
    return (
      <Container>
        <Card>
          <CardBody>
            <div className="text-center">
              <FaBox className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
              <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                No packages found
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                No data packages available for this provider.
              </p>
            </div>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container padding="none">
      <div className="space-y-6">
        {/* Header */}
        <Section padding="none" background="none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 shadow-sm overflow-hidden"
                style={{
                  backgroundColor: providerColors.primary,
                  color: providerColors.text,
                  borderColor: providerColors.secondary,
                }}
              >
                {providerData?.logo?.url && !providerLogoFailed ? (
                  <img
                    src={providerData.logo.url}
                    alt={providerData.logo.alt || `${effectiveProvider} Logo`}
                    className="w-full h-full object-cover"
                    onError={() => setProviderLogoFailed(true)}
                  />
                ) : (
                  <FaBuilding className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {providerData?.name || effectiveProvider} Data Packages
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Browse and order data bundles
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Search and Filters */}
        <SearchAndFilter {...searchAndFilterConfig} />

        {/* Package and Bundle Cards */}
        <div className="space-y-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg._id} className="overflow-hidden">
              <CardBody>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setSelectedBulkPackage(pkg);
                      setShowBulkOrderModal(true);
                    }}
                  >
                    Bulk Order
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(bundles[pkg._id!] || [])
                    .filter((bundle) => {
                      const matchesSearch =
                        searchTerm === "" ||
                        bundle.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        (bundle.description?.toLowerCase() ?? "").includes(
                          searchTerm.toLowerCase(),
                        );

                      const matchesStatus =
                        selectedStatus === "all" ||
                        (selectedStatus === "active" && bundle.isActive) ||
                        (selectedStatus === "inactive" && !bundle.isActive);

                      return matchesSearch && matchesStatus;
                    })
                    .map((bundle) => (
                      <div
                        key={bundle._id}
                        className={`relative overflow-hidden rounded-xl p-4 flex flex-col gap-3 transition h-full ${
                          !bundle.isActive ? "opacity-50" : ""
                        }`}
                        style={{
                          backgroundColor: providerColors.primary,
                          color: providerColors.text,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                            {providerData?.logo?.url && !providerLogoFailed ? (
                              <img
                                src={providerData.logo.url}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={() => setProviderLogoFailed(true)}
                              />
                            ) : (
                              <FaBuilding className="w-5 h-5 text-white/80" />
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white">
                              {bundle.dataVolume}
                              {bundle.dataUnit}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white">
                              {bundle.validity === "unlimited" &&
                              bundle.validityUnit === "unlimited"
                                ? "Unlimited"
                                : `${bundle.validity} ${bundle.validityUnit}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-3">
                          <span className="font-bold text-base">
                            {bundle.name}
                          </span>

                          {!bundle.isActive && (
                            <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                              Inactive
                            </span>
                          )}

                          <div className="text-2xl font-bold">
                            {userType
                              ? formatCurrency(
                                  getPriceForUserType(bundle, userType),
                                  bundle.currency,
                                )
                              : `${bundle.price} ${bundle.currency}`}
                          </div>

                          {userType &&
                            (() => {
                              const userPrice = getPriceForUserType(
                                bundle,
                                userType,
                              );
                              const discount = calculateDiscountPercentage(
                                bundle.price,
                                userPrice,
                              );
                              return discount > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)]/30 text-white">
                                    {discount}% OFF
                                  </span>
                                  <span className="text-sm text-white/60 line-through">
                                    {formatCurrency(
                                      bundle.price,
                                      bundle.currency,
                                    )}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                        </div>

                        <button
                          disabled={!bundle.isActive}
                          onClick={() => {
                            if (bundle.isActive) {
                              setSelectedBundle(bundle);
                              setShowOrderModal(true);
                            }
                          }}
                          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition
                            bg-white/10 border border-white/20 text-white
                            hover:bg-white/20 active:bg-white/25
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bundle.isActive ? "Order Now" : "Out of Stock"}
                        </button>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Modals */}
        {showOrderModal && selectedBundle && (
          <SingleOrderModal
            bundle={selectedBundle}
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            onSuccess={() => {
              setShowOrderModal(false);
            }}
          />
        )}
        {showBulkOrderModal && selectedBulkPackage && (
          <BulkOrderModal
            isOpen={showBulkOrderModal}
            onClose={() => setShowBulkOrderModal(false)}
            onSuccess={() => setShowBulkOrderModal(false)}
            packageId={selectedBulkPackage._id!}
            provider={effectiveProvider}
            providerName={effectiveProvider}
          />
        )}
      </div>
    </Container>
  );
};
