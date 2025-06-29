export interface ProductVariant {
  _id?: string;
  name: string;
  price: number;
  sku: string;
  inventory?: number;
  reservedInventory?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  provider?: string;
  variants: ProductVariant[];
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}