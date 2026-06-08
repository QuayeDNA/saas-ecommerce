// Frontend pricing utilities to match backend functionality
// Imports user type data from userTypeHelpers (single source of truth)
import type { Bundle } from "../types/package";
import type { UserType } from "../types/auth";
import {
  BUSINESS_USER_TYPES,
  getUserTypeLabel as _getUserTypeLabel,
  isBusinessUser as _isBusinessUser,
} from "./userTypeHelpers";

// Re-export for backward compatibility (other files may import from here)
export { BUSINESS_USER_TYPES } from "./userTypeHelpers";
export const getUserTypeLabel = _getUserTypeLabel;
export const isBusinessUser = _isBusinessUser;

/**
 * User type-based pricing tiers interface
 */
export interface PricingTiers {
  agent?: number;
  super_agent?: number;
  dealer?: number;
  super_dealer?: number;
  elite_dealer?: number;
  master_dealer?: number;
  default?: number;
}

/**
 * Enhanced bundle with user-specific pricing
 */
export interface BundleWithPricing extends Bundle {
  userPrice?: number;
  pricingTiers?: PricingTiers;
  originalPrice?: number;
  discount?: number;
  discountPercentage?: number;
}

/**
 * Get the appropriate price for a user type from a bundle
 */
export const getPriceForUserType = (
  bundle: Bundle,
  userType?: UserType | string
): number => {
  if (!userType || !bundle.pricingTiers) {
    return bundle.price;
  }

  const pricingTiers = bundle.pricingTiers as PricingTiers;

  if (BUSINESS_USER_TYPES.includes(userType as UserType)) {
    const userPrice = pricingTiers[userType as keyof PricingTiers];
    if (userPrice !== undefined && userPrice !== null) {
      return userPrice;
    }
  }

  if (pricingTiers.default !== undefined && pricingTiers.default !== null) {
    return pricingTiers.default;
  }

  return bundle.price;
};

/**
 * Calculate discount percentage compared to base price
 */
export const calculateDiscountPercentage = (
  basePrice: number,
  userPrice: number
): number => {
  if (basePrice === 0 || userPrice >= basePrice) return 0;
  return Math.round(((basePrice - userPrice) / basePrice) * 100);
};

/**
 * Calculate total price for multiple bundles with quantities
 */
export const calculateTotalPrice = (
  items: Array<{ bundle: Bundle; quantity: number }>,
  userType?: UserType | string
): number => {
  return items.reduce((total, item) => {
    const unitPrice = getPriceForUserType(item.bundle, userType);
    return total + unitPrice * item.quantity;
  }, 0);
};

/**
 * Enhance a bundle with user-specific pricing information
 */
export const enhanceBundleWithPricing = (
  bundle: Bundle,
  userType?: UserType | string
): BundleWithPricing => {
  const userPrice = getPriceForUserType(bundle, userType);
  const discount = bundle.price - userPrice;
  const discountPercentage = calculateDiscountPercentage(
    bundle.price,
    userPrice
  );

  return {
    ...bundle,
    userPrice,
    originalPrice: bundle.price,
    discount: discount > 0 ? discount : 0,
    discountPercentage,
  };
};

/**
 * Format currency amount (Ghanaian Cedis)
 */
export const formatCurrency = (amount: number, currency = "GH₵"): string => {
  return `${currency}${amount.toFixed(2)}`;
};
