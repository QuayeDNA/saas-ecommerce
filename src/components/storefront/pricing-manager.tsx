import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Badge,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FormField,
  Spinner,
  Switch,
} from "../../design-system";
import { useToast } from "../../design-system";
import {
  storefrontService,
  type AgentBundle,
} from "../../services/storefront.service";
import { getApiErrorMessage } from "../../utils/error-helpers";
import {
  Search,
  RotateCcw,
  Save,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  XSquare,
  Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------
interface PricingManagerProps {
  storefrontId: string;
}

interface BundlePricingEdit {
  customPrice: number;
  isEnabled: boolean;
}

const PROVIDER_BADGE_SCHEME: Record<
  string,
  "warning" | "error" | "info" | "success" | "gray"
> = {
  mtn: "warning",
  vodafone: "error",
  airteltigo: "info",
  at: "info",
  telecel: "success",
  afa: "gray",
  glo: "gray",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const PricingManager: React.FC<PricingManagerProps> = () => {
  const { addToast } = useToast();

  // Data
  const [bundles, setBundles] = useState<AgentBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(
    "individual",
  );
  const [selectedPackage, setSelectedPackage] = useState<string>(""); // "" = show package list
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Bulk state
  const [bulkMarkupType, setBulkMarkupType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [bulkMarkupValue, setBulkMarkupValue] = useState("");
  const [selectedBundleIds, setSelectedBundleIds] = useState<Set<string>>(
    new Set(),
  );

  // Per-bundle pricing edits
  const [edits, setEdits] = useState<Map<string, BundlePricingEdit>>(
    new Map(),
  );

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storefrontService.getAvailableBundles();
      setBundles(data);

      const updates = new Map<string, BundlePricingEdit>();
      data.forEach((b) => {
        updates.set(b._id, {
          customPrice: b.customPrice ?? b.tierPrice,
          isEnabled: b.isEnabled,
        });
      });
      setEdits(updates);
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to load pricing information"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  /** Unique packages extracted from bundles */
  const packages = useMemo(() => {
    const pkgMap = new Map<
      string,
      { name: string; count: number; enabledCount: number }
    >();
    bundles.forEach((b) => {
      const name = b.packageName || "Uncategorized";
      const existing = pkgMap.get(name) || { name, count: 0, enabledCount: 0 };
      existing.count += 1;
      if (edits.get(b._id)?.isEnabled) existing.enabledCount += 1;
      pkgMap.set(name, existing);
    });
    return Array.from(pkgMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [bundles, edits]);

  /** Bundles for the selected package, with optional search/enabled filter */
  const filteredBundles = useMemo(() => {
    if (!selectedPackage) return [];
    return bundles.filter((b) => {
      const pkgName = b.packageName || "Uncategorized";
      if (pkgName !== selectedPackage) return false;
      if (showEnabledOnly && !edits.get(b._id)?.isEnabled) return false;
      if (
        searchTerm &&
        !b.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [bundles, selectedPackage, searchTerm, showEnabledOnly, edits]);

  /** Whether any edits differ from the server state */
  const hasChanges = useMemo(() => {
    return bundles.some((b) => {
      const edit = edits.get(b._id);
      if (!edit) return false;
      const originalCustom = b.customPrice ?? b.tierPrice;
      return (
        edit.customPrice !== originalCustom || edit.isEnabled !== b.isEnabled
      );
    });
  }, [edits, bundles]);

  const changedCount = useMemo(() => {
    return bundles.filter((b) => {
      const edit = edits.get(b._id);
      if (!edit) return false;
      const originalCustom = b.customPrice ?? b.tierPrice;
      return (
        edit.customPrice !== originalCustom || edit.isEnabled !== b.isEnabled
      );
    }).length;
  }, [edits, bundles]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handlePriceChange = (bundleId: string, value: number) => {
    setEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(bundleId) || {
        customPrice: 0,
        isEnabled: true,
      };
      next.set(bundleId, { ...current, customPrice: value });
      return next;
    });
  };

  const handleToggle = (bundleId: string, enabled: boolean) => {
    setEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(bundleId) || {
        customPrice: 0,
        isEnabled: false,
      };
      next.set(bundleId, { ...current, isEnabled: enabled });
      return next;
    });
  };

  const resetToOriginal = () => {
    const updates = new Map<string, BundlePricingEdit>();
    bundles.forEach((b) => {
      updates.set(b._id, {
        customPrice: b.customPrice ?? b.tierPrice,
        isEnabled: b.isEnabled,
      });
    });
    setEdits(updates);
    setSelectedBundleIds(new Set());
    addToast("All changes reset", "info");
  };

  // Bulk operations
  const toggleBulkSelection = (bundleId: string, selected: boolean) => {
    setSelectedBundleIds((prev) => {
      const next = new Set(prev);
      selected ? next.add(bundleId) : next.delete(bundleId);
      return next;
    });
  };

  const selectAllFiltered = () =>
    setSelectedBundleIds(new Set(filteredBundles.map((b) => b._id)));

  const clearSelection = () => setSelectedBundleIds(new Set());

  const applyBulkMarkup = () => {
    if (!bulkMarkupValue || selectedBundleIds.size === 0) {
      addToast("Select bundles and enter a markup value", "error");
      return;
    }
    const markup = parseFloat(bulkMarkupValue);
    if (isNaN(markup)) {
      addToast("Enter a valid number", "error");
      return;
    }

    setEdits((prev) => {
      const next = new Map(prev);
      selectedBundleIds.forEach((id) => {
        const bundle = bundles.find((b) => b._id === id);
        if (!bundle) return;
        const current = next.get(id) || {
          customPrice: bundle.tierPrice,
          isEnabled: true,
        };
        const newPrice =
          bulkMarkupType === "percentage"
            ? bundle.tierPrice * (1 + markup / 100)
            : bundle.tierPrice + markup;
        next.set(id, {
          ...current,
          customPrice: Math.max(0, Number(newPrice.toFixed(2))),
        });
      });
      return next;
    });

    addToast(
      `Applied ${bulkMarkupType === "percentage" ? markup + "%" : "GHS " + markup} markup to ${selectedBundleIds.size} bundles`,
      "success",
    );
  };

  const enableAllInPackage = () => {
    setEdits((prev) => {
      const next = new Map(prev);
      filteredBundles.forEach((b) => {
        const current = next.get(b._id) || {
          customPrice: b.tierPrice,
          isEnabled: false,
        };
        next.set(b._id, { ...current, isEnabled: true });
      });
      return next;
    });
  };

  const disableAllInPackage = () => {
    setEdits((prev) => {
      const next = new Map(prev);
      filteredBundles.forEach((b) => {
        const current = next.get(b._id) || {
          customPrice: b.tierPrice,
          isEnabled: true,
        };
        next.set(b._id, { ...current, isEnabled: false });
      });
      return next;
    });
  };

  // Save
  const saveChanges = async () => {
    try {
      setIsSaving(true);

      const toggleItems = bundles
        .filter((b) => {
          const edit = edits.get(b._id);
          return edit && edit.isEnabled !== b.isEnabled;
        })
        .map((b) => ({
          bundleId: b._id,
          isEnabled: edits.get(b._id)!.isEnabled,
        }));

      const pricingItems = bundles
        .filter((b) => {
          const edit = edits.get(b._id);
          if (!edit) return false;
          return edit.customPrice !== (b.customPrice ?? b.tierPrice);
        })
        .map((b) => {
          const edit = edits.get(b._id)!;
          return edit.customPrice === b.tierPrice
            ? { bundleId: b._id }
            : { bundleId: b._id, customPrice: edit.customPrice };
        });

      const promises: Promise<unknown>[] = [];
      if (toggleItems.length > 0)
        promises.push(storefrontService.toggleBundles(toggleItems));
      if (pricingItems.length > 0)
        promises.push(storefrontService.updatePricing(pricingItems));

      if (promises.length > 0) await Promise.all(promises);
      await loadData();
      addToast("Pricing updated successfully!", "success");
    } catch (error) {
      addToast(
        getApiErrorMessage(error, "Failed to save pricing changes"),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getMarkup = (tierPrice: number, customPrice: number) => {
    const diff = customPrice - tierPrice;
    const pct = tierPrice > 0 ? (diff / tierPrice) * 100 : 0;
    return { diff, pct };
  };

  const getProviderBadge = (code: string) => {
    const scheme = PROVIDER_BADGE_SCHEME[code.toLowerCase()] || "gray";
    return (
      <Badge colorScheme={scheme} variant="subtle" size="sm">
        {code.toUpperCase()}
      </Badge>
    );
  };

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-sm text-gray-600">
            Loading pricing data...
          </span>
        </CardBody>
      </Card>
    );
  }

  // -------------------------------------------------------------------------
  // Package List View (no package selected)
  // -------------------------------------------------------------------------
  if (!selectedPackage) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Pricing Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a package to manage bundle pricing &amp; visibility
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Badge colorScheme="warning" size="sm">
                {changedCount} unsaved change{changedCount !== 1 ? "s" : ""}
              </Badge>
              <Button
                onClick={saveChanges}
                isLoading={isSaving}
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToOriginal}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              variant="outlined"
              className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              onClick={() => setSelectedPackage(pkg.name)}
            >
              <CardBody className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge
                    colorScheme={pkg.enabledCount > 0 ? "success" : "gray"}
                    variant="subtle"
                    size="sm"
                  >
                    {pkg.enabledCount}/{pkg.count} enabled
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {pkg.count} bundle{pkg.count !== 1 ? "s" : ""}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Alert status="info">
            No packages found. Contact your administrator to add bundles.
          </Alert>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Bundle Pricing View (package selected)
  // -------------------------------------------------------------------------
  const currentPkg = packages.find((p) => p.name === selectedPackage);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                setSelectedPackage("");
                setSearchTerm("");
                setShowEnabledOnly(false);
                setSelectedBundleIds(new Set());
              }}
              className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Back to packages"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600 shrink-0" />
                {selectedPackage}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredBundles.length} of {currentPkg?.count || 0} bundles
                {showEnabledOnly ? " (enabled only)" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasChanges && (
              <Badge colorScheme="warning" size="sm">
                {changedCount} changed
              </Badge>
            )}
            <Button
              onClick={saveChanges}
              isLoading={isSaving}
              disabled={!hasChanges}
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Save Changes</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToOriginal}
              disabled={!hasChanges}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Instructions Accordion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-blue-800">
                How pricing works
              </span>
            </div>
            {isInstructionsOpen ? (
              <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600 shrink-0" />
            )}
          </button>
          {isInstructionsOpen && (
            <div className="px-3 pb-3 border-t border-blue-200">
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-blue-800 mt-2">
                <li>
                  <strong>Tier Price</strong> is your cost — set by admin based
                  on your account type
                </li>
                <li>
                  <strong>Your Price</strong> is what customers see. Set above
                  tier price to earn profit
                </li>
                <li>
                  Toggle <strong>Visible</strong> to show/hide bundles on your
                  storefront
                </li>
                <li>
                  Bundles you haven't configured are shown at tier price by
                  default
                </li>
                <li>
                  Use <strong>Bulk Updates</strong> tab to apply markup to
                  multiple bundles at once
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardBody>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "individual" | "bulk")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="individual">Individual Pricing</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Updates</TabsTrigger>
            </TabsList>

            {/* ============================================================ */}
            {/* Individual Pricing Tab                                        */}
            {/* ============================================================ */}
            <TabsContent value="individual">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search bundles..."
                    leftIcon={<Search className="w-4 h-4" />}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={showEnabledOnly}
                    onCheckedChange={setShowEnabledOnly}
                    label="Enabled only"
                    size="sm"
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enableAllInPackage}
                      title="Enable all in package"
                      className="px-2"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableAllInPackage}
                      title="Disable all in package"
                      className="px-2"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                          Bundle
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                          Provider
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">
                          Tier Price
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                          Your Price
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                          Markup
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                          Profit
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                          Visible
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBundles.map((bundle) => {
                        const edit = edits.get(bundle._id) || {
                          customPrice: bundle.tierPrice,
                          isEnabled: false,
                        };
                        const { diff, pct } = getMarkup(
                          bundle.tierPrice,
                          edit.customPrice,
                        );
                        const originalCustom =
                          bundle.customPrice ?? bundle.tierPrice;
                        const isChanged =
                          edit.customPrice !== originalCustom ||
                          edit.isEnabled !== bundle.isEnabled;

                        return (
                          <tr
                            key={bundle._id}
                            className={`hover:bg-gray-50 transition-colors ${isChanged ? "bg-yellow-50" : ""} ${!edit.isEnabled ? "opacity-60" : ""}`}
                          >
                            <td className="px-3 py-2.5">
                              <div>
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {bundle.name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {bundle.dataVolume}
                                  {bundle.dataUnit} &middot;{" "}
                                  {bundle.category || "N/A"}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {getProviderBadge(bundle.provider.code)}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-sm font-medium text-gray-700">
                                GHS {bundle.tierPrice.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={edit.customPrice}
                                onChange={(e) =>
                                  handlePriceChange(
                                    bundle._id,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className={`w-full px-2 py-1 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isChanged
                                    ? "border-yellow-400 bg-yellow-50"
                                    : "border-gray-300"
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`text-sm font-medium ${pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-gray-500"}`}
                              >
                                {pct > 0 ? "+" : ""}
                                {pct.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {diff > 0 ? (
                                <Badge
                                  colorScheme="success"
                                  variant="subtle"
                                  size="sm"
                                >
                                  +GHS {diff.toFixed(2)}
                                </Badge>
                              ) : diff < 0 ? (
                                <Badge
                                  colorScheme="error"
                                  variant="subtle"
                                  size="sm"
                                >
                                  GHS {diff.toFixed(2)}
                                </Badge>
                              ) : (
                                <Badge
                                  colorScheme="gray"
                                  variant="subtle"
                                  size="sm"
                                >
                                  At Tier
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Switch
                                checked={edit.isEnabled}
                                onCheckedChange={(checked) =>
                                  handleToggle(bundle._id, checked)
                                }
                                size="sm"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-3">
                {filteredBundles.map((bundle) => {
                  const edit = edits.get(bundle._id) || {
                    customPrice: bundle.tierPrice,
                    isEnabled: false,
                  };
                  const { diff, pct } = getMarkup(
                    bundle.tierPrice,
                    edit.customPrice,
                  );
                  const originalCustom =
                    bundle.customPrice ?? bundle.tierPrice;
                  const isChanged =
                    edit.customPrice !== originalCustom ||
                    edit.isEnabled !== bundle.isEnabled;

                  return (
                    <div
                      key={bundle._id}
                      className={`border rounded-lg p-3 sm:p-4 space-y-3 transition-all ${
                        isChanged
                          ? "border-yellow-300 bg-yellow-50/50"
                          : "border-gray-200"
                      } ${!edit.isEnabled ? "opacity-60" : ""}`}
                    >
                      {/* Name + toggle */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {bundle.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {getProviderBadge(bundle.provider.code)}
                            <span className="text-xs text-gray-500">
                              {bundle.dataVolume}
                              {bundle.dataUnit} &middot;{" "}
                              {bundle.category || "N/A"}
                            </span>
                          </div>
                        </div>
                        <Switch
                          checked={edit.isEnabled}
                          onCheckedChange={(checked) =>
                            handleToggle(bundle._id, checked)
                          }
                          size="sm"
                        />
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Tier Price
                          </p>
                          <p className="font-medium text-gray-700 text-sm">
                            GHS {bundle.tierPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Your Price
                          </p>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={edit.customPrice}
                            onChange={(e) =>
                              handlePriceChange(
                                bundle._id,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isChanged
                                ? "border-yellow-400 bg-yellow-50"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Markup line */}
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-gray-500"}`}
                        >
                          {pct > 0 ? "+" : ""}
                          {pct.toFixed(1)}% markup
                        </span>
                        {diff > 0 ? (
                          <Badge
                            colorScheme="success"
                            variant="subtle"
                            size="sm"
                          >
                            +GHS {diff.toFixed(2)}
                          </Badge>
                        ) : diff < 0 ? (
                          <Badge
                            colorScheme="error"
                            variant="subtle"
                            size="sm"
                          >
                            GHS {diff.toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge
                            colorScheme="gray"
                            variant="subtle"
                            size="sm"
                          >
                            At Tier
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBundles.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No bundles match your filters
                </div>
              )}

              {/* Summary bar */}
              {filteredBundles.length > 0 && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Total Bundles
                      </p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        {currentPkg?.count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Enabled</p>
                      <p className="text-sm sm:text-base font-bold text-green-600">
                        {currentPkg?.enabledCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Modified</p>
                      <p className="text-sm sm:text-base font-bold text-yellow-600">
                        {changedCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Showing</p>
                      <p className="text-sm sm:text-base font-bold text-blue-600">
                        {filteredBundles.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ============================================================ */}
            {/* Bulk Updates Tab                                              */}
            {/* ============================================================ */}
            <TabsContent value="bulk">
              <div className="space-y-4">
                {/* Bundle selector */}
                <Card variant="outlined">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-base font-semibold">
                        Select Bundles
                      </h3>
                      <span className="text-sm text-gray-500">
                        {selectedBundleIds.size} selected
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllFiltered}
                        leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                      >
                        Select All ({filteredBundles.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        leftIcon={<XSquare className="w-3.5 h-3.5" />}
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-gray-100 border rounded-lg">
                      {filteredBundles.map((bundle) => (
                        <label
                          key={bundle._id}
                          className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBundleIds.has(bundle._id)}
                            onChange={(e) =>
                              toggleBulkSelection(
                                bundle._id,
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {bundle.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getProviderBadge(bundle.provider.code)}
                              <span className="text-xs text-gray-500">
                                {bundle.dataVolume}
                                {bundle.dataUnit}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 shrink-0">
                            GHS {bundle.tierPrice.toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Markup application */}
                <Card variant="outlined">
                  <CardHeader>
                    <h3 className="text-base font-semibold">Apply Markup</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField label="Markup Type">
                        <Select
                          value={bulkMarkupType}
                          onChange={(v) =>
                            setBulkMarkupType(v as "percentage" | "fixed")
                          }
                          options={[
                            { value: "percentage", label: "Percentage (%)" },
                            { value: "fixed", label: "Fixed Amount (GHS)" },
                          ]}
                        />
                      </FormField>
                      <FormField
                        label={
                          bulkMarkupType === "percentage"
                            ? "Percentage"
                            : "Amount (GHS)"
                        }
                      >
                        <Input
                          type="number"
                          step={
                            bulkMarkupType === "percentage" ? "0.1" : "0.01"
                          }
                          min="0"
                          value={bulkMarkupValue}
                          onChange={(e) => setBulkMarkupValue(e.target.value)}
                          placeholder={
                            bulkMarkupType === "percentage"
                              ? "e.g., 15"
                              : "e.g., 2.50"
                          }
                        />
                      </FormField>
                      <div className="flex items-end">
                        <Button
                          onClick={applyBulkMarkup}
                          disabled={
                            !bulkMarkupValue || selectedBundleIds.size === 0
                          }
                          className="w-full"
                          size="sm"
                        >
                          Apply to {selectedBundleIds.size} Bundles
                        </Button>
                      </div>
                    </div>

                    {bulkMarkupValue && selectedBundleIds.size > 0 && (
                      <Alert
                        status="info"
                        variant="left-accent"
                        className="mt-4"
                      >
                        This will apply a{" "}
                        {bulkMarkupType === "percentage"
                          ? `${bulkMarkupValue}% markup`
                          : `GHS ${bulkMarkupValue} increase`}{" "}
                        to {selectedBundleIds.size} selected bundles.
                      </Alert>
                    )}
                  </CardBody>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};
