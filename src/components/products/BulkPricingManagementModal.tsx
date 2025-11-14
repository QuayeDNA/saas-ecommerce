import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
  Badge,
} from "../../design-system";
import { bundleService } from "../../services/bundle.service";
import { useToast } from "../../design-system/components/toast";
import {
  FaDollarSign,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaEdit,
  FaCube,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import type { Bundle } from "../../types/package";

interface BulkPricingManagementModalProps {
  packageId: string;
  packageName: string;
  bundles: Bundle[];
  isOpen: boolean;
  onClose: () => void;
  onPricingUpdated: () => void;
}

interface PricingData {
  [bundleId: string]: {
    basePrice: number;
    pricingTiers: Record<string, number>;
    hasChanges: boolean;
  };
}

const USER_TYPES = [
  { key: "customer", label: "Customer", color: "bg-blue-100 text-blue-800" },
  { key: "agent", label: "Agent", color: "bg-green-100 text-green-800" },
  {
    key: "super_agent",
    label: "Super Agent",
    color: "bg-purple-100 text-purple-800",
  },
  { key: "dealer", label: "Dealer", color: "bg-orange-100 text-orange-800" },
  {
    key: "super_dealer",
    label: "Super Dealer",
    color: "bg-red-100 text-red-800",
  },
];

export const BulkPricingManagementModal: React.FC<
  BulkPricingManagementModalProps
> = ({ packageName, bundles, isOpen, onClose, onPricingUpdated }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState<PricingData>({});
  const [editingCell, setEditingCell] = useState<{
    bundleId: string;
    userType: string;
  } | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && bundles.length > 0) {
      loadAllPricing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bundles]);

  const loadAllPricing = async () => {
    setLoading(true);
    try {
      const promises = bundles.map((bundle) =>
        bundleService.getBundlePricing(bundle._id!)
      );
      const results = await Promise.all(promises);

      const newPricingData: PricingData = {};
      results.forEach((result, index) => {
        newPricingData[bundles[index]._id!] = {
          basePrice: result.basePrice,
          pricingTiers: result.pricingTiers || {},
          hasChanges: false,
        };
      });

      setPricingData(newPricingData);
    } catch (error) {
      console.error("Error loading pricing:", error);
      addToast("Failed to load pricing data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (
    bundleId: string,
    userType: string,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setPricingData((prev) => ({
      ...prev,
      [bundleId]: {
        ...prev[bundleId],
        pricingTiers: {
          ...prev[bundleId].pricingTiers,
          [userType]: numValue,
        },
        hasChanges: true,
      },
    }));
  };

  const handleBasePriceChange = (bundleId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setPricingData((prev) => ({
      ...prev,
      [bundleId]: {
        ...prev[bundleId],
        basePrice: numValue,
        hasChanges: true,
      },
    }));
  };

  const handleCellClick = (bundleId: string, userType: string) => {
    setEditingCell({ bundleId, userType });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const getChangedBundlesCount = () => {
    return Object.values(pricingData).filter((data) => data.hasChanges).length;
  };

  const handleSaveAll = async () => {
    const changedBundles = Object.entries(pricingData).filter(
      ([, data]) => data.hasChanges
    );

    if (changedBundles.length === 0) {
      addToast("No changes to save", "info");
      return;
    }

    setSaving(true);
    try {
      const updates = changedBundles.map(([bundleId, data]) => ({
        bundleId,
        pricingTiers: data.pricingTiers,
      }));

      const result = await bundleService.bulkUpdatePricing(updates);

      if (result.failed.length > 0) {
        addToast(
          `Updated ${result.successful.length} bundles, ${result.failed.length} failed`,
          "warning"
        );
      } else {
        addToast(
          `Successfully updated pricing for ${result.successful.length} bundles`,
          "success"
        );
      }

      // Reset hasChanges flags
      setPricingData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((key) => {
          newData[key].hasChanges = false;
        });
        return newData;
      });

      onPricingUpdated();
    } catch (error) {
      console.error("Error saving pricing:", error);
      addToast("Failed to save pricing changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = () => {
    loadAllPricing();
    addToast("All changes have been reset", "info");
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
              <FaDollarSign className="text-green-600 text-sm sm:text-base" />
              <span className="truncate">Bulk Pricing Management</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {packageName} - Manage pricing for {bundles.length} bundles across
              all user types
            </p>
          </div>
          {getChangedBundlesCount() > 0 && (
            <Badge colorScheme="warning" size="sm" className="sm:text-sm">
              {getChangedBundlesCount()} Bundle
              {getChangedBundlesCount() !== 1 ? "s" : ""} Modified
            </Badge>
          )}
        </div>
      </DialogHeader>

      <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading pricing data...</span>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Instructions Accordion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaExclamationTriangle className="text-blue-600 flex-shrink-0 text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm font-semibold text-blue-800">
                    How to use
                  </span>
                </div>
                {isInstructionsOpen ? (
                  <FaChevronUp className="text-blue-600 text-xs sm:text-sm flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-blue-600 text-xs sm:text-sm flex-shrink-0" />
                )}
              </button>
              {isInstructionsOpen && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-blue-200">
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-blue-800 mt-2">
                    <li>Click any price cell to edit</li>
                    <li>Changes are highlighted with a yellow background</li>
                    <li>Use "Save All Changes" to apply all modifications</li>
                    <li>Use "Reset All" to discard all changes</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Pricing Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider sticky left-0 bg-gray-50 z-20 min-w-[180px] sm:min-w-[220px] md:min-w-[250px]">
                        Bundle
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider min-w-[90px] sm:min-w-[110px] md:min-w-[120px]">
                        Base
                      </th>
                      {USER_TYPES.map((userType) => (
                        <th
                          key={userType.key}
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider min-w-[100px] sm:min-w-[120px] md:min-w-[140px]"
                        >
                          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <span className="hidden sm:inline">
                              {userType.label}
                            </span>
                            <span className="sm:hidden text-[9px]">
                              {userType.label.split(" ")[0]}
                            </span>
                            <Badge
                              size="sm"
                              className={`${userType.color} text-[8px] sm:text-xs px-1 py-0.5`}
                            >
                              {userType.key}
                            </Badge>
                          </div>
                        </th>
                      ))}
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-tight sm:tracking-wider min-w-[80px] sm:min-w-[90px] md:min-w-[100px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bundles.map((bundle) => {
                      const bundlePricing = pricingData[bundle._id!];
                      if (!bundlePricing) return null;

                      return (
                        <tr
                          key={bundle._id}
                          className={`hover:bg-gray-50 ${
                            bundlePricing.hasChanges ? "bg-yellow-50" : ""
                          }`}
                        >
                          {/* Bundle Name (Sticky) */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <FaCube className="text-blue-600 flex-shrink-0 text-xs sm:text-sm" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                  {bundle.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                  {bundle.dataVolume} {bundle.dataUnit} •{" "}
                                  {bundle.validity} {bundle.validityUnit}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                            <div className="flex items-center justify-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={bundlePricing.basePrice}
                                onChange={(e) =>
                                  handleBasePriceChange(
                                    bundle._id!,
                                    e.target.value
                                  )
                                }
                                className={`w-full px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs md:text-sm text-center border rounded focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 ${
                                  bundlePricing.hasChanges
                                    ? "border-yellow-400 bg-yellow-50"
                                    : "border-gray-300"
                                }`}
                              />
                            </div>
                          </td>

                          {/* User Type Prices */}
                          {USER_TYPES.map((userType) => {
                            const price =
                              bundlePricing.pricingTiers[userType.key] ||
                              bundlePricing.basePrice;
                            const isEditing =
                              editingCell?.bundleId === bundle._id &&
                              editingCell?.userType === userType.key;

                            return (
                              <td
                                key={userType.key}
                                className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3"
                              >
                                <div className="flex items-center justify-center">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        bundle._id!,
                                        userType.key,
                                        e.target.value
                                      )
                                    }
                                    onFocus={() =>
                                      handleCellClick(bundle._id!, userType.key)
                                    }
                                    onBlur={handleCellBlur}
                                    className={`w-full px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs md:text-sm text-center border rounded transition-all ${
                                      isEditing
                                        ? "ring-1 sm:ring-2 ring-blue-500 border-blue-500"
                                        : bundlePricing.hasChanges
                                        ? "border-yellow-400 bg-yellow-50"
                                        : "border-gray-300"
                                    } focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                              </td>
                            );
                          })}

                          {/* Status */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                            <div className="flex justify-center">
                              {bundlePricing.hasChanges ? (
                                <Badge
                                  colorScheme="warning"
                                  size="sm"
                                  className="text-[9px] sm:text-xs px-1.5 py-0.5"
                                >
                                  <FaEdit className="mr-0.5 sm:mr-1 text-[8px] sm:text-xs" />
                                  <span className="hidden sm:inline">
                                    Modified
                                  </span>
                                  <span className="sm:hidden">Mod</span>
                                </Badge>
                              ) : (
                                <Badge
                                  colorScheme="success"
                                  size="sm"
                                  className="text-[9px] sm:text-xs px-1.5 py-0.5"
                                >
                                  <FaCheckCircle className="mr-0.5 sm:mr-1 text-[8px] sm:text-xs" />
                                  <span className="hidden sm:inline">
                                    Saved
                                  </span>
                                  <span className="sm:hidden">OK</span>
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    Total Bundles
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                    {bundles.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    Modified Bundles
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-yellow-600">
                    {getChangedBundlesCount()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    User Types
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-blue-600">
                    {USER_TYPES.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">
                    Total Prices
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-purple-600">
                    {bundles.length * (USER_TYPES.length + 1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2 sm:gap-4">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <Button
              variant="outline"
              onClick={handleResetAll}
              disabled={saving || loading || getChangedBundlesCount() === 0}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <FaSync className="mr-1 sm:mr-2 text-xs" />
              <span className="hidden sm:inline">Reset All</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              size="sm"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <FaTimes className="mr-1 sm:mr-2 text-xs" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving || loading || getChangedBundlesCount() === 0}
              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-xs sm:text-sm"
              size="sm"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Save...</span>
                </>
              ) : (
                <>
                  <FaSave className="mr-1 sm:mr-2 text-xs" />
                  <span className="hidden sm:inline">
                    Save All Changes ({getChangedBundlesCount()})
                  </span>
                  <span className="sm:hidden">
                    Save ({getChangedBundlesCount()})
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
