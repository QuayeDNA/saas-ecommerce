// Frontend pricing utilities to match backend functionality
import type { Bundle } from "../types/package";
import type { UserType } from "../types/auth";

/**
 * User type-based pricing tiers interface
 */
export interface PricingTiers {
  agent?: number;
  super_agent?: number;
  dealer?: number;
  super_dealer?: number;
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
 * Business user types that have specific pricing
 */
export const BUSINESS_USER_TYPES: UserType[] = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
];

/**
 * Get the appropriate price for a user type from a bundle
 * @param bundle - The bundle object
 * @param userType - The user's type
 * @returns The price for the specific user type
 */
export const getPriceForUserType = (
  bundle: Bundle,
  userType?: UserType | string
): number => {
  // If no user type provided or bundle has no pricing tiers, return base price
  if (!userType || !bundle.pricingTiers) {
    return bundle.price;
  }

  const pricingTiers = bundle.pricingTiers as PricingTiers;

  // Business user types that have specific pricing
  if (BUSINESS_USER_TYPES.includes(userType as UserType)) {
    const userPrice = pricingTiers[userType as keyof PricingTiers];
    if (userPrice !== undefined && userPrice !== null) {
      return userPrice;
    }
  }

  // Fall back to default pricing tier, then base price
  if (pricingTiers.default !== undefined && pricingTiers.default !== null) {
    return pricingTiers.default;
  }

  // Final fallback to base price
  return bundle.price;
};

/**
 * Calculate discount percentage compared to base price
 * @param basePrice - Original bundle price
 * @param userPrice - User-specific price
 * @returns Discount percentage (0 if no discount)
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
 * @param items - Array of bundle items with quantities
 * @param userType - User type for pricing
 * @returns Total price
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
 * @param bundle - The bundle to enhance
 * @param userType - User type for pricing
 * @returns Enhanced bundle with pricing information
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
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: GH₵)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = "GH₵"): string => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Get user-friendly label for user type
 * @param userType - User type
 * @returns Human-readable label
 */
export const getUserTypeLabel = (userType?: UserType | string): string => {
  const labels: Record<string, string> = {
    agent: "Agent",
    super_agent: "Super Agent",
    dealer: "Dealer",
    super_dealer: "Super Dealer",
    subscriber: "Subscriber",
    super_admin: "Super Admin",
    admin: "Admin",
  };

  return labels[userType || ""] || "Customer";
};

/**
 * Check if user type qualifies for business pricing
 * @param userType - User type to check
 * @returns True if business user
 */
export const isBusinessUser = (userType?: UserType | string): boolean => {
  return BUSINESS_USER_TYPES.includes(userType as UserType);
};
