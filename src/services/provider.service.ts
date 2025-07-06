import axios from "axios";
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5050";

class ProviderService {
  private readonly api = axios.create({
    baseURL: `${API_BASE_URL}/api/providers`,
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

  // Get public providers (no auth required)
  async getPublicProviders(
    filters: ProviderFilters = {},
    pagination: Partial<{ page: number; limit: number }> = {}
  ): Promise<ProviderResponse> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.includeDeleted) params.append('includeDeleted', filters.includeDeleted.toString());
    
    // Add pagination
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    
    const response = await this.api.get(`/public?${params.toString()}`);
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
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.includeDeleted) params.append('includeDeleted', filters.includeDeleted.toString());
    
    // Add pagination
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    
    const response = await this.api.get(`/?${params.toString()}`);
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
    const response = await this.api.get(`/${id}`);
    return response.data.provider;
  }

  // Create provider (super admin only)
  async createProvider(providerData: Partial<Provider>): Promise<Provider> {
    const response = await this.api.post("/", providerData);
    return response.data.provider;
  }

  // Update provider (super admin only)
  async updateProvider(
    id: string,
    updateData: Partial<Provider>
  ): Promise<Provider> {
    const response = await this.api.put(`/${id}`, updateData);
    return response.data.provider;
  }

  // Soft delete provider (super admin only)
  async deleteProvider(id: string): Promise<void> {
    await this.api.delete(`/${id}`);
  }

  // Restore provider (super admin only)
  async restoreProvider(id: string): Promise<Provider> {
    const response = await this.api.post(`/${id}/restore`);
    return response.data.provider;
  }

  // Get provider analytics (super admin only)
  async getAnalytics(): Promise<Record<string, unknown>> {
    const response = await this.api.get("/analytics");
    return response.data.analytics;
  }
}

export const providerService = new ProviderService();