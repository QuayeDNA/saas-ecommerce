// src/services/storefront.service.ts
import axios from 'axios';
import type {
  Storefront,
  StorefrontOrder,
  StorefrontProductFilters
} from '../types/storefront';
import type { Product } from '../types/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';

class StorefrontService {
  private readonly api = axios.create({
    baseURL: `${API_BASE_URL}/api/storefront`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add auth token to requests from cookies
    this.api.interceptors.request.use((config) => {
      // Helper to get cookie value by name
      function getCookie(name: string): string | null {
        const match = RegExp(new RegExp('(^| )' + name + '=([^;]+)')).exec(document.cookie);
        return match ? decodeURIComponent(match[2]) : null;
      }
      const token = getCookie('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
  }

  // Agent methods (protected)
  async createStorefront(storefrontData: Partial<Storefront>): Promise<Storefront> {
    const response = await this.api.post('/', storefrontData);
    return response.data.storefront;
  }

  async updateStorefront(storefrontData: Partial<Storefront>): Promise<Storefront> {
    const response = await this.api.put('/', storefrontData);
    return response.data.storefront;
  }

  async getMyStorefront(): Promise<Storefront | null> {
    try {
      const response = await this.api.get('/my-storefront');
      return response.data.storefront;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getStorefrontAnalytics(timeframe = '30d'): Promise<Record<string, unknown>> {
    const response = await this.api.get('/analytics', { params: { timeframe } });
    return response.data.analytics;
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    const response = await this.api.get(`/check-slug/${slug}`);
    return response.data.available;
  }

  async toggleStorefrontStatus(): Promise<Storefront> {
    const response = await this.api.patch('/toggle-status');
    return response.data.storefront;
  }

  // Public methods (no auth required)
  async getPublicStorefront(slug: string): Promise<Storefront> {
    const response = await this.api.get(`/public/${slug}`);
    return response.data.storefront;
  }

  async getStorefrontProducts(
    slug: string,
    filters: StorefrontProductFilters = {},
    pagination = { page: 1, limit: 20 }
  ): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number } }> {
    const params = { ...filters, ...pagination };
    const response = await this.api.get(`/public/${slug}/products`, { params });
    return response.data;
  }

  async createStorefrontOrder(slug: string, orderData: StorefrontOrder): Promise<StorefrontOrder> {
    const response = await this.api.post(`/public/${slug}/orders`, orderData);
    return response.data.order as StorefrontOrder;
  }
}

export const storefrontService = new StorefrontService();
