// src/services/package.service.ts
import axios from "axios";
import type {
  PackageGroup,
  PackageResponse,
  PackageFilters,
  Pagination,
  PackageItem,
  LowStockAlert,
  PackageAnalytics,
} from "../types/package";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

class PackageService {
  private readonly api = axios.create({
    baseURL: `${API_BASE_URL}/api/packages`,
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

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access - redirecting to login');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Create package
  async createPackage(packageData: Partial<PackageGroup>): Promise<PackageGroup> {
    const response = await this.api.post("/", packageData);
    return response.data.package;
  }

  // Get packages with filtering and pagination
  async getPackages(
    filters: PackageFilters = {},
    pagination: Partial<Pagination> = {}
  ): Promise<PackageResponse> {
    const params = { ...filters, ...pagination };
    const response = await this.api.get("/", { params });
    return response.data;
  }

  // Get single package
  async getPackage(id: string): Promise<PackageGroup> {
    const response = await this.api.get(`/${id}`);
    return response.data.package;
  }

  // Update package
  async updatePackage(
    id: string,
    updateData: Partial<PackageGroup>
  ): Promise<PackageGroup> {
    const response = await this.api.put(`/${id}`, updateData);
    return response.data.package;
  }

  // Soft delete package
  async deletePackage(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  // Restore package
  async restorePackage(id: string): Promise<PackageGroup> {
    const response = await this.api.post(`/${id}/restore`);
    return response.data.package;
  }

  // Add package item
  async addPackageItem(
    packageId: string,
    itemData: Partial<PackageItem>
  ): Promise<PackageItem> {
    const response = await this.api.post(`/${packageId}/items`, itemData);
    return response.data.item;
  }

  // Update package item
  async updatePackageItem(
    packageId: string,
    itemId: string,
    updateData: Partial<PackageItem>
  ): Promise<PackageItem> {
    const response = await this.api.put(
      `/${packageId}/items/${itemId}`,
      updateData
    );
    return response.data.item;
  }

  // Delete package item
  async deletePackageItem(packageId: string, itemId: string): Promise<void> {
    await this.api.delete(`/${packageId}/items/${itemId}`);
  }

  // Bulk inventory update
  async bulkUpdateInventory(
    updates: Array<{ packageId: string; itemId: string; inventory: number }>
  ): Promise<Array<{ packageId: string; itemId: string; inventory: number }>> {
    const response = await this.api.patch("/inventory/bulk", { updates });
    return response.data.results;
  }

  // Reserve stock
  async reserveStock(
    reservations: Array<{ packageId: string; itemId: string; quantity: number }>
  ): Promise<void> {
    await this.api.post("/inventory/reserve", { reservations });
  }

  // Release stock
  async releaseStock(
    reservations: Array<{ packageId: string; itemId: string; quantity: number }>
  ): Promise<void> {
    await this.api.post("/inventory/release", { reservations });
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const response = await this.api.get("/alerts/low-stock");
    return response.data.alerts;
  }

  // Get analytics
  async getAnalytics(timeframe = "30d"): Promise<PackageAnalytics> {
    const response = await this.api.get("/analytics", {
      params: { timeframe },
    });
    return response.data.analytics;
  }
}

export const packageService = new PackageService();
