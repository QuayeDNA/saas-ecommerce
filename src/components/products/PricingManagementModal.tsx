import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Spinner,
  Badge,
} from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { bundleService } from "../../services/bundle.service";
import { FaDollarSign, FaUsers, FaSave, FaTimes, FaTag } from "react-icons/fa";
import {
  PRICING_USER_TYPES,
  USER_TYPE_LABELS,
} from "../../utils/userTypeHelpers";
import type { UserType } from "../../types/auth";

interface PricingManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleId: string;
  bundleName: string;
  onPricingUpdated?: () => void;
}

type PricingTiers = Record<string, number | string> & {
  [K in UserType]?: number | string;
} & {
  default: number | string;
};

const userTypeDescriptions: Record<string, string> = {
  agent: "Regular agents — standard pricing",
  super_agent: "Senior agents — special pricing",
  dealer: "Dealers — volume discounts",
  super_dealer: "High-volume dealers — maximum discounts",
  elite_dealer: "Elite dealers — premium pricing tier",
  master_dealer: "Master dealers — top-tier pricing",
  default: "Fallback price when no specific pricing is set",
};

const userTypeColors: Record<string, string> = {
  agent: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",
  super_agent: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20",
  dealer: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
  super_dealer: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  elite_dealer: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20",
  master_dealer: "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20",
  default: "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border-[var(--border-color)]",
};

