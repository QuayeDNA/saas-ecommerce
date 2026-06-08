/**
 * SINGLE SOURCE OF TRUTH for all user type definitions across the frontend.
 * All user type arrays, labels, colors, and helper functions live here.
 * Other files should import from this module instead of defining their own copies.
 */

import type { UserType } from "../types/auth";

// ─── USER TYPE ARRAYS ────────────────────────────────────────────────────────

/** All business user types that can act as agents/tenants */
export const BUSINESS_USER_TYPES: UserType[] = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
  "elite_dealer",
  "master_dealer",
];

/** User types that can have wallets and make transactions */
export const WALLET_ENABLED_USER_TYPES: UserType[] = [...BUSINESS_USER_TYPES];

/** User types that can manage other users (act as tenants) */
export const TENANT_USER_TYPES: UserType[] = [...BUSINESS_USER_TYPES];

/** Admin user types */
export const ADMIN_USER_TYPES: UserType[] = ["admin", "super_admin"];

/** User types that have pricing tiers (used by pricingHelpers) */
export const PRICING_USER_TYPES: UserType[] = [...BUSINESS_USER_TYPES];

// ─── LABELS ──────────────────────────────────────────────────────────────────

/** Human-readable labels for each user type */
export const USER_TYPE_LABELS: Record<UserType, string> = {
  agent: "Agent",
  super_agent: "Super Agent",
  dealer: "Dealer",
  super_dealer: "Super Dealer",
  elite_dealer: "Elite Dealer",
  master_dealer: "Master Dealer",
  subscriber: "Subscriber",
  super_admin: "Super Admin",
  admin: "Admin",
};

/** Get human-readable label for a user type */
export const getUserTypeLabel = (userType?: UserType | string): string => {
  if (!userType) return "Customer";
  return USER_TYPE_LABELS[userType as UserType] || "Customer";
};

// ─── COLORS ──────────────────────────────────────────────────────────────────

/** Color mappings for user type badges/displays */
export const USER_TYPE_COLORS: Record<string, "blue" | "green" | "yellow" | "red" | "gray"> = {
  agent: "blue",
  super_agent: "blue",
  dealer: "green",
  super_dealer: "green",
  elite_dealer: "yellow",
  master_dealer: "red",
  subscriber: "green",
  super_admin: "red",
  admin: "red",
};

/** Get badge color for a user type */
export const getUserTypeColor = (
  userType: string,
): "blue" | "green" | "yellow" | "red" | "gray" => {
  return USER_TYPE_COLORS[userType] || "gray";
};

// ─── ANNOUNCEMENT TARGET AUDIENCE ────────────────────────────────────────────

/** User types available for announcement targeting (excludes subscriber) */
export const ANNOUNCEMENT_TARGET_TYPES: { value: string; label: string }[] = [
  { value: "agent", label: "Agents" },
  { value: "super_agent", label: "Super Agents" },
  { value: "dealer", label: "Dealers" },
  { value: "super_dealer", label: "Super Dealers" },
  { value: "elite_dealer", label: "Elite Dealers" },
  { value: "master_dealer", label: "Master Dealers" },
  { value: "admin", label: "Admins" },
  { value: "public", label: "Public (Storefront Customers)" },
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

/** Check if a user type is a business user (can act as an agent/tenant) */
export const isBusinessUser = (userType: UserType | string): boolean => {
  return BUSINESS_USER_TYPES.includes(userType as UserType);
};

/** Check if a user type can have a wallet */
export const canHaveWallet = (userType: UserType | string): boolean => {
  return WALLET_ENABLED_USER_TYPES.includes(userType as UserType);
};

/** Check if a user type can act as a tenant (manage other users) */
export const isTenantUser = (userType: UserType | string): boolean => {
  return TENANT_USER_TYPES.includes(userType as UserType);
};

/** Check if a user type is an admin */
export const isAdminUser = (userType: UserType | string): boolean => {
  return ADMIN_USER_TYPES.includes(userType as UserType);
};

/** Get the tenant ID for a user based on their type */
export const getTenantId = (
  user: { _id: string; userType: UserType; tenantId?: string } | null
): string | null => {
  if (!user) return null;

  // Business users act as their own tenant
  if (isBusinessUser(user.userType)) {
    return user._id;
  }

  // Other users belong to a tenant
  return user.tenantId || null;
};

/** Check if a user needs agent code generation */
export const needsAgentCode = (userType: UserType | string): boolean => {
  return isBusinessUser(userType);
};

/** Get all business user types for filtering/queries */
export const getBusinessUserTypes = (): UserType[] => {
  return [...BUSINESS_USER_TYPES];
};

/** Get all wallet-enabled user types for filtering/queries */
export const getWalletEnabledUserTypes = (): UserType[] => {
  return [...WALLET_ENABLED_USER_TYPES];
};

/** Get all tenant user types for filtering/queries */
export const getTenantUserTypes = (): UserType[] => {
  return [...TENANT_USER_TYPES];
};

/** Check if user is eligible for business features (orders, packages, etc.) */
export const canAccessBusinessFeatures = (
  userType: UserType | string
): boolean => {
  return isBusinessUser(userType);
};
