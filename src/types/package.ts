export interface PackageItem {
  _id?: string;
  name: string;
  description?: string;
  code: string;
  price: number;
  costPrice?: number;
  inventory: number;
  reservedInventory: number;
  lowStockThreshold: number;
  isActive: boolean;
  dataVolume: number; // in GB
  validity: number; // in days
  availableInventory?: number; // calculated field
}

export interface PackageGroup {
  _id?: string;
  name: string;
  description?: string;
  slug: string;
  provider: string; // Provider code (MTN, Vodafone, etc.)
  banner?: {
    url: string;
    alt?: string;
  };
  isActive: boolean;
  tags: string[];
  packageItems: PackageItem[];
  tenantId: string;
  createdBy: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Update the Provider interface to match your backend model
export interface Provider {
  _id: string;
  name: string;
  code: 'MTN' | 'TELECEL' | 'AT' | 'GLO';
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
  packageGroups?: PackageGroup[]; // Virtual field
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

export interface PackageFilters {
  search?: string;
  provider?: string;
  minPrice?: number;
  maxPrice?: number;
  minDataVolume?: number;
  maxDataVolume?: number;
  validity?: number;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface ProviderFilters {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PackageResponse {
  success: boolean;
  packages: PackageGroup[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
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

export interface LowStockAlert {
  packageId: string;
  packageName: string;
  items: {
    itemId: string;
    name: string;
    currentStock: number;
    threshold: number;
  }[];
}

export interface PackageAnalytics {
  totalPackages: number;
  activePackages: number;
  lowStockCount: number;
  topPackages: {
    name: string;
    salesCount: number;
  }[];
  timeframe: string;
}
