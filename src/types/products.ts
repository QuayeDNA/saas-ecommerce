// src/types/product.types.ts
export interface ProductAttribute {
  key: string;
  value: string | number | boolean | Date | Array<unknown>;
  label?: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  _id?: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  costPrice?: number;
  inventory: number;
  reservedInventory: number;
  lowStockThreshold: number;
  attributes: ProductAttribute[];
  isActive: boolean;
  images: ProductImage[];
  dataVolume?: number;
  validity?: number;
  network?: Network;
  bundleType?: 'data' | 'voice' | 'sms' | 'combo';
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  availableInventory: number;
}

export interface Product {
  _id?: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subCategory?: ProductSubCategory;
  provider?: Network;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  tenantId: string;
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  salesCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type Network = 'MTN' | 'TELECEL' | 'AT' | 'GLO' | 'Other';
export type ProductCategory = 
  | 'data-bundle'
  | 'voice-bundle'
  | 'sms-bundle'
  | 'combo-bundle'
  | 'physical'
  | 'digital'
  | 'service';
export type ProductSubCategory =
  | 'mobile-data'
  | 'mobile-voice'
  | 'mobile-sms'
  | 'mobile-combo'
  | 'fixed-data'
  | 'fixed-voice'
  | 'fixed-sms'
  | 'fixed-combo';
export type ProductBundleType = 'data' | 'voice' | 'sms' | 'combo' ;

export interface ProductFilters {
  category?: ProductCategory;
  provider?: Network;
  network?: Network;
  bundleType?: ProductBundleType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}

export interface ProductPagination {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ProductResponse {
  success: boolean;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface BulkInventoryUpdate {
  productId: string;
  variantId: string;
  inventory: number;
}

export interface StockReservation {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  variants: {
    variantId: string;
    name: string;
    currentStock: number;
    threshold: number;
  }[];
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  topProducts: {
    name: string;
    salesCount: number;
  }[];
  timeframe: string;
}

export interface BulkImportResult {
  successful: Array<{
    index: number;
    product: Product;
    originalData: unknown;
  }>;
  failed: Array<{
    index: number;
    error: string;
    originalData: unknown;
  }>;
  totalProcessed: number;
}

export interface BulkValidationResult {
  success: boolean;
  valid: boolean;
  totalProducts: number;
  errors: Array<{
    index: number;
    productName: string;
    errors: string[];
  }>;
  products: Partial<Product>[];
}

export interface BulkProductData {
  products?: Partial<Product>[];
  csvData?: string;
}

export interface BulkUpdateData {
  productId: string;
  updateData: Partial<Product>;
}