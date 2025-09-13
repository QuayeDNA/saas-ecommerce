// src/services/bundle.service.ts
import { apiClient } from "../utils/api-client";
import type {
  Bundle,
  BundleResponse,
  BundleFilters,
  Pagination,
  BundleAnalytics,
  CreateBundleData,
  UpdateBundleData,
} from "../types/package";

class BundleService {
  // Get all bundles with filtering and pagination
  async getBundles(
    filters: BundleFilters = {},
    pagination: Partial<Pagination> = {}
  ): Promise<BundleResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get("/api/bundles", { params });
    return response.data;
  }

  // Get bundle by ID
  async getBundle(id: string): Promise<Bundle> {
    const response = await apiClient.get(`/api/bundles/${id}`);
    return response.data.data;
  }

  // Create bundle
  async createBundle(bundleData: CreateBundleData): Promise<Bundle> {
    const response = await apiClient.post("/api/bundles", bundleData);
    return response.data.data;
  }

  // Update bundle
  async updateBundle(
    id: string,
    updateData: UpdateBundleData
  ): Promise<Bundle> {
    const response = await apiClient.put(`/api/bundles/${id}`, updateData);
    return response.data.data;
  }

  // Delete bundle
  async deleteBundle(id: string): Promise<void> {
    await apiClient.delete(`/api/bundles/${id}`);
  }

  // Get bundles by provider
  async getBundlesByProvider(
    providerId: string,
    pagination?: Partial<Pagination>
  ): Promise<BundleResponse> {
    const params = pagination || {};
    const response = await apiClient.get(
      `/api/bundles/provider/${providerId}`,
      { params }
    );
    return response.data;
  }

  // Get bundles by package
  async getBundlesByPackage(
    packageId: string,
    pagination?: Partial<Pagination>
  ): Promise<BundleResponse> {
    const params = pagination || {};
    const response = await apiClient.get(`/api/bundles/package/${packageId}`, {
      params,
    });
    return response.data;
  }

  // Get bundle analytics
  async getBundleAnalytics(period = "30d"): Promise<BundleAnalytics> {
    const response = await apiClient.get("/api/bundles/analytics/overview", {
      params: { period },
    });
    return response.data.data;
  }

  // Get provider bundle analytics
  async getProviderBundleAnalytics(
    providerId: string,
    period = "30d"
  ): Promise<BundleAnalytics> {
    const response = await apiClient.get(
      `/api/bundles/analytics/provider/${providerId}`,
      {
        params: { period },
      }
    );
    return response.data.data;
  }

  // Bulk create bundles
  async createBulkBundles(bundles: CreateBundleData[]): Promise<{
    created: number;
    failed: number;
    errors: Array<{ bundle: string; error: string }>;
  }> {
    const response = await apiClient.post("/api/bundles/bulk", { bundles });
    return response.data.data;
  }

  // Bulk update bundles
  async updateBulkBundles(
    bundles: Array<{ id: string } & UpdateBundleData>
  ): Promise<{
    updated: number;
    failed: number;
    errors: Array<{ bundleId: string; error: string }>;
  }> {
    const response = await apiClient.put("/api/bundles/bulk/update", {
      bundles,
    });
    return response.data.data;
  }

  // Bulk delete bundles
  async deleteBulkBundles(bundleIds: string[]): Promise<{
    deleted: number;
    failed: number;
    errors: Array<{ bundleId: string; error: string }>;
  }> {
    const response = await apiClient.delete("/api/bundles/bulk/delete", {
      data: { bundleIds },
    });
    return response.data.data;
  }

  // Public bundle access (for storefront)
  async getPublicBundles(
    filters?: BundleFilters,
    pagination?: Partial<Pagination>
  ): Promise<BundleResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get("/api/bundles", { params });
    return response.data;
  }

  // Pricing Management Methods

  // Get bundle pricing tiers
  async getBundlePricing(bundleId: string): Promise<{
    bundleId: string;
    name: string;
    basePrice: number;
    pricingTiers: Record<string, number>;
    lastUpdated: string;
  }> {
    const response = await apiClient.get(`/api/bundles/${bundleId}/pricing`);
    return response.data.data;
  }

  // Update bundle pricing tiers
  async updateBundlePricing(
    bundleId: string,
    pricingTiers: Record<string, number>
  ): Promise<{
    bundleId: string;
    name: string;
    basePrice: number;
    pricingTiers: Record<string, number>;
    lastUpdated: string;
  }> {
    const response = await apiClient.put(`/api/bundles/${bundleId}/pricing`, {
      pricingTiers,
    });
    return response.data.data;
  }

  // Bulk update pricing for multiple bundles
  async bulkUpdatePricing(
    updates: Array<{ bundleId: string; pricingTiers: Record<string, number> }>
  ): Promise<{
    successful: Array<{
      bundleId: string;
      name: string;
      status: string;
      pricingTiers: Record<string, number>;
    }>;
    failed: Array<{
      bundleId: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const response = await apiClient.post("/api/bundles/pricing/bulk-update", {
      updates,
    });
    return response.data.data;
  }
}

export const bundleService = new BundleService();