export const PricingManagementModal: React.FC<PricingManagementModalProps> = ({
  isOpen,
  onClose,
  bundleId,
  bundleName,
  onPricingUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>({
    agent: 0,
    super_agent: 0,
    dealer: 0,
    super_dealer: 0,
    elite_dealer: 0,
    master_dealer: 0,
    default: 0,
  });
  const [originalPricing, setOriginalPricing] = useState<PricingTiers>({
    agent: 0,
    super_agent: 0,
    dealer: 0,
    super_dealer: 0,
    elite_dealer: 0,
    master_dealer: 0,
    default: 0,
  });
  const { addToast } = useToast();

  const fetchPricingData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bundleService.getBundlePricing(bundleId);
      setBasePrice(data.basePrice);

      const pricing: PricingTiers = {
        agent: data.pricingTiers.agent ?? data.basePrice,
        super_agent: data.pricingTiers.super_agent ?? data.basePrice,
        dealer: data.pricingTiers.dealer ?? data.basePrice,
        super_dealer: data.pricingTiers.super_dealer ?? data.basePrice,
        elite_dealer: data.pricingTiers.elite_dealer ?? data.basePrice,
        master_dealer: data.pricingTiers.master_dealer ?? data.basePrice,
        default: data.pricingTiers.default ?? data.basePrice,
      };

      setPricingTiers(pricing);
      setOriginalPricing(pricing);
    } catch {
      addToast("Failed to load pricing data", "error");
    } finally {
      setLoading(false);
    }
  }, [bundleId, addToast]);

  useEffect(() => {
    if (isOpen && bundleId) {
      fetchPricingData();
    }
  }, [isOpen, bundleId, fetchPricingData]);

  const handlePriceChange = (userType: keyof PricingTiers, value: string) => {
    if (userType === "default") return;
    setPricingTiers((prev) => ({
      ...prev,
      [userType]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const validatedTiers: Record<string, number> = {};
      for (const [userType, price] of Object.entries(pricingTiers)) {
        if (userType === "default") continue;

        const numericPrice =
          typeof price === "number"
            ? price
            : price.trim() === ""
              ? NaN
              : parseFloat(price);

        if (Number.isNaN(numericPrice) || numericPrice < 0) {
          addToast("All prices must be positive numbers", "error");
          return;
        }

        validatedTiers[userType] = numericPrice;
      }

      await bundleService.updateBundlePricing(bundleId, {
        ...validatedTiers,
        default: basePrice,
      });
      addToast("Pricing updated successfully", "success");

      if (onPricingUpdated) {
        onPricingUpdated();
      }

      onClose();
    } catch (error) {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      addToast(errorMessage || "Failed to update pricing", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPricingTiers(originalPricing);
  };

  const hasChanges = () => {
    return Object.keys(pricingTiers).some(
      (key) => String(pricingTiers[key]) !== String(originalPricing[key])
    );
  };

  const calculateDiscount = (userPrice: number | string) => {
    const numericPrice =
      typeof userPrice === "number"
        ? userPrice
        : userPrice.trim() === ""
          ? 0
          : parseFloat(userPrice);

    if (basePrice === 0 || numericPrice >= basePrice) return 0;
    return Math.round(((basePrice - numericPrice) / basePrice) * 100);
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "number"
        ? amount
        : amount.trim() === ""
          ? 0
          : parseFloat(amount);

    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <FaDollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Pricing Management
            </h3>
            <p className="text-sm text-[var(--text-muted)] truncate">
              Set user type-specific pricing for "{bundleName}"
            </p>
          </div>
        </div>
      </DialogHeader>

      <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-sm text-[var(--text-muted)]">Loading pricing data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Base Price Info */}
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                    <FaTag className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Base Price</h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      The original bundle price set during creation
                    </p>
                  </div>
                </div>
                <div className="text-lg font-bold text-[var(--text-primary)]">
                  {formatCurrency(basePrice)}
                </div>
              </div>
            </div>

            {/* User Type Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <FaUsers className="w-4 h-4" />
                <h4 className="font-medium">User Type Pricing</h4>
              </div>

              <div className="grid gap-3">
                {PRICING_USER_TYPES.map((userType) => {
                    const label = USER_TYPE_LABELS[userType];
                    const price = pricingTiers[userType];
                    const discount = calculateDiscount(price ?? 0);

                    return (
                      <div
                        key={userType}
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge
                                size="sm"
                                className={userTypeColors[userType] || "bg-gray-100 text-gray-800"}
                              >
                                {label}
                              </Badge>
                              {discount > 0 && (
                                <Badge variant="outline" colorScheme="success" size="sm">
                                  -{discount}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">
                              {userTypeDescriptions[userType]}
                            </p>
                          </div>

                          <div className="w-32 shrink-0">
                            <label htmlFor={`price-${userType}`} className="sr-only">
                              Price for {label}
                            </label>
                            <div className="relative">
                              <Input
                                id={`price-${userType}`}
                                type="text"
                                inputMode="decimal"
                                pattern="^\d*\.?\d*$"
                                value={price}
                                onChange={(e) =>
                                  handlePriceChange(
                                    userType as keyof PricingTiers,
                                    e.target.value
                                  )
                                }
                                className="pl-8"
                                placeholder="0.00"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
                                ₵
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Default Price Row */}
              <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge size="sm" className={userTypeColors["default"]}>
                        Default Price
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Base fallback price — always synced to the bundle base price.
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <Input
                      type="text"
                      disabled
                      value={formatCurrency(basePrice)}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
                <h4 className="font-medium text-[var(--color-primary)] mb-3">
                  Pricing Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  {Object.entries(pricingTiers).map(([userType, price]) => (
                    <div key={userType} className="flex items-center justify-between gap-2 rounded-md bg-[var(--bg-surface)] px-3 py-2">
                      <span className="text-[var(--text-secondary)]">
                        {userType === "default" ? "Default Price" : USER_TYPE_LABELS[userType as UserType]}:
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatCurrency(price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div className="flex items-center justify-between w-full">
          <div>
            {hasChanges() && (
              <Button variant="outline" onClick={handleReset} disabled={saving} size="sm">
                <FaTimes className="mr-1.5" />
                Reset
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
            >
              {saving ? (
                <><Spinner size="sm" className="mr-2" />Saving...</>
              ) : (
                <><FaSave className="mr-1.5" />Save Pricing</>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
