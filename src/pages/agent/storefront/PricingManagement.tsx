// src/pages/agent/storefront/PricingManagement.tsx
import { useState, useEffect, useMemo } from "react";
import { Card } from "../../../design-system/components/card";
import { Button } from "../../../design-system/components/button";
import { Input } from "../../../design-system/components/input";
import { Badge } from "../../../design-system/components/badge";
import { Select } from "../../../design-system/components/select";
import { Pagination } from "../../../design-system/components/pagination";
import { useToast } from "../../../design-system";
import {
  DollarSign,
  TrendingUp,
  Package as PackageIcon,
  Save,
  RefreshCw,
} from "lucide-react";
import { bundleService } from "../../../services/bundle.service";
import { packageService } from "../../../services/package.service";
import { storefrontService } from "../../../services/storefront.service";
import { useStorefront } from "../../../hooks/useStorefront";
import { useAuth } from "../../../contexts/AuthContext";
import type { Bundle, Package } from "../../../types/package";

interface PricingItem {
  bundleId: string;
  bundle: Bundle;
  agentTierPrice: number;
  customPrice: number;
  markup: number;
  profitMargin: number;
  isActive: boolean;
}

export default function PricingManagement() {
  const { authState } = useAuth();
  const { user } = authState;
  const { storefront, updateStorefront } = useStorefront();
  const { showToast } = useToast();

  // State for packages and bundles
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalBundles, setTotalBundles] = useState(0);

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Fetch bundles when package is selected
  useEffect(() => {
    if (selectedPackageId) {
      fetchBundlesByPackage(selectedPackageId, currentPage);
    } else {
      setBundles([]);
      setPricingItems([]);
    }
  }, [selectedPackageId, currentPage]);

  // Initialize pricing items when bundles and storefront are loaded
  useEffect(() => {
    if (bundles.length > 0 && storefront) {
      initializePricingItems();
    }
  }, [bundles, storefront]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getPackages({ isActive: true });
      setPackages(response.packages);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      showToast("Failed to load packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBundlesByPackage = async (packageId: string, page: number = 1) => {
    try {
      setBundlesLoading(true);
      const response = await bundleService.getBundlesByPackage(packageId, {
        page,
        limit: itemsPerPage,
      });
      setBundles(response.bundles);
      setTotalBundles(response.pagination.total);
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
      showToast("Failed to load bundles", "error");
    } finally {
      setBundlesLoading(false);
    }
  };

  const handlePackageChange = (packageId: string) => {
    setSelectedPackageId(packageId);
    setCurrentPage(1); // Reset to first page when changing package
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const initializePricingItems = () => {
    const items: PricingItem[] = bundles.map((bundle) => {
      // Get agent's tier price
      const agentTierPrice = getAgentTierPrice(bundle);

      // Get existing custom pricing from storefront
      const existingPricing = storefront?.pricing?.find(
        (p) => p.bundleId === bundle._id,
      );

      const customPrice = existingPricing?.customPrice || agentTierPrice;
      const markup = customPrice - agentTierPrice;
      const profitMargin =
        agentTierPrice > 0 ? (markup / agentTierPrice) * 100 : 0;

      return {
        bundleId: bundle._id!,
        bundle,
        agentTierPrice,
        customPrice,
        markup,
        profitMargin,
        isActive: existingPricing?.isActive ?? true,
      };
    });

    setPricingItems(items);
  };

  const getAgentTierPrice = (bundle: Bundle): number => {
    if (!user?.userType) return bundle.price;

    // Get price based on user type (only for agent hierarchy)
    const tierPricing =
      bundle.pricingTiers?.[user.userType as keyof typeof bundle.pricingTiers];
    return tierPricing || bundle.pricingTiers?.default || bundle.price;
  };

  const updatePricing = (bundleId: string, customPrice: number) => {
    setPricingItems((prev) =>
      prev.map((item) => {
        if (item.bundleId === bundleId) {
          const markup = customPrice - item.agentTierPrice;
          const profitMargin =
            item.agentTierPrice > 0 ? (markup / item.agentTierPrice) * 100 : 0;

          return {
            ...item,
            customPrice,
            markup,
            profitMargin,
          };
        }
        return item;
      }),
    );
  };

  const togglePricingActive = (bundleId: string) => {
    setPricingItems((prev) =>
      prev.map((item) =>
        item.bundleId === bundleId
          ? { ...item, isActive: !item.isActive }
          : item,
      ),
    );
  };

  const savePricing = async () => {
    if (!storefront?._id) return;

    try {
      setSaving(true);

      // Validate all custom prices are >= agent tier prices
      const invalidItems = pricingItems.filter(
        (item) => item.isActive && item.customPrice < item.agentTierPrice,
      );

      if (invalidItems.length > 0) {
        showToast(
          "Custom prices must be at least the agent tier price",
          "error",
        );
        return;
      }

      // Prepare pricing data for API
      const pricingData = pricingItems.map((item) => ({
        bundleId: item.bundleId,
        customPrice: item.customPrice,
        markup: item.markup,
        isActive: item.isActive,
      }));

      await storefrontService.setPricing(storefront._id, pricingData);
      await updateStorefront(storefront._id, {}); // Refresh storefront data

      showToast("Pricing updated successfully", "success");
    } catch (error) {
      console.error("Failed to save pricing:", error);
      showToast("Failed to save pricing", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPricingItems((prev) =>
      prev.map((item) => ({
        ...item,
        customPrice: item.agentTierPrice,
        markup: 0,
        profitMargin: 0,
      })),
    );
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const activeItems = pricingItems.filter((item) => item.isActive);
    const totalMarkup = activeItems.reduce((sum, item) => sum + item.markup, 0);
    const avgMargin =
      activeItems.length > 0
        ? activeItems.reduce((sum, item) => sum + item.profitMargin, 0) /
          activeItems.length
        : 0;

    return {
      activeProducts: activeItems.length,
      totalMarkup,
      avgMargin,
    };
  }, [pricingItems]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pricing Management
          </h2>
          <p className="text-gray-600 mt-1">
            Set custom prices and profit margins for your storefront products.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={savePricing}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Pricing"}
          </Button>
        </div>
      </div>

      {/* Package Selector */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Package
            </label>
            <Select
              value={selectedPackageId}
              onChange={handlePackageChange}
              options={[
                { value: "", label: "Choose a package to view bundles..." },
                ...packages.map((pkg) => ({
                  value: pkg._id!,
                  label: `${pkg.name} - ${pkg.provider} (${pkg.category})`,
                })),
              ]}
              placeholder="Choose a package to view bundles..."
            />
          </div>

          {selectedPackageId && (
            <div className="text-sm text-gray-600">
              Select a package above to view and manage pricing for its bundles.
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats - Only show when bundles are loaded */}
      {selectedPackageId && bundles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center">
              <PackageIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.activeProducts}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Markup</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₵{summaryStats.totalMarkup.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.avgMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pricing Table */}
      {selectedPackageId && (
        <Card className="p-6">
          {bundlesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                </div>
              ))}
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-8">
              <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No bundles found for this package.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {pricingItems.map((item) => (
                  <div
                    key={item.bundleId}
                    className={`border rounded-lg p-4 ${!item.isActive ? "bg-gray-50 opacity-60" : "bg-white"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {item.bundle.name}
                          </h3>
                          <Badge variant={item.isActive ? "solid" : "outline"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.bundle.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{item.bundle.provider?.name}</span>
                          <span>•</span>
                          <span>{item.bundle.formattedDataVolume}</span>
                          <span>•</span>
                          <span>{item.bundle.formattedValidity}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePricingActive(item.bundleId)}
                      >
                        {item.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>

                    {item.isActive && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Agent Tier Price
                          </label>
                          <div className="text-lg font-semibold text-gray-900">
                            ₵{item.agentTierPrice.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Price
                          </label>
                          <Input
                            type="number"
                            min={item.agentTierPrice}
                            step="0.01"
                            value={item.customPrice}
                            onChange={(e) =>
                              updatePricing(
                                item.bundleId,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Markup
                          </label>
                          <div
                            className={`text-lg font-semibold ${item.markup >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            ₵{item.markup.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profit Margin
                          </label>
                          <div
                            className={`text-lg font-semibold ${item.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {item.profitMargin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {item.customPrice < item.agentTierPrice &&
                      item.isActive && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                          ⚠️ Custom price cannot be lower than agent tier price
                          (₵
                          {item.agentTierPrice.toFixed(2)})
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalBundles > itemsPerPage && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalBundles / itemsPerPage)}
                    totalItems={totalBundles}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    showInfo={true}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Save Button (Bottom) - Only show when bundles are loaded */}
      {selectedPackageId && bundles.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={savePricing}
            disabled={saving}
            size="lg"
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Saving Pricing..." : "Save All Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
