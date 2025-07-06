// src/services/storefront.service.ts
import { apiClient } from '../utils/api-client';
import type {
  Storefront,
  StorefrontOrder,
  StorefrontProductFilters
} from '../types/storefront';
import type { Product } from '../types/products';

class StorefrontService {
  // Agent methods (protected)
  async createStorefront(storefrontData: Partial<Storefront>): Promise<Storefront> {
    const response = await apiClient.post('/api/storefront', storefrontData);
    return response.data.storefront;
  }

  async updateStorefront(storefrontData: Partial<Storefront>): Promise<Storefront> {
    const response = await apiClient.put('/api/storefront', storefrontData);
    return response.data.storefront;
  }

  async getMyStorefront(): Promise<Storefront | null> {
    try {
      const response = await apiClient.get('/api/storefront/my-storefront');
      return response.data.storefront;
    } catch (error: unknown) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getStorefrontAnalytics(timeframe = '30d'): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/api/storefront/analytics', { params: { timeframe } });
    return response.data.analytics;
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    const response = await apiClient.get(`/api/storefront/check-slug/${slug}`);
    return response.data.available;
  }

  async toggleStorefrontStatus(): Promise<Storefront> {
    const response = await apiClient.patch('/api/storefront/toggle-status');
    return response.data.storefront;
  }

  // Public methods (no auth required)
  async getPublicStorefront(slug: string): Promise<Storefront> {
    const response = await apiClient.get(`/api/storefront/public/${slug}`);
    return response.data.storefront;
  }

  async getStorefrontProducts(
    slug: string,
    filters: StorefrontProductFilters = {},
    pagination = { page: 1, limit: 20 }
  ): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number } }> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get(`/api/storefront/public/${slug}/products`, { params });
    return response.data;
  }

  async createStorefrontOrder(slug: string, orderData: StorefrontOrder): Promise<StorefrontOrder> {
    const response = await apiClient.post(`/api/storefront/public/${slug}/orders`, orderData);
    return response.data.order as StorefrontOrder;
  }
}

export const storefrontService = new StorefrontService();
