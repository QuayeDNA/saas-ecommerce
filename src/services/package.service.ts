// src/services/package.service.ts
import { apiClient } from '../utils/api-client';
import type {
  PackageGroup,
  PackageResponse,
  PackageFilters,
  Pagination,
  PackageItem,
  LowStockAlert,
  PackageAnalytics,
} from "../types/package";

class PackageService {
  // Create package
  async createPackage(packageData: Partial<PackageGroup>): Promise<PackageGroup> {
    const response = await apiClient.post('/api/packages', packageData);
    return response.data.package;
  }

  // Get packages with filtering and pagination
  async getPackages(
    filters: PackageFilters = {},
    pagination: Partial<Pagination> = {}
  ): Promise<PackageResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/packages', { params });
    return response.data;
  }

  // Get single package
  async getPackage(id: string): Promise<PackageGroup> {
    const response = await apiClient.get(`/api/packages/${id}`);
    return response.data.package;
  }

  // Update package
  async updatePackage(
    id: string,
    updateData: Partial<PackageGroup>
  ): Promise<PackageGroup> {
    const response = await apiClient.put(`/api/packages/${id}`, updateData);
    return response.data.package;
  }

  // Soft delete package
  async deletePackage(id: string): Promise<void> {
    await apiClient.delete(`/api/packages/${id}`);
  }

  // Restore package
  async restorePackage(id: string): Promise<PackageGroup> {
    const response = await apiClient.post(`/api/packages/${id}/restore`);
    return response.data.package;
  }

  // Add package item
  async addPackageItem(
    packageId: string,
    itemData: Partial<PackageItem>
  ): Promise<PackageItem> {
    const response = await apiClient.post(`/api/packages/${packageId}/items`, itemData);
    return response.data.item;
  }

  // Update package item
  async updatePackageItem(
    packageId: string,
    itemId: string,
    updateData: Partial<PackageItem>
  ): Promise<PackageItem> {
    const response = await apiClient.put(
      `/api/packages/${packageId}/items/${itemId}`,
      updateData
    );
    return response.data.item;
  }

  // Delete package item
  async deletePackageItem(packageId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/api/packages/${packageId}/items/${itemId}`);
  }

  // Bulk inventory update
  async bulkUpdateInventory(
    updates: Array<{ packageId: string; itemId: string; inventory: number }>
  ): Promise<Array<{ packageId: string; itemId: string; inventory: number }>> {
    const response = await apiClient.patch('/api/packages/inventory/bulk', { updates });
    return response.data.results;
  }

  // Reserve stock
  async reserveStock(
    reservations: Array<{ packageId: string; itemId: string; quantity: number }>
  ): Promise<void> {
    await apiClient.post('/api/packages/inventory/reserve', { reservations });
  }

  // Release stock
  async releaseStock(
    reservations: Array<{ packageId: string; itemId: string; quantity: number }>
  ): Promise<void> {
    await apiClient.post('/api/packages/inventory/release', { reservations });
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const response = await apiClient.get('/api/packages/alerts/low-stock');
    return response.data.alerts;
  }

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<PackageAnalytics> {
    const response = await apiClient.get('/api/packages/analytics', {
      params: { timeframe },
    });
    return response.data.analytics;
  }
}

export const packageService = new PackageService();
