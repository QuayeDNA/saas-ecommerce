import { apiClient } from '../utils/api-client';
import type {
  Provider,
  ProviderFilters,
} from "../types/package";

interface ProviderResponse {
  providers: Provider[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

class ProviderService {
  // Get public providers (no auth required)
  async getPublicProviders(
    filters: ProviderFilters = {},
    pagination: Partial<{ page: number; limit: number }> = {}
  ): Promise<ProviderResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/providers/public', { params });
    return {
      providers: response.data.providers ?? [],
      pagination: response.data.pagination ?? {
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
      }
    };
  }

  // Get providers (auth required)
  async getProviders(
    filters: ProviderFilters = {},
    pagination: Partial<{ page: number; limit: number }> = {}
  ): Promise<ProviderResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/providers', { params });
    return {
      providers: response.data.providers ?? [],
      pagination: response.data.pagination ?? {
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
      }
    };
  }

  // Get single provider (authentication required)
  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get(`/api/providers/${id}`);
    return response.data.provider;
  }

  // Create provider (super admin only)
  async createProvider(providerData: Partial<Provider>): Promise<Provider> {
    const response = await apiClient.post('/api/providers', providerData);
    return response.data.provider;
  }

  // Update provider (super admin only)
  async updateProvider(
    id: string,
    updateData: Partial<Provider>
  ): Promise<Provider> {
    const response = await apiClient.put(`/api/providers/${id}`, updateData);
    return response.data.provider;
  }

  // Soft delete provider (super admin only)
  async deleteProvider(id: string): Promise<void> {
    await apiClient.delete(`/api/providers/${id}`);
  }

  // Restore provider (super admin only)
  async restoreProvider(id: string): Promise<Provider> {
    const response = await apiClient.post(`/api/providers/${id}/restore`);
    return response.data.provider;
  }

  // Get provider analytics (super admin only)
  async getAnalytics(): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/api/providers/analytics');
    return response.data.analytics;
  }
}

export const providerService = new ProviderService();