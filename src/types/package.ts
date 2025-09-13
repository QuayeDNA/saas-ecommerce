// Package types for the new simplified structure

export interface Package {
  _id?: string;
  name: string;
  description?: string;
  provider: string; // Provider code (MTN, TELECEL, etc.)
  category: "daily" | "weekly" | "monthly" | "unlimited" | "custom";
  isActive: boolean;
  isDeleted: boolean;
  tenantId: string;
  createdBy: string;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bundle {
  _id?: string;
  name: string;
  description?: string;
  dataVolume: number;
  dataUnit: "MB" | "GB" | "TB";
  validity: number | "unlimited";
  validityUnit: "hours" | "days" | "weeks" | "months" | "unlimited";
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
  bundleCode?: string;
  category?: string;
  tags: string[];

  // User type-based pricing
  pricingTiers?: {
    agent?: number;
    super_agent?: number;
    dealer?: number;
    super_dealer?: number;
    default?: number;
  };

  // Relationships
  packageId: string;
  providerId: string;

  // Multi-tenant and audit
  tenantId: string;
  createdBy: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  isAvailable?: boolean;
  formattedDataVolume?: string;
  formattedValidity?: string;

  // Populated fields
  package?: Package;
  provider?: Provider;
}

// Provider interface
export interface Provider {
  _id: string;
  name: string;
  code: "MTN" | "TELECEL" | "AT" | "AFA" | string;
  description?: string;
  logo?: {
    url: string;
    alt: string;
  };
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  salesCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Response interfaces
export interface PackageResponse {
  success: boolean;
  packages: Package[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BundleResponse {
  success: boolean;
  bundles: Bundle[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProviderResponse {
  success: boolean;
  providers: Provider[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// Filter interfaces
export interface PackageFilters {
  search?: string;
  provider?: string;
  category?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface BundleFilters {
  search?: string;
  category?: string;
  providerId?: string;
  packageId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProviderFilters {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Analytics interfaces
export interface BundleAnalytics {
  totalBundles: number;
  activeBundles: number;
  totalValue: number;
  averagePrice: number;
  bundlesByProvider: Array<{
    providerName: string;
    count: number;
  }>;
  bundlesByCategory: Array<{
    category: string;
    count: number;
  }>;
}

export interface PackageAnalytics {
  totalPackages: number;
  activePackages: number;
  providerStats: Array<{
    provider: string;
    packageCount: number;
    activeCount: number;
  }>;
  timeframe: string;
}

// Bundle creation/update interfaces
export interface CreateBundleData {
  name: string;
  description?: string;
  dataVolume: number;
  dataUnit: "MB" | "GB" | "TB";
  validity: number | "unlimited";
  validityUnit: "hours" | "days" | "weeks" | "months" | "unlimited";
  price: number;
  currency?: string;
  features?: string[];
  isActive?: boolean;
  bundleCode?: string;
  category?: string;
  tags?: string[];
  packageId: string;
  providerId?: string;
  providerCode?: string;
}

export interface UpdateBundleData extends Partial<CreateBundleData> {
  isActive?: boolean;
}

// Package creation/update interfaces
export interface CreatePackageData {
  name: string;
  description?: string;
  provider: string;
  category: "daily" | "weekly" | "monthly" | "unlimited" | "custom";
}

export interface UpdatePackageData extends Partial<CreatePackageData> {
  isActive?: boolean;
}

// Legacy types for backward compatibility (to be removed later)
export type PackageGroup = Package;
export type PackageItem = Bundle;
export interface LowStockAlert {
  productId: string;
  productName: string;
  variants: Array<{
    variantId: string;
    name: string;
    currentStock: number;
    threshold: number;
  }>;
}
