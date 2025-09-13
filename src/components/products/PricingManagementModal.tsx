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
import { FaDollarSign, FaUsers, FaSave, FaTimes } from "react-icons/fa";

interface PricingManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleId: string;
  bundleName: string;
  onPricingUpdated?: () => void;
}

type PricingTiers = Record<string, number> & {
  agent: number;
  super_agent: number;
  dealer: number;
  super_dealer: number;
  default: number;
};

const userTypeLabels = {
  agent: "Agent",
  super_agent: "Super Agent",
  dealer: "Dealer",
  super_dealer: "Super Dealer",
  default: "Default Price",
};

const userTypeDescriptions = {
  agent: "Regular agents - standard pricing",
  super_agent: "Senior agents with special pricing",
  dealer: "Dealers with volume discounts",
  super_dealer: "High-volume dealers with maximum discounts",
  default: "Fallback price when no specific pricing is set",
};

const userTypeColors = {
  agent: "bg-blue-100 text-blue-800",
  super_agent: "bg-purple-100 text-purple-800",
  dealer: "bg-green-100 text-green-800",
  super_dealer: "bg-orange-100 text-orange-800",
  default: "bg-gray-100 text-gray-800",
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
    default: 0,
  });
  const [originalPricing, setOriginalPricing] = useState<PricingTiers>({
    agent: 0,
    super_agent: 0,
    dealer: 0,
    super_dealer: 0,
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
        default: data.pricingTiers.default ?? data.basePrice,
      };

      setPricingTiers(pricing);
      setOriginalPricing(pricing);
    } catch (error) {
      console.error("Failed to fetch pricing data:", error);
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
    const numValue = parseFloat(value) || 0;
    setPricingTiers((prev) => ({
      ...prev,
      [userType]: numValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate pricing values
      const invalidPrices = Object.entries(pricingTiers).filter(
        ([, price]) => price < 0
      );
      if (invalidPrices.length > 0) {
        addToast("All prices must be positive numbers", "error");
        return;
      }

      await bundleService.updateBundlePricing(bundleId, pricingTiers);
      addToast("Pricing updated successfully", "success");

      if (onPricingUpdated) {
        onPricingUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Failed to update pricing:", error);
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
      (key) => pricingTiers[key] !== originalPricing[key]
    );
  };

  const calculateDiscount = (userPrice: number) => {
    if (basePrice === 0 || userPrice >= basePrice) return 0;
    return Math.round(((basePrice - userPrice) / basePrice) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaDollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pricing Management
            </h3>
            <p className="text-sm text-gray-600">
              Set user type-specific pricing for "{bundleName}"
            </p>
          </div>
        </div>
      </DialogHeader>

      <DialogBody>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading pricing data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Base Price Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Base Price</h4>
                  <p className="text-sm text-gray-600">
                    The original bundle price set during creation
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(basePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* User Type Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FaUsers className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">User Type Pricing</h4>
              </div>

              <div className="grid gap-4">
                {Object.entries(userTypeLabels).map(([userType, label]) => {
                  const price = pricingTiers[userType];
                  const discount = calculateDiscount(price);

                  return (
                    <div
                      key={userType}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              className={
                                userTypeColors[
                                  userType as keyof typeof userTypeColors
                                ]
                              }
                            >
                              {label}
                            </Badge>
                            {discount > 0 && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                -{discount}% discount
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {
                              userTypeDescriptions[
                                userType as keyof typeof userTypeDescriptions
                              ]
                            }
                          </p>
                        </div>

                        <div className="w-32">
                          <label
                            htmlFor={`price-${userType}`}
                            className="sr-only"
                          >
                            Price for {label}
                          </label>
                          <div className="relative">
                            <Input
                              id={`price-${userType}`}
                              type="number"
                              step="0.01"
                              min="0"
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
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <span className="text-sm text-gray-500">₵</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">
                Pricing Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {Object.entries(pricingTiers).map(([userType, price]) => (
                  <div key={userType} className="flex justify-between">
                    <span className="text-blue-700">
                      {userTypeLabels[userType as keyof typeof userTypeLabels]}:
                    </span>
                    <span className="font-medium text-blue-900">
                      {formatCurrency(price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            {hasChanges() && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="text-gray-600"
              >
                <FaTimes className="w-4 h-4 mr-2" />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  Save Pricing
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
