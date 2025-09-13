/**
 * Utility functions for handling user types consistently across the frontend
 */

import type { UserType } from "../types/auth";

// Define all business user types that can act as agents/tenants
export const BUSINESS_USER_TYPES: UserType[] = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
];

// Define user types that can have wallets and make transactions
export const WALLET_ENABLED_USER_TYPES: UserType[] = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
];

// Define user types that can manage other users (act as tenants)
export const TENANT_USER_TYPES: UserType[] = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
];

// Define admin user types
export const ADMIN_USER_TYPES: UserType[] = ["admin", "super_admin"];

/**
 * Check if a user type is a business user (can act as an agent/tenant)
 */
export const isBusinessUser = (userType: UserType | string): boolean => {
  return BUSINESS_USER_TYPES.includes(userType as UserType);
};

/**
 * Check if a user type can have a wallet
 */
export const canHaveWallet = (userType: UserType | string): boolean => {
  return WALLET_ENABLED_USER_TYPES.includes(userType as UserType);
};

/**
 * Check if a user type can act as a tenant (manage other users)
 */
export const isTenantUser = (userType: UserType | string): boolean => {
  return TENANT_USER_TYPES.includes(userType as UserType);
};

/**
 * Check if a user type is an admin
 */
export const isAdminUser = (userType: UserType | string): boolean => {
  return ADMIN_USER_TYPES.includes(userType as UserType);
};

/**
 * Get the tenant ID for a user based on their type
 */
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

/**
 * Check if a user needs agent code generation
 */
export const needsAgentCode = (userType: UserType | string): boolean => {
  return isBusinessUser(userType);
};

/**
 * Get all business user types for filtering/queries
 */
export const getBusinessUserTypes = (): UserType[] => {
  return [...BUSINESS_USER_TYPES];
};

/**
 * Get all wallet-enabled user types for filtering/queries
 */
export const getWalletEnabledUserTypes = (): UserType[] => {
  return [...WALLET_ENABLED_USER_TYPES];
};

/**
 * Get all tenant user types for filtering/queries
 */
export const getTenantUserTypes = (): UserType[] => {
  return [...TENANT_USER_TYPES];
};

/**
 * Check if user is eligible for business features (orders, packages, commissions, etc.)
 */
export const canAccessBusinessFeatures = (
  userType: UserType | string
): boolean => {
  return isBusinessUser(userType);
};
