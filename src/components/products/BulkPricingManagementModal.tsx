// BulkPricingManagementModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Button, Spinner, Badge, Card,
} from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import {
  FaDollarSign, FaSave, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaSync, FaEdit, FaCube,
  FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import type { Bundle } from "../../types/package";
import { useBulkPricing } from "../../hooks/useBulkPricing";

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_TYPES = [
  { key: "customer", label: "Customer", color: "bg-blue-100 text-blue-800" },
  { key: "agent", label: "Agent", color: "bg-green-100 text-green-800" },
  { key: "super_agent", label: "Super Agent", color: "bg-purple-100 text-purple-800" },
  { key: "dealer", label: "Dealer", color: "bg-orange-100 text-orange-800" },
  { key: "super_dealer", label: "Super Dealer", color: "bg-red-100 text-red-800" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PriceCellProps {
  value: string;
  isEditing: boolean;
  isDirty: boolean;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const PriceCell: React.FC<PriceCellProps> = ({
  value, isEditing, isDirty, onChange, onFocus, onBlur,
}) => (
  <input
    type="text"
    inputMode="decimal"
    pattern="^\d*\.?\d*$"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={onFocus}
    onBlur={onBlur}
    className={[
      "w-full px-2 py-1.5 text-xs text-center border rounded transition-all",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
      isEditing
        ? "border-blue-500 ring-2 ring-blue-500"
        : isDirty
          ? "border-yellow-400 bg-yellow-50"
          : "border-gray-300 hover:border-gray-400",
    ].join(" ")}
  />
);

interface StatusBadgeProps {
  hasChanges: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ hasChanges }) =>
  hasChanges ? (
    <Badge colorScheme="warning" size="sm" className="gap-1">
      <FaEdit className="text-[10px]" />
      <span className="hidden sm:inline">Modified</span>
      <span className="sm:hidden">Mod</span>
    </Badge>
  ) : (
    <Badge colorScheme="success" size="sm" className="gap-1">
      <FaCheckCircle className="text-[10px]" />
      <span className="hidden sm:inline">Saved</span>
      <span className="sm:hidden">OK</span>
    </Badge>
  );

// ─── Main Component ───────────────────────────────────────────────────────────

interface BulkPricingManagementModalProps {
  packageId: string;
  packageName: string;
  bundles: Bundle[];
  isOpen: boolean;
  onClose: () => void;
  onPricingUpdated: () => void;
}

export const BulkPricingManagementModal: React.FC<BulkPricingManagementModalProps> = ({
  packageName, bundles, isOpen, onClose, onPricingUpdated,
}) => {
  const { addToast } = useToast();
  const { pricingMap, loading, saving, changedCount, load, updateField, resetChanges, saveAll } =
    useBulkPricing(bundles);
  const [activeCell, setActiveCell] = useState<{ bundleId: string; col: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isOpen && bundles.length > 0) {
      load().catch(() => addToast("Failed to load pricing data", "error"));
    }
  }, [isOpen, bundles, load, addToast]);

  const handleSave = async () => {
    if (changedCount === 0) {
      return addToast("No changes to save", "info");
    }

    try {
      const { successful, failed } = await saveAll();

      if (failed > 0) {
        addToast(`Updated ${successful} bundles, ${failed} failed`, "warning");
      } else {
        addToast(`Successfully updated ${successful} bundles`, "success");
      }

      onPricingUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save pricing changes";
      addToast(msg, "error");
    }
  };

  const handleReset = () => {
    resetChanges().catch(() => addToast("Failed to reset changes", "error"));
    addToast("All changes have been reset", "info");
  };

  const isCellActive = (bundleId: string, col: string) =>
    activeCell?.bundleId === bundleId && activeCell?.col === col;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full">
      {/* ── Header ── */}
      <DialogHeader>
        <div className="flex flex-wrap items-start justify-between gap-2 w-full">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <FaDollarSign className="text-green-600 shrink-0" />
              Bulk Pricing Management
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {packageName} · {bundles.length} bundles · {USER_TYPES.length} user types
            </p>
          </div>
          {changedCount > 0 && (
            <Badge colorScheme="warning" size="sm">
              {changedCount} Modified
            </Badge>
          )}
        </div>
      </DialogHeader>

      {/* ── Body ── */}
      <DialogBody>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
            <Spinner size="lg" />
            <span className="text-sm">Loading pricing data…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instructions accordion */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden text-sm">
              <button
                onClick={() => setShowInstructions((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-100 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-blue-800">
                  <FaExclamationTriangle className="text-blue-500 text-xs shrink-0" />
                  How to use
                </span>
                {showInstructions
                  ? <FaChevronUp className="text-blue-500 text-xs" />
                  : <FaChevronDown className="text-blue-500 text-xs" />}
              </button>
              {showInstructions && (
                <ul className="px-4 pb-3 pt-2 border-t border-blue-200 list-disc list-inside space-y-1 text-xs text-blue-800">
                  <li>Click any price cell to edit it inline</li>
                  <li>Modified rows turn yellow — easy to spot changes at a glance</li>
                  <li>"Save All Changes" persists every modified bundle at once</li>
                  <li>"Reset All" discards all unsaved edits</li>
                </ul>
              )}
            </div>

            {/* Pricing table */}
            <Card noPadding>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {/* Bundle column — sticky on mobile too */}
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-600 uppercase tracking-wide sticky left-0 bg-gray-50 z-20 min-w-[140px] sm:min-w-[220px]">
                        Bundle
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-600 uppercase tracking-wide min-w-[90px]">
                        Base Price
                      </th>
                      {USER_TYPES.map(({ key, label, color }) => (
                        <th key={key} className="px-3 py-2.5 text-center font-semibold text-gray-600 uppercase tracking-wide min-w-[110px]">
                          <div className="flex flex-col items-center gap-1">
                            <span>{label}</span>
                            <Badge size="sm" className={color}>{key}</Badge>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {bundles.map((bundle) => {
                      const pricing = pricingMap[bundle._id!];
                      if (!pricing) return null;
                      const rowClass = pricing.hasChanges
                        ? "bg-yellow-50 hover:bg-yellow-100"
                        : "hover:bg-gray-50";

                      return (
                        <tr key={bundle._id} className={`transition-colors ${rowClass}`}>
                          {/* Bundle info — sticky */}
                          <td className="px-3 py-2.5 sticky left-0 z-10 bg-white shadow-[0_0_0_1px_rgba(229,231,235,0.75)]">
                            <div className="flex items-center gap-2">
                              <FaCube className="text-blue-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{bundle.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {bundle.dataVolume}{bundle.dataUnit} · {bundle.validity}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Base price */}
                          <td className="px-3 py-2.5">
                            <PriceCell
                              value={pricing.basePrice}
                              isDirty={pricing.hasChanges}
                              isEditing={isCellActive(bundle._id!, "base")}
                              onChange={(v) => updateField(bundle._id!, "basePrice", v)}
                              onFocus={() => setActiveCell({ bundleId: bundle._id!, col: "base" })}
                              onBlur={() => setActiveCell(null)}
                            />
                          </td>

                          {/* Per-user-type tiers */}
                          {USER_TYPES.map(({ key }) => {
                            const tierValue =
                              pricing.pricingTiers[key] !== undefined
                                ? pricing.pricingTiers[key]
                                : pricing.basePrice;
                            return (
                              <td key={key} className="px-3 py-2.5">
                                <PriceCell
                                  value={tierValue}
                                  isDirty={pricing.hasChanges}
                                  isEditing={isCellActive(bundle._id!, key)}
                                  onChange={(v) => updateField(bundle._id!, key, v, true)}
                                  onFocus={() => setActiveCell({ bundleId: bundle._id!, col: key })}
                                  onBlur={() => setActiveCell(null)}
                                />
                              </td>
                            );
                          })}

                          {/* Status */}
                          <td className="px-3 py-2.5">
                            <div className="flex justify-center">
                              <StatusBadge hasChanges={pricing.hasChanges} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {[
                { label: "Total Bundles", value: bundles.length, cls: "text-gray-900" },
                { label: "Modified", value: changedCount, cls: "text-yellow-600" },
                { label: "User Types", value: USER_TYPES.length, cls: "text-blue-600" },
                { label: "Total Prices", value: bundles.length * (USER_TYPES.length + 1), cls: "text-purple-600" },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className={`text-base sm:text-lg font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogBody>

      {/* ── Footer ── */}
      <DialogFooter>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
          {/* Left: Reset */}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving || loading || changedCount === 0}
            size="sm"
          >
            <FaSync className="mr-2 text-xs" />
            Reset All
          </Button>

          {/* Right: Cancel + Save */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving} size="sm" className="flex-1 sm:flex-none">
              <FaTimes className="mr-2 text-xs" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || loading || changedCount === 0}
              className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              size="sm"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving…
                </>
              ) : (
                <>
                  <FaSave className="mr-2 text-xs" />
                  Save Changes {changedCount > 0 && `(${changedCount})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};