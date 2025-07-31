// src/services/package.service.ts
import { apiClient } from '../utils/api-client';
import type {
  Package,
  Bundle,
  PackageResponse,
  BundleResponse,
  PackageFilters,
  BundleFilters,
  Pagination,
  PackageAnalytics,
  BundleAnalytics,
  CreatePackageData,
  UpdatePackageData,
  CreateBundleData,
  UpdateBundleData,
} from "../types/package";

class PackageService {
  // Package operations
  async createPackage(packageData: CreatePackageData): Promise<Package> {
    const response = await apiClient.post('/api/packages', packageData);
    return response.data.data;
  }

  async getPackages(
    filters: PackageFilters = {},
    pagination: Partial<Pagination> = {}
  ): Promise<PackageResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/packages', { params });
    return response.data;
  }

  async getPackage(id: string): Promise<Package> {
    const response = await apiClient.get(`/api/packages/${id}`);
    return response.data.data;
  }

  async updatePackage(
    id: string,
    updateData: UpdatePackageData
  ): Promise<Package> {
    const response = await apiClient.put(`/api/packages/${id}`, updateData);
    return response.data.data;
  }

  async deletePackage(id: string): Promise<void> {
    await apiClient.delete(`/api/packages/${id}`);
  }

  async restorePackage(id: string): Promise<Package> {
    const response = await apiClient.post(`/api/packages/${id}/restore`);
    return response.data.data;
  }

  async getPackagesByProvider(provider: string): Promise<Package[]> {
    const response = await apiClient.get(`/api/packages/provider/${provider}`);
    return response.data.packages;
  }

  async getPackagesByCategory(category: string): Promise<Package[]> {
    const response = await apiClient.get(`/api/packages/category/${category}`);
    return response.data.packages;
  }

  async getPackageStats(): Promise<PackageAnalytics> {
    const response = await apiClient.get('/api/packages/stats/summary');
    return response.data.analytics;
  }

  // Bundle operations
  async createBundle(bundleData: CreateBundleData): Promise<Bundle> {
    const response = await apiClient.post('/api/bundles', bundleData);
    return response.data.data;
  }

  async getBundles(
    filters: BundleFilters = {},
    pagination: Partial<Pagination> = {}
  ): Promise<BundleResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/bundles', { params });
    return response.data;
  }

  async getBundle(id: string): Promise<Bundle> {
    const response = await apiClient.get(`/api/bundles/${id}`);
    return response.data.data;
  }

  async updateBundle(
    id: string,
    updateData: UpdateBundleData
  ): Promise<Bundle> {
    const response = await apiClient.put(`/api/bundles/${id}`, updateData);
    return response.data.data;
  }

  async deleteBundle(id: string): Promise<void> {
    await apiClient.delete(`/api/bundles/${id}`);
  }

  async getBundlesByProvider(providerId: string, pagination?: Partial<Pagination>): Promise<BundleResponse> {
    const params = pagination || {};
    const response = await apiClient.get(`/api/bundles/provider/${providerId}`, { params });
    return response.data;
  }

  async getBundlesByPackage(packageId: string, pagination?: Partial<Pagination>): Promise<BundleResponse> {
    const params = pagination || {};
    const response = await apiClient.get(`/api/bundles/package/${packageId}`, { params });
    return response.data;
  }

  async getBundleAnalytics(period = '30d'): Promise<BundleAnalytics> {
    const response = await apiClient.get('/api/bundles/analytics/overview', {
      params: { period }
    });
    return response.data.data;
  }

  async getProviderBundleAnalytics(providerId: string, period = '30d'): Promise<BundleAnalytics> {
    const response = await apiClient.get(`/api/bundles/analytics/provider/${providerId}`, {
      params: { period }
    });
    return response.data.data;
  }

  // Bulk operations for bundles
  async createBulkBundles(bundles: CreateBundleData[]): Promise<{
    created: number;
    failed: number;
    errors: Array<{ bundle: string; error: string }>;
  }> {
    const response = await apiClient.post('/api/bundles/bulk', { bundles });
    return response.data.data;
  }

  async updateBulkBundles(bundles: Array<{ id: string } & UpdateBundleData>): Promise<{
    updated: number;
    failed: number;
    errors: Array<{ bundleId: string; error: string }>;
  }> {
    const response = await apiClient.put('/api/bundles/bulk/update', { bundles });
    return response.data.data;
  }

  async deleteBulkBundles(bundleIds: string[]): Promise<{
    deleted: number;
    failed: number;
    errors: Array<{ bundleId: string; error: string }>;
  }> {
    const response = await apiClient.delete('/api/bundles/bulk/delete', { data: { bundleIds } });
    return response.data.data;
  }

  // Public bundle access (for storefront)
  async getPublicBundles(filters?: BundleFilters, pagination?: Partial<Pagination>): Promise<BundleResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/bundles', { params });
    return response.data;
  }

  // Legacy methods for backward compatibility (to be removed later)
  async getAllPackageItems(provider?: string) {
    const params: Record<string, string> = {};
    if (provider) params.provider = provider;
    const response = await apiClient.get('/api/packages/public/bundles', { params });
    return response.data.bundles;
  }

  async getLowStockAlerts(): Promise<unknown[]> {
    // This endpoint doesn't exist in the new structure, return empty array
    return [];
  }

  async getAnalytics(timeframe = '30d'): Promise<PackageAnalytics> {
    const response = await apiClient.get('/api/packages/analytics', {
      params: { timeframe },
    });
    return response.data.analytics;
  }
}

export const packageService = new PackageService();
