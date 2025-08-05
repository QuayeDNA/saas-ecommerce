import React, { useEffect, useState, useMemo } from "react";
import { packageService } from "../../services/package.service";
import { bundleService } from "../../services/bundle.service";
import { providerService } from "../../services/provider.service";
import { getProviderColors } from "../../utils/provider-colors";
import { SingleOrderModal } from "../orders/SingleOrderModal";
import { BulkOrderModal } from "../orders/BulkOrderModal";
import { SearchAndFilter } from "../common/SearchAndFilter";
import { FaBox, FaBuilding } from "react-icons/fa";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Alert,
  Spinner,
  Container,
  Section,
} from "../../design-system";
import type { Package, Bundle, Provider } from "../../types/package";

export interface ProviderPackageDisplayProps {
  provider: string; // provider code (e.g., 'MTN')
  category?: string; // optional category/tag
  packageId?: string; // optional specific package id
  filters?: Record<string, unknown>; // additional filters for packages
}

export const ProviderPackageDisplay: React.FC<ProviderPackageDisplayProps> = ({
  provider,
  category,
  packageId,
  filters = {},
}) => {
  // State
  const [packages, setPackages] = useState<Package[]>([]);
  const [bundles, setBundles] = useState<Record<string, Bundle[]>>({}); // key: packageId
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [providerLogoFailed, setProviderLogoFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || "all"
  );
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBulkOrderModal, setShowBulkOrderModal] = useState(false);
  const [selectedBulkPackage, setSelectedBulkPackage] =
    useState<Package | null>(null);

  // Fetch packages based on props
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPackages([]);
    setBundles({});
    setProviderData(null);
    setProviderLogoFailed(false);
    
    const fetch = async () => {
      try {
        // Fetch provider data first
        try {
          const providerResponse = await providerService.getProviders();
          const providerInfo = providerResponse.providers.find(p => p.code === provider);
          if (providerInfo) {
            setProviderData(providerInfo);
          }
        } catch (providerError) {
          // Provider fetch failed, continue with packages
          console.warn('Failed to fetch provider data:', providerError);
        }

        let pkgList: Package[] = [];
        if (packageId) {
          // Fetch a single package by id
          const pkg = await packageService.getPackage(packageId);
          if (pkg) pkgList = [pkg];
        } else {
          // Build filters - ensure we get all active packages
          const pkgFilters: Record<string, unknown> = { 
            provider, 
            isActive: true, // Ensure only active packages
            ...filters 
          };
          if (category) pkgFilters.category = category;
          // Fetch all packages for provider/category
          const resp = await packageService.getPackages(pkgFilters);
          pkgList = resp.packages || [];
        }
        setPackages(pkgList);
        // Fetch bundles for each package - get all bundles without pagination
        const bundleMap: Record<string, Bundle[]> = {};
        for (const pkg of pkgList) {
          if (pkg._id) {
            // Get all bundles by setting a high limit
            const resp = await bundleService.getBundlesByPackage(pkg._id, { limit: 1000 });
            bundleMap[pkg._id] = resp.bundles || [];
          }
        }
        setBundles(bundleMap);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Failed to fetch packages or bundles"
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, category, packageId, JSON.stringify(filters)]);

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

  // Provider display (for color, etc.)
  const providerColors = getProviderColors(provider);

  // Search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search bundles...",
    filters:
      !category && !packageId && categories.length > 1
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
        : ({} as Record<
            string,
            {
              value: string;
              options: { value: string; label: string }[];
              label: string;
              placeholder?: string;
            }
          >),
    onFilterChange: (filterKey: string, value: string) => {
      if (filterKey === "category") {
        setSelectedCategory(value);
      }
    },
    onSearch: () => {},
    onClearFilters: () => {
      setSearchTerm("");
      setSelectedCategory(category || "all");
    },
    isLoading: loading,
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <CardBody className="p-8">
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-600">Loading packages...</span>
            </div>
          </CardBody>
        </Card>
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
              <FaBox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No packages found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
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
        <Section padding="none" background="gray">
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
                    alt={providerData.logo.alt || `${provider} Logo`}
                    className="w-full h-full object-cover"
                    onError={() => setProviderLogoFailed(true)}
                  />
                ) : (
                  <FaBuilding className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {providerData?.name || provider} Data Packages
                </h2>
                <p className="text-gray-600">Browse and order data bundles</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Search and Filters */}
        <SearchAndFilter {...searchAndFilterConfig} />

        {/* Package and Bundle Cards */}
        <div className="space-y-6">
          {filteredPackages.map((pkg) => (
            <Card
              key={pkg._id}
              className="overflow-hidden"
              style={{ backgroundColor: providerColors.primary }}
            >
              <CardBody className="p-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="ml-auto mb-2"
                  onClick={() => {
                    setSelectedBulkPackage(pkg);
                    setShowBulkOrderModal(true);
                  }}
                >
                  Bulk Order
                </Button>
                <div className="flex items-center gap-2 mb-2">
                  <FaBox
                    className="text-xl w-10 h-10"
                    style={{ color: providerColors.secondary }}
                  />
                  <span className="font-semibold text-lg text-white">
                    {pkg.name}
                  </span>
                </div>
                <p className="mb-2 text-gray-100">{pkg.description}</p>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(bundles[pkg._id!] || [])
                      .filter(
                        (bundle) =>
                          searchTerm === "" ||
                          bundle.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          (bundle.description?.toLowerCase() ?? "").includes(
                            searchTerm.toLowerCase()
                          )
                      )

                      .map((bundle) => (
                        <Card
                          key={bundle._id}
                          className="hover:shadow-md transition"
                        >
                          <CardBody>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-gray-900">
                                  {bundle.name}
                                </span>
                              </div>
                              <div className="flex gap-2 text-sm">
                                <Badge
                                  colorScheme="info"
                                  className="border"
                                  style={{
                                    borderColor: providerColors.primary,
                                  }}
                                >
                                  {bundle.dataVolume}
                                  {bundle.dataUnit}
                                </Badge>
                                <Badge
                                  colorScheme="info"
                                  className="border"
                                  style={{
                                    borderColor: providerColors.secondary,
                                  }}
                                >
                                  {bundle.validity === "unlimited" &&
                                  bundle.validityUnit === "unlimited"
                                    ? "Unlimited"
                                    : `${bundle.validity} ${bundle.validityUnit}`}
                                </Badge>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {bundle.price} {bundle.currency}
                              </div>
                              <Button
                                className="font-semibold"
                                style={{
                                  backgroundColor: providerColors.primary,
                                  color: providerColors.text,
                                }}
                                onClick={() => {
                                  setSelectedBundle(bundle);
                                  setShowOrderModal(true);
                                }}
                              >
                                Order Now
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
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
            provider={provider}
            providerName={provider}
          />
        )}
      </div>
    </Container>
  );
};
