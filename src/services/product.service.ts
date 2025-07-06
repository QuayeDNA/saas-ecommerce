// src/services/product.service.ts
import axios from "axios";
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5050";

class ProductService {
  private readonly api = axios.create({
    baseURL: `${API_BASE_URL}/api/products`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  constructor() {
    // Add auth token to requests from cookies
    this.api.interceptors.request.use((config) => {
      // Helper to get cookie value by name
      function getCookie(name: string): string | null {
        const match = RegExp(new RegExp("(^| )" + name + "=([^;]+)")).exec(
          document.cookie
        );
        return match ? decodeURIComponent(match[2]) : null;
      }
      const token = getCookie("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
  }

  // Create product
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await this.api.post("/", productData);
    return response.data.product;
  }

  // Get products with filtering and pagination
  async getProducts(
    filters: ProductFilters = {},
    pagination: Partial<ProductPagination> = {}
  ): Promise<ProductResponse> {
    const params = { ...filters, ...pagination };
    const response = await this.api.get("/", { params });
    return response.data;
  }

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/${id}`);
    return response.data.product;
  }

  // Update product
  async updateProduct(
    id: string,
    updateData: Partial<Product>
  ): Promise<Product> {
    const response = await this.api.put(`/${id}`, updateData);
    return response.data.product;
  }

  // Soft delete product
  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  // Restore product
  async restoreProduct(id: string): Promise<Product> {
    const response = await this.api.post(`/${id}/restore`);
    return response.data.product;
  }

  // Bulk inventory update
  async bulkUpdateInventory(
    updates: BulkInventoryUpdate[]
  ): Promise<BulkInventoryUpdate[]> {
    const response = await this.api.patch("/inventory/bulk", { updates });
    return response.data.results as BulkInventoryUpdate[];
  }

  // Reserve stock
  async reserveStock(reservations: StockReservation[]): Promise<void> {
    await this.api.post("/inventory/reserve", { reservations });
  }

  // Release stock
  async releaseStock(reservations: StockReservation[]): Promise<void> {
    await this.api.post("/inventory/release", { reservations });
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const response = await this.api.get("/alerts/low-stock");
    return response.data.alerts;
  }

  // Get analytics
  async getAnalytics(timeframe = "30d"): Promise<ProductAnalytics> {
    const response = await this.api.get("/analytics", {
      params: { timeframe },
    });
    return response.data.analytics;
  }

  // Add variant
  async addVariant(
    productId: string,
    variantData: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await this.api.post(`/${productId}/variants`, variantData);
    return response.data.variant;
  }

  // Update variant
  async updateVariant(
    productId: string,
    variantId: string,
    updateData: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await this.api.put(
      `/${productId}/variants/${variantId}`,
      updateData
    );
    return response.data.variant;
  }

  // Delete variant
  async deleteVariant(productId: string, variantId: string): Promise<void> {
    await this.api.delete(`/${productId}/variants/${variantId}`);
  }

  async bulkCreateProducts(data: {
  products?: Product[];
  csvData?: string;
}): Promise<BulkImportResult> {
  const response = await this.api.post("/bulk/create", data);
  return response.data as BulkImportResult;
}

  // Bulk update products
  async bulkUpdateProducts(updates: Partial<Product>[]): Promise<Product[]> {
    const response = await this.api.patch("/bulk/update", { updates });
    return response.data.results as Product[];
  }

  // Bulk delete products
  async bulkDeleteProducts(productIds: string[]): Promise<Product[]> {
    const response = await this.api.delete("/bulk/delete", {
      data: { productIds },
    });
    return response.data.results as Product[];
  }

  // Download bulk import template
  async downloadBulkTemplate(): Promise<void> {
    const response = await this.api.get("/bulk/template", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Validate bulk import data
  async validateBulkImport(data: {
    products?: unknown[];
    csvData?: string;
  }): Promise<unknown> {
    const response = await this.api.post("/bulk/validate", data);
    return response.data;
  }
}

export const productService = new ProductService();
