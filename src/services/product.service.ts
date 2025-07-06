// src/services/product.service.ts
import { apiClient } from '../utils/api-client';
import type {
  Product,
  ProductResponse,
  ProductFilters,
  ProductPagination,
  BulkInventoryUpdate,
  StockReservation,
  LowStockAlert,
  ProductAnalytics,
  ProductVariant,
  BulkImportResult,
} from "../types/products";

class ProductService {
  // Create product
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await apiClient.post('/api/products', productData);
    return response.data.product;
  }

  // Get products with filtering and pagination
  async getProducts(
    filters: ProductFilters = {},
    pagination: Partial<ProductPagination> = {}
  ): Promise<ProductResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/products', { params });
    return response.data;
  }

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.product;
  }

  // Update product
  async updateProduct(
    id: string,
    updateData: Partial<Product>
  ): Promise<Product> {
    const response = await apiClient.put(`/api/products/${id}`, updateData);
    return response.data.product;
  }

  // Soft delete product
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/api/products/${id}`);
  }

  // Restore product
  async restoreProduct(id: string): Promise<Product> {
    const response = await apiClient.post(`/api/products/${id}/restore`);
    return response.data.product;
  }

  // Bulk inventory update
  async bulkUpdateInventory(
    updates: BulkInventoryUpdate[]
  ): Promise<BulkInventoryUpdate[]> {
    const response = await apiClient.patch('/api/products/inventory/bulk', { updates });
    return response.data.results as BulkInventoryUpdate[];
  }

  // Reserve stock
  async reserveStock(reservations: StockReservation[]): Promise<void> {
    await apiClient.post('/api/products/inventory/reserve', { reservations });
  }

  // Release stock
  async releaseStock(reservations: StockReservation[]): Promise<void> {
    await apiClient.post('/api/products/inventory/release', { reservations });
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const response = await apiClient.get('/api/products/alerts/low-stock');
    return response.data.alerts;
  }

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<ProductAnalytics> {
    const response = await apiClient.get('/api/products/analytics', {
      params: { timeframe },
    });
    return response.data.analytics;
  }

  // Add variant
  async addVariant(
    productId: string,
    variantData: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await apiClient.post(`/api/products/${productId}/variants`, variantData);
    return response.data.variant;
  }

  // Update variant
  async updateVariant(
    productId: string,
    variantId: string,
    updateData: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await apiClient.put(
      `/api/products/${productId}/variants/${variantId}`,
      updateData
    );
    return response.data.variant;
  }

  // Delete variant
  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await apiClient.delete(`/api/products/${productId}/variants/${variantId}`);
  }

  async bulkCreateProducts(data: {
  products?: Product[];
  csvData?: string;
}): Promise<BulkImportResult> {
  const response = await apiClient.post('/api/products/bulk/create', data);
  return response.data as BulkImportResult;
}

  // Bulk update products
  async bulkUpdateProducts(updates: Partial<Product>[]): Promise<Product[]> {
    const response = await apiClient.patch('/api/products/bulk/update', { updates });
    return response.data.results as Product[];
  }

  // Bulk delete products
  async bulkDeleteProducts(productIds: string[]): Promise<Product[]> {
    const response = await apiClient.delete('/api/products/bulk/delete', {
      data: { productIds },
    });
    return response.data.results as Product[];
  }

  // Download bulk import template
  async downloadBulkTemplate(): Promise<void> {
    const response = await apiClient.get('/api/products/bulk/template', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Validate bulk import data
  async validateBulkImport(data: {
    products?: unknown[];
    csvData?: string;
  }): Promise<unknown> {
    const response = await apiClient.post('/api/products/bulk/validate', data);
    return response.data;
  }
}

export const productService = new ProductService();
