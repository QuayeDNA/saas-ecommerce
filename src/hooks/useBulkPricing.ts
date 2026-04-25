// hooks/useBulkPricing.ts  ← extract logic into a custom hook
import { useState, useCallback } from "react";
import { bundleService } from "../services/bundle.service";
import type { Bundle } from "../types/package";

const DECIMAL_REGEX = /^[0-9]*\.?[0-9]*$/;

export interface BundlePricingEntry {
  basePrice: string;
  pricingTiers: Record<string, string>;
  hasChanges: boolean;
}

export type PricingMap = Record<string, BundlePricingEntry>;

export function useBulkPricing(bundles: Bundle[]) {
  const [pricingMap, setPricingMap] = useState<PricingMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        bundles.map((b) => bundleService.getBundlePricing(b._id!))
      );
      const map: PricingMap = {};
      results.forEach((res, i) => {
        map[bundles[i]._id!] = {
          basePrice: res.basePrice?.toString() ?? "",
          pricingTiers: Object.fromEntries(
            Object.entries(res.pricingTiers ?? {}).map(([k, v]) => [
              k,
              v?.toString() ?? "",
            ])
          ),
          hasChanges: false,
        };
      });
      setPricingMap(map);
    } finally {
      setLoading(false);
    }
  }, [bundles]);

  const updateField = useCallback(
    (bundleId: string, field: "basePrice" | string, value: string, isTier = false) => {
      if (value !== "" && !DECIMAL_REGEX.test(value)) return;
      setPricingMap((prev) => ({
        ...prev,
        [bundleId]: {
          ...prev[bundleId],
          ...(isTier
            ? {
                pricingTiers: {
                  ...prev[bundleId].pricingTiers,
                  [field]: value,
                },
              }
            : { basePrice: value }),
          hasChanges: true,
        },
      }));
    },
    []
  );

  const resetChanges = useCallback(() => load(), [load]);

  const changedCount = Object.values(pricingMap).filter((d) => d.hasChanges).length;

  const saveAll = useCallback(
    async (): Promise<{ successful: number; failed: number }> => {
      setSaving(true);
      try {
        const changed = Object.entries(pricingMap).filter(([, d]) => d.hasChanges);
        const updates = changed.map(([bundleId, data]) => {
          const basePrice = parseFloat(data.basePrice);
          if (isNaN(basePrice) || basePrice < 0)
            throw new Error("Base price must be a valid positive number");

          const pricingTiers: Record<string, number> = { default: basePrice };
          for (const [k, v] of Object.entries(data.pricingTiers)) {
            const parsed = parseFloat(v);
            if (isNaN(parsed) || parsed < 0)
              throw new Error("Tier prices must be valid positive numbers");
            pricingTiers[k] = parsed;
          }
          return { bundleId, basePrice, pricingTiers };
        });

        const result = await bundleService.bulkUpdatePricing(updates);

        // clear dirty flags
        setPricingMap((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            next[k] = { ...next[k], hasChanges: false };
          });
          return next;
        });

        return { successful: result.successful.length, failed: result.failed.length };
      } finally {
        setSaving(false);
      }
    },
    [pricingMap]
  );

  return { pricingMap, loading, saving, changedCount, load, updateField, resetChanges, saveAll };
}